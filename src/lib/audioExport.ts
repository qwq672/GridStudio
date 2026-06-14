// 音频导出服务
// 支持 WAV、MP3、FLAC、AAC 格式

import type { ExportOptions, ExportProgress } from '../types/audio';

// 动态导入 lamejs（MP3 编码器）
let lamejs: any = null;
const loadLamejs = async () => {
  if (!lamejs) {
    const module = await import('lamejs');
    lamejs = module.default || module;
  }
  return lamejs;
};

/**
 * 渲染 MIDI 数据为音频缓冲区
 */
export async function renderAudioBuffer(
  tracks: any[],
  bpm: number,
  sf2Data: any,
  onProgress?: (progress: ExportProgress) => void
): Promise<AudioBuffer> {
  // 计算总时长
  let maxTime = 0;
  tracks.forEach(track => {
    if (track.mute) return;
    track.notes.forEach(note => {
      const endTime = note.startSec + note.durationSec;
      if (endTime > maxTime) maxTime = endTime;
    });
  });

  const totalDuration = maxTime + 1; // 加 1 秒余音
  const sampleRate = 44100;
  const totalSamples = Math.ceil(totalDuration * sampleRate);

  // 创建离线 AudioContext
  const offlineCtx = new OfflineAudioContext(2, totalSamples, sampleRate);

  // 收集所有音符事件
  const events: any[] = [];
  tracks.forEach(track => {
    if (track.mute) return;
    track.notes.forEach(note => {
      events.push({
        time: note.startSec,
        duration: note.durationSec,
        pitch: note.pitch,
        velocity: note.velocity,
        program: track.program,
      });
    });
  });
  events.sort((a, b) => a.time - b.time);

  // 渲染每个音符
  const totalEvents = events.length;
  let processedEvents = 0;

  for (const event of events) {
    const whenSec = event.time;
    const duration = event.duration;
    const velocity = event.velocity;
    const program = event.program;

    // 尝试使用 SF2 样本
    if (sf2Data && sf2Data.presets) {
      const preset = sf2Data.presets.find((p: any) => p.program === program) || sf2Data.presets[0];
      if (preset && preset.samples && preset.samples.length > 0) {
        const midi = noteToMidi(event.pitch);
        let bestSample = preset.samples[0];
        let minDist = Infinity;
        
        for (const sample of preset.samples) {
          const dist = Math.abs((sample.rootKey || 60) - midi);
          if (dist < minDist) {
            minDist = dist;
            bestSample = sample;
          }
        }

        if (bestSample.buffer) {
          const source = offlineCtx.createBufferSource();
          source.buffer = bestSample.buffer;
          const rootKey = bestSample.rootKey || 60;
          source.playbackRate.value = Math.pow(2, (midi - rootKey) / 12);

          const gain = offlineCtx.createGain();
          const vol = (velocity / 127) * 0.3;
          gain.gain.setValueAtTime(0.0001, whenSec);
          gain.gain.setTargetAtTime(vol, whenSec, 0.008);
          gain.gain.setTargetAtTime(0.0001, whenSec + duration, 0.015);

          source.connect(gain);
          gain.connect(offlineCtx.destination);

          source.start(whenSec);
          source.stop(whenSec + duration + 0.1);
        }
      }
    }

    processedEvents++;
    if (onProgress && processedEvents % 10 === 0) {
      onProgress({
        current: processedEvents,
        total: totalEvents,
        stage: 'rendering',
      });
    }
  }

  // 渲染音频
  const renderedBuffer = await offlineCtx.startRendering();
  
  if (onProgress) {
    onProgress({
      current: totalEvents,
      total: totalEvents,
      stage: 'rendering',
    });
  }

  return renderedBuffer;
}

/**
 * 导出为 WAV 格式
 */
export function exportToWav(audioBuffer: AudioBuffer): Blob {
  const numChannels = audioBuffer.numberOfChannels;
  const sampleRate = audioBuffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;

  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;
  const dataSize = audioBuffer.length * blockAlign;
  const bufferSize = 44 + dataSize;

  const buffer = new ArrayBuffer(bufferSize);
  const view = new DataView(buffer);

  // WAV 头
  writeString(view, 0, 'RIFF');
  view.setUint32(4, bufferSize - 8, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, format, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);
  writeString(view, 36, 'data');
  view.setUint32(40, dataSize, true);

  // 写入音频数据
  const channels: Float32Array[] = [];
  for (let i = 0; i < numChannels; i++) {
    channels.push(audioBuffer.getChannelData(i));
  }

  let offset = 44;
  for (let i = 0; i < audioBuffer.length; i++) {
    for (let channel = 0; channel < numChannels; channel++) {
      const sample = Math.max(-1, Math.min(1, channels[channel][i]));
      const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
      view.setInt16(offset, intSample, true);
      offset += 2;
    }
  }

  return new Blob([buffer], { type: 'audio/wav' });
}

/**
 * 导出为 MP3 格式
 */
export async function exportToMp3(
  audioBuffer: AudioBuffer,
  bitrate: number = 192,
  onProgress?: (progress: ExportProgress) => void
): Promise<Blob> {
  const lame = await loadLamejs();
  const numChannels = audioBuffer.numberOfChannels;
  const sampleRate = audioBuffer.sampleRate;
  
  const mp3encoder = new lame.Mp3Encoder(numChannels, sampleRate, bitrate);
  const mp3Data: Uint8Array[] = [];

  const left = audioBuffer.getChannelData(0);
  const right = numChannels > 1 ? audioBuffer.getChannelData(1) : left;

  const sampleBlockSize = 1152;
  const totalBlocks = Math.ceil(left.length / sampleBlockSize);

  for (let i = 0; i < left.length; i += sampleBlockSize) {
    const leftChunk = left.slice(i, i + sampleBlockSize);
    const rightChunk = right.slice(i, i + sampleBlockSize);

    const leftInt16 = floatTo16BitPCM(leftChunk);
    const rightInt16 = floatTo16BitPCM(rightChunk);

    const mp3buf = mp3encoder.encodeBuffer(leftInt16, rightInt16);
    if (mp3buf.length > 0) {
      mp3Data.push(mp3buf);
    }

    if (onProgress) {
      const currentBlock = Math.floor(i / sampleBlockSize);
      onProgress({
        current: currentBlock,
        total: totalBlocks,
        stage: 'encoding',
      });
    }
  }

  const end = mp3encoder.flush();
  if (end.length > 0) {
    mp3Data.push(end);
  }

  if (onProgress) {
    onProgress({
      current: totalBlocks,
      total: totalBlocks,
      stage: 'encoding',
    });
  }

  return new Blob(mp3Data, { type: 'audio/mp3' });
}

/**
 * 导出为 FLAC 格式（使用浏览器原生 API，如果支持）
 */
export async function exportToFlac(audioBuffer: AudioBuffer): Promise<Blob> {
  // 尝试使用 MediaRecorder（如果浏览器支持 FLAC）
  if (typeof MediaRecorder !== 'undefined') {
    const stream = new MediaStream();
    const source = new AudioContext().createBufferSource();
    source.buffer = audioBuffer;
    const dest = new AudioContext().createMediaStreamDestination();
    source.connect(dest);
    
    // 检查是否支持 FLAC
    const types = [
      'audio/flac',
      'audio/x-flac',
      'audio/ogg; codecs=flac',
    ];
    
    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        const recorder = new MediaRecorder(dest.stream, { mimeType: type });
        const chunks: Blob[] = [];
        
        return new Promise((resolve, reject) => {
          recorder.ondataavailable = (e) => chunks.push(e.data);
          recorder.onstop = () => resolve(new Blob(chunks, { type }));
          recorder.onerror = reject;
          
          source.start();
          recorder.start();
          setTimeout(() => recorder.stop(), audioBuffer.duration * 1000 + 100);
        });
      }
    }
  }

  // 降级到 WAV（如果 FLAC 不支持）
  console.warn('FLAC not supported, falling back to WAV');
  return exportToWav(audioBuffer);
}

/**
 * 导出为 AAC 格式（使用浏览器原生 API）
 */
export async function exportToAac(audioBuffer: AudioBuffer): Promise<Blob> {
  // 尝试使用 MediaRecorder
  if (typeof MediaRecorder !== 'undefined') {
    const stream = new MediaStream();
    const source = new AudioContext().createBufferSource();
    source.buffer = audioBuffer;
    const dest = new AudioContext().createMediaStreamDestination();
    source.connect(dest);
    
    const types = [
      'audio/aac',
      'audio/mp4',
      'audio/m4a',
    ];
    
    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        const recorder = new MediaRecorder(dest.stream, { mimeType: type });
        const chunks: Blob[] = [];
        
        return new Promise((resolve, reject) => {
          recorder.ondataavailable = (e) => chunks.push(e.data);
          recorder.onstop = () => resolve(new Blob(chunks, { type }));
          recorder.onerror = reject;
          
          source.start();
          recorder.start();
          setTimeout(() => recorder.stop(), audioBuffer.duration * 1000 + 100);
        });
      }
    }
  }

  // 降级到 WAV
  console.warn('AAC not supported, falling back to WAV');
  return exportToWav(audioBuffer);
}

/**
 * 主导出函数
 */
export async function exportAudio(
  tracks: any[],
  bpm: number,
  sf2Data: any,
  options: ExportOptions,
  onProgress?: (progress: ExportProgress) => void
): Promise<Blob> {
  // 渲染音频缓冲区
  const audioBuffer = await renderAudioBuffer(tracks, bpm, sf2Data, onProgress);

  // 根据格式导出
  switch (options.format) {
    case 'wav':
      return exportToWav(audioBuffer);
    case 'mp3':
      return exportToMp3(audioBuffer, options.bitrate || 192, onProgress);
    case 'flac':
      return exportToFlac(audioBuffer);
    case 'aac':
      return exportToAac(audioBuffer);
    default:
      throw new Error(`Unsupported format: ${options.format}`);
  }
}

// 辅助函数

function writeString(view: DataView, offset: number, string: string): void {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

function floatTo16BitPCM(input: Float32Array): Int16Array {
  const output = new Int16Array(input.length);
  for (let i = 0; i < input.length; i++) {
    const s = Math.max(-1, Math.min(1, input[i]));
    output[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
  }
  return output;
}

function noteToMidi(pitch: string): number {
  const m = pitch.match(/^([A-G][#b]?)(\d+)$/);
  if (!m) return 60;
  const map: { [key: string]: number } = {
    'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3,
    'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8,
    'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11
  };
  return (parseInt(m[2]) + 1) * 12 + map[m[1]];
}
