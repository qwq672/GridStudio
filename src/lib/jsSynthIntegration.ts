// js-synthesizer 集成模块
// 用于高质量的 SF2 音色播放和离线渲染导出

import * as JSSynth from 'js-synthesizer';

let synthInstance: JSSynth.Synthesizer | null = null;
let sfontId: number | null = null;
let audioNodeInstance: AudioNode | null = null;
let readyPromise: Promise<void> | null = null;

/**
 * 等待 js-synthesizer 的 WASM 引擎就绪
 */
export async function waitForSynthReady(): Promise<void> {
  if (!readyPromise) {
    readyPromise = JSSynth.waitForReady();
  }
  await readyPromise;
}

/**
 * 获取或创建合成器实例
 */
async function getSynth(sampleRate: number = 44100): Promise<JSSynth.Synthesizer> {
  await waitForSynthReady();
  if (!synthInstance) {
    synthInstance = new JSSynth.Synthesizer();
  }
  if (!synthInstance.isInitialized()) {
    synthInstance.init(sampleRate);
  }
  return synthInstance;
}

/**
 * 加载 SF2 音色库到 js-synthesizer
 */
export async function loadSF2ToSynth(sf2Buffer: ArrayBuffer, sampleRate: number = 44100): Promise<number> {
  const synth = await getSynth(sampleRate);
  sfontId = await synth.loadSFont(sf2Buffer);
  return sfontId;
}

/**
 * 创建 AudioNode 用于实时播放
 */
export async function createSynthAudioNode(
  context: AudioContext,
  frameSize: number = 8192
): Promise<AudioNode> {
  const synth = await getSynth(context.sampleRate);
  if (!audioNodeInstance) {
    audioNodeInstance = synth.createAudioNode(context, frameSize);
  }
  return audioNodeInstance;
}

/**
 * 发送 MIDI noteOn
 */
export function synthNoteOn(channel: number, key: number, velocity: number): void {
  if (!synthInstance) return;
  synthInstance.midiNoteOn(channel, key, velocity);
}

/**
 * 发送 MIDI noteOff
 */
export function synthNoteOff(channel: number, key: number): void {
  if (!synthInstance) return;
  synthInstance.midiNoteOff(channel, key);
}

/**
 * 发送 MIDI programChange
 */
export function synthProgramChange(channel: number, program: number): void {
  if (!synthInstance) return;
  synthInstance.midiProgramChange(channel, program);
}

/**
 * 离线渲染 MIDI 数据为 AudioBuffer
 * 使用 js-synthesizer 内置的播放器，音质比自定义调度器更好
 */
export async function renderMidiToAudioBuffer(
  midiBuffer: ArrayBuffer,
  sampleRate: number = 44100,
  onProgress?: (progress: number) => void
): Promise<AudioBuffer> {
  const synth = await getSynth(sampleRate);

  // 重置播放器
  await synth.resetPlayer();

  // 加载 MIDI 数据
  await synth.addSMFDataToPlayer(midiBuffer);

  // 获取总 tick 数用于进度显示
  const totalTicks = synth.getPlayerTotalTicks();

  // 开始播放
  await synth.playPlayer();

  // 创建一个 AudioBuffer 来接收渲染结果
  // 先估算时长（基于 tick 和默认 BPM）
  const bpm = synth.getPlayerBpm() || 120;
  const ticksPerBeat = 480; // 标准 MIDI
  const estimatedDuration = (totalTicks / ticksPerBeat) * (60 / bpm) + 2; // +2s for reverb tail
  const totalSamples = Math.ceil(estimatedDuration * sampleRate);

  const audioBuffer = new AudioBuffer({
    numberOfChannels: 2,
    length: totalSamples,
    sampleRate,
  });

  // 使用 render() 方法逐步渲染
  const frameSize = 8192;
  let offset = 0;
  const leftChannel = audioBuffer.getChannelData(0);
  const rightChannel = audioBuffer.getChannelData(1);

  while (offset < totalSamples && synth.isPlayerPlaying()) {
    // 创建临时缓冲区用于接收渲染的帧
    const tempBuffer = new Float32Array(frameSize * 2); // stereo
    const left = new Float32Array(frameSize);
    const right = new Float32Array(frameSize);

    synth.render([left, right]);

    const copyLen = Math.min(frameSize, totalSamples - offset);
    for (let i = 0; i < copyLen; i++) {
      leftChannel[offset + i] = left[i];
      rightChannel[offset + i] = right[i];
    }

    offset += copyLen;

    if (onProgress && totalTicks > 0) {
      const currentTick = synth.getPlayerCurrentTick();
      onProgress(Math.min(1, currentTick / totalTicks));
    }

    // 让出控制权，避免阻塞主线程
    if (offset % (frameSize * 10) === 0) {
      await new Promise(r => setTimeout(r, 0));
    }
  }

  // 等待所有声音停止
  await synth.waitForVoicesStopped();

  // 裁剪尾部静音
  let lastNonSilent = totalSamples - 1;
  const silenceThreshold = 0.0001;
  while (lastNonSilent > 0) {
    if (
      Math.abs(leftChannel[lastNonSilent]) > silenceThreshold ||
      Math.abs(rightChannel[lastNonSilent]) > silenceThreshold
    ) {
      break;
    }
    lastNonSilent--;
  }
  const actualLength = Math.min(lastNonSilent + sampleRate, totalSamples); // 保留 1s 尾音

  // 创建最终 AudioBuffer
  const ctx = new OfflineAudioContext(2, actualLength, sampleRate);
  const finalBuffer = ctx.createBuffer(2, actualLength, sampleRate);
  finalBuffer.getChannelData(0).set(leftChannel.slice(0, actualLength));
  finalBuffer.getChannelData(1).set(rightChannel.slice(0, actualLength));

  return finalBuffer;
}

/**
 * 关闭合成器，释放资源
 */
export function closeSynth(): void {
  if (synthInstance) {
    synthInstance.close();
    synthInstance = null;
    audioNodeInstance = null;
    sfontId = null;
  }
}

/**
 * 获取已加载的 sfont ID
 */
export function getSFontId(): number | null {
  return sfontId;
}
