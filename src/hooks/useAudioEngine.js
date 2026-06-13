import { useState, useRef, useCallback, useEffect } from 'react';
import Soundfont from 'soundfont-player';
import { getOscillatorPreset } from '../lib/oscillatorPresets';
import { parseSF2 } from '../lib/sf2Parser';

export function useAudioEngine() {
  const audioCtxRef = useRef(null);
  const masterGainRef = useRef(null);
  const dryGainRef = useRef(null);
  const wetReverbGainRef = useRef(null);
  const wetDelayGainRef = useRef(null);
  const convolverRef = useRef(null);
  const delayNodeRef = useRef(null);
  const delayFeedbackRef = useRef(null);
  const instrumentRef = useRef(null);
  const sf2DataRef = useRef(null);
  const sf2BuffersRef = useRef({}); // 缓存SF2样本的AudioBuffer
  const [soundSource, setSoundSource] = useState('default'); // 'default', 'network', 'sf2'
  const [reverbSend, setReverbSend] = useState(0.3);
  const [delaySend, setDelaySend] = useState(0.2);
  const [delayTime, setDelayTime] = useState(0.3);
  const [delayFeedback, setDelayFeedback] = useState(0.3);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const playIntervalRef = useRef(null);
  const startTimeRef = useRef(0);
  const scheduledEventsRef = useRef([]);
  const isPlayingRef = useRef(false);
  const noiseBufferRef = useRef(null);

  const initAudio = async () => {
    if (audioCtxRef.current) return audioCtxRef.current;
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    audioCtxRef.current = ctx;

    // 主输出
    const master = ctx.createGain();
    master.gain.value = 0.8;
    master.connect(ctx.destination);
    masterGainRef.current = master;

    // 干信号
    const dry = ctx.createGain();
    dry.gain.value = 0.7;
    dry.connect(master);
    dryGainRef.current = dry;

    // 混响 - 使用ConvolverNode实现真实混响
    const convolver = ctx.createConvolver();
    convolver.buffer = generateReverbIR(ctx, 2.5, 2.0); // 2.5秒衰减
    convolverRef.current = convolver;

    const reverbGain = ctx.createGain();
    reverbGain.gain.value = reverbSend;
    convolver.connect(reverbGain);
    reverbGain.connect(master);
    wetReverbGainRef.current = reverbGain;

    // 延迟 - 使用DelayNode + 反馈回路
    const delayNode = ctx.createDelay(5.0);
    delayNode.delayTime.value = delayTime;
    delayNodeRef.current = delayNode;

    const feedbackGain = ctx.createGain();
    feedbackGain.gain.value = delayFeedback;
    delayFeedbackRef.current = feedbackGain;

    const delayGain = ctx.createGain();
    delayGain.gain.value = delaySend;
    wetDelayGainRef.current = delayGain;

    // 延迟回路: delay -> feedback -> delay (形成回声)
    delayNode.connect(feedbackGain);
    feedbackGain.connect(delayNode);
    // 延迟输出 -> wet gain -> master
    delayNode.connect(delayGain);
    delayGain.connect(master);

    // 创建噪声缓冲区（用于打击乐）
    const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const noiseData = noiseBuffer.getChannelData(0);
    for (let i = 0; i < noiseData.length; i++) {
      noiseData[i] = Math.random() * 2 - 1;
    }
    noiseBufferRef.current = noiseBuffer;

    return ctx;
  };

  // 生成混响脉冲响应
  function generateReverbIR(ctx, duration, decay) {
    const sampleRate = ctx.sampleRate;
    const length = sampleRate * duration;
    const buffer = ctx.createBuffer(2, length, sampleRate);
    
    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel);
      for (let i = 0; i < length; i++) {
        // 指数衰减的随机噪声
        const t = i / length;
        const envelope = Math.pow(1 - t, decay);
        data[i] = (Math.random() * 2 - 1) * envelope;
      }
    }
    return buffer;
  }

  // 连接振荡器到效果器链
  function connectToEffects(node, ctx) {
    // 干信号
    const dryNode = ctx.createGain();
    dryNode.gain.value = 1.0;
    node.connect(dryNode);
    dryNode.connect(dryGainRef.current);

    // 混响发送
    const reverbSendNode = ctx.createGain();
    reverbSendNode.gain.value = 1.0;
    node.connect(reverbSendNode);
    reverbSendNode.connect(convolverRef.current);

    // 延迟发送
    const delaySendNode = ctx.createGain();
    delaySendNode.gain.value = 1.0;
    node.connect(delaySendNode);
    delaySendNode.connect(delayNodeRef.current);
  }

  // 应用ADSR包络 - 修复爆音问题
  function applyEnvelope(gainNode, ctx, preset, vol, duration) {
    const now = ctx.currentTime;
    const { attack = 0.01, decay = 0.1, sustain = 0.5, release = 0.3 } = preset;
    
    // 确保音量不会太大导致削波
    const safeVol = Math.min(vol, 0.4);
    
    // 使用setTargetAtTime实现更平滑的增益变化，避免爆音
    const timeConstant = 0.003; // 3ms时间常数
    
    // Attack - 使用指数曲线避免click
    gainNode.gain.setValueAtTime(0.0001, now);
    gainNode.gain.setTargetAtTime(safeVol, now, timeConstant);
    
    // Decay -> Sustain
    const decayEnd = now + attack + decay;
    gainNode.gain.setTargetAtTime(safeVol * Math.max(sustain, 0.001), decayEnd, timeConstant);
    
    // 保持 sustain 直到 note off
    const noteEnd = now + duration;
    gainNode.gain.setValueAtTime(safeVol * Math.max(sustain, 0.001), noteEnd);
    
    // Release - 使用指数衰减
    gainNode.gain.setTargetAtTime(0.0001, noteEnd, timeConstant);
    
    return noteEnd + release + 0.1;
  }

  // 使用多层谐波合成音色
  function playSynthNote(pitch, duration, velocity, program) {
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    
    const preset = getOscillatorPreset(program);
    const midi = noteToMidi(pitch);
    const freq = 440 * Math.pow(2, (midi - 69) / 12);
    const vol = (velocity / 127) * 0.3;

    // 打击乐使用噪声合成
    if (preset.isDrum) {
      playDrumSound(preset, vol, duration);
      return;
    }

    // 主增益节点
    const masterGain = ctx.createGain();
    
    // 应用ADSR包络
    const totalDuration = applyEnvelope(masterGain, ctx, preset, vol, duration);

    // 多层谐波叠加
    const harmonics = preset.harmonics || [1];
    const oscillators = [];
    
    harmonics.forEach((amp, idx) => {
      if (amp <= 0) return;
      const osc = ctx.createOscillator();
      const harmGain = ctx.createGain();
      
      // 基频或谐波频率
      osc.frequency.value = freq * (idx + 1);
      // 轻微失谐使声音更自然
      osc.detune.value = (Math.random() - 0.5) * 6;
      
      harmGain.gain.value = amp * 0.5;
      
      osc.connect(harmGain);
      harmGain.connect(masterGain);
      
      oscillators.push(osc);
    });

    // 如果没有谐波定义，使用单振荡器
    if (harmonics.length <= 1) {
      const osc = ctx.createOscillator();
      osc.type = preset.type || 'sine';
      osc.frequency.value = freq;
      osc.detune.value = (Math.random() - 0.5) * 4;
      osc.connect(masterGain);
      oscillators.push(osc);
    }

    // 低通滤波器使声音更柔和
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = Math.min(freq * 6, 12000);
    filter.Q.value = 0.7;
    
    masterGain.connect(filter);
    connectToEffects(filter, ctx);

    // 启动和停止
    const stopTime = ctx.currentTime + totalDuration;
    oscillators.forEach(osc => {
      osc.start();
      osc.stop(stopTime);
    });
  }

  // 打击乐噪声合成 - 修复爆音
  function playDrumSound(preset, vol, duration) {
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    const now = ctx.currentTime;

    const { attack = 0.001, decay = 0.05, release = 0.05, freq, isCymbal, isMetallic, isShaker } = preset;
    
    // 限制音量避免爆音
    const safeVol = Math.min(vol, 0.4);
    const timeConstant = 0.002;

    if (isShaker) {
      // 沙锤 - 高通滤波噪声
      const source = ctx.createBufferSource();
      source.buffer = noiseBufferRef.current;
      
      const hpf = ctx.createBiquadFilter();
      hpf.type = 'highpass';
      hpf.frequency.value = 6000;
      
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.setTargetAtTime(safeVol * 0.3, now + attack, timeConstant);
      gain.gain.setTargetAtTime(0.0001, now + decay + release, timeConstant);
      
      source.connect(hpf);
      hpf.connect(gain);
      connectToEffects(gain, ctx);
      source.start(now);
      source.stop(now + decay + release + 0.05);
      return;
    }

    if (isCymbal || isMetallic) {
      // 镲/金属 - 带通滤波噪声 + 高频振荡器
      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = noiseBufferRef.current;
      
      const bpf = ctx.createBiquadFilter();
      bpf.type = 'bandpass';
      bpf.frequency.value = isCymbal ? 8000 : (freq || 2000);
      bpf.Q.value = isMetallic ? 20 : 5;
      
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.setTargetAtTime(safeVol * 0.25, now + attack, timeConstant);
      gain.gain.setTargetAtTime(0.0001, now + decay + release + 0.1, timeConstant);
      
      noiseSource.connect(bpf);
      bpf.connect(gain);
      connectToEffects(gain, ctx);
      noiseSource.start(now);
      noiseSource.stop(now + decay + release + 0.2);

      if (isMetallic) {
        // 添加金属振荡器
        const osc = ctx.createOscillator();
        osc.type = 'sine'; // 改用sine避免刺耳
        osc.frequency.value = freq || 2000;
        const oscGain = ctx.createGain();
        oscGain.gain.setValueAtTime(0.0001, now);
        oscGain.gain.setTargetAtTime(safeVol * 0.1, now + attack, timeConstant);
        oscGain.gain.setTargetAtTime(0.0001, now + release + 0.1, timeConstant);
        osc.connect(oscGain);
        connectToEffects(oscGain, ctx);
        osc.start(now);
        osc.stop(now + release + 0.2);
      }
      return;
    }

    // 鼓声 - 噪声 + 低频正弦波（音高下降）
    // 噪声层（鼓皮冲击）
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBufferRef.current;
    
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.value = freq ? freq * 3 : 3000;
    noiseFilter.Q.value = 1.5;
    
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.0001, now);
    noiseGain.gain.setTargetAtTime(safeVol * 0.4, now + attack, timeConstant);
    noiseGain.gain.setTargetAtTime(0.0001, now + decay + 0.02, timeConstant);
    
    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    connectToEffects(noiseGain, ctx);
    noiseSource.start(now);
    noiseSource.stop(now + decay + 0.1);

    // 音高层（鼓体共振）- 频率从高频滑向低频
    const bodyFreq = freq || 150;
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(bodyFreq * 2.5, now);
    osc.frequency.exponentialRampToValueAtTime(bodyFreq, now + 0.03);
    
    const bodyGain = ctx.createGain();
    bodyGain.gain.setValueAtTime(0.0001, now);
    bodyGain.gain.setTargetAtTime(safeVol * 0.5, now + attack, timeConstant);
    bodyGain.gain.setTargetAtTime(0.0001, now + decay + release + 0.05, timeConstant);
    
    osc.connect(bodyGain);
    connectToEffects(bodyGain, ctx);
    osc.start(now);
    osc.stop(now + decay + release + 0.1);
  }

  // 播放SF2样本
  function playSF2Sample(pitch, duration, velocity, program) {
    const ctx = audioCtxRef.current;
    if (!ctx || !sf2DataRef.current) {
      playSynthNote(pitch, duration, velocity, program);
      return;
    }

    const midi = noteToMidi(pitch);
    const vol = (velocity / 127) * 0.5;
    const presets = sf2DataRef.current.presets;
    
    // 查找对应program的preset
    const preset = presets.find(p => p.program === program) || presets[0];
    if (!preset || !preset.samples || preset.samples.length === 0) {
      playSynthNote(pitch, duration, velocity, program);
      return;
    }

    // 找到最接近的样本
    let bestSample = preset.samples[0];
    let minDist = Infinity;
    for (const sample of preset.samples) {
      const dist = Math.abs((sample.rootKey || 60) - midi);
      if (dist < minDist) {
        minDist = dist;
        bestSample = sample;
      }
    }

    if (!bestSample.buffer) {
      playSynthNote(pitch, duration, velocity, program);
      return;
    }

    const now = ctx.currentTime;
    const source = ctx.createBufferSource();
    source.buffer = bestSample.buffer;
    
    // 计算播放速率（根据音高差异）
    const rootKey = bestSample.rootKey || 60;
    const pitchDiff = midi - rootKey;
    source.playbackRate.value = Math.pow(2, pitchDiff / 12);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(vol, now + 0.005);
    gain.gain.setValueAtTime(vol, now + duration);
    gain.gain.linearRampToValueAtTime(0.0001, now + duration + 0.05);

    source.connect(gain);
    connectToEffects(gain, ctx);
    
    source.start(now);
    source.stop(now + duration + 0.1);
  }

  const loadNetworkInstrument = async (program) => {
    if (!audioCtxRef.current) await initAudio();
    try {
      const name = 'acoustic_grand_piano';
      const inst = await Soundfont.instrument(audioCtxRef.current, name, {
        soundfont: 'MusyngKite',
        gain: 0.7,
      });
      instrumentRef.current = inst;
    } catch (err) {
      console.warn("Network instrument failed", err);
      instrumentRef.current = null;
    }
  };

  // 加载SF2文件
  const loadSF2 = async (arrayBuffer) => {
    await initAudio();
    try {
      const sf2Data = parseSF2(arrayBuffer);
      sf2DataRef.current = sf2Data;
      
      // 解码所有样本
      const ctx = audioCtxRef.current;
      const decodedBuffers = {};
      
      for (const preset of sf2Data.presets) {
        for (const sample of (preset.samples || [])) {
          if (sample.audioData && !decodedBuffers[sample.name]) {
            try {
              const audioBuffer = await ctx.decodeAudioData(sample.audioData.slice(0));
              decodedBuffers[sample.name] = audioBuffer;
              sample.buffer = audioBuffer;
            } catch (e) {
              console.warn('Failed to decode sample:', sample.name, e);
            }
          }
        }
      }
      sf2BuffersRef.current = decodedBuffers;
      setSoundSource('sf2');
      return true;
    } catch (err) {
      console.error('SF2 load failed:', err);
      return false;
    }
  };

  const playNote = async (pitch, duration, velocity, program = 0) => {
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    if (ctx.state === 'suspended') await ctx.resume();

    if (soundSource === 'network' && instrumentRef.current) {
      const vol = (velocity / 127) * 0.5;
      instrumentRef.current.play(pitch, ctx.currentTime, { gain: vol, duration });
    } else if (soundSource === 'sf2' && sf2DataRef.current) {
      playSF2Sample(pitch, duration, velocity, program);
    } else {
      playSynthNote(pitch, duration, velocity, program);
    }
  };

  const startPlayback = useCallback(async (tracks) => {
    if (isPlaying) stopPlayback();
    await initAudio();
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') await ctx.resume();

    let events = [];
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
    events.sort((a,b) => a.time - b.time);
    const total = events.length ? Math.max(...events.map(e => e.time + e.duration)) : 0;
    setTotalDuration(total);
    if (total === 0) return;

    const startTime = ctx.currentTime;
    startTimeRef.current = startTime;
    setIsPlaying(true);
    isPlayingRef.current = true;

    for (const ev of events) {
      const timeoutId = setTimeout(() => {
        if (isPlayingRef.current) {
          playNote(ev.pitch, ev.duration, ev.velocity, ev.program);
        }
      }, ev.time * 1000);
      scheduledEventsRef.current.push(timeoutId);
    }

    playIntervalRef.current = setInterval(() => {
      if (!isPlayingRef.current) return;
      const elapsed = ctx.currentTime - startTime;
      setCurrentTime(Math.min(elapsed, total));
      if (elapsed >= total) {
        stopPlayback();
      }
    }, 50);
  }, [isPlaying, soundSource]);

  const stopPlayback = useCallback(() => {
    if (playIntervalRef.current) clearInterval(playIntervalRef.current);
    setIsPlaying(false);
    setCurrentTime(0);
    scheduledEventsRef.current.forEach(tid => clearTimeout(tid));
    scheduledEventsRef.current = [];
  }, []);

  const seekTo = (time) => {
    stopPlayback();
    setCurrentTime(time);
  };

  useEffect(() => {
    initAudio();
    loadNetworkInstrument(0);
    return () => {
      stopPlayback();
    };
  }, []);

  return {
    playNote,
    startPlayback: (tracks) => startPlayback(tracks),
    stopPlayback,
    seekTo,
    isPlaying,
    currentTime,
    totalDuration,
    reverbSend,
    setReverbSend: (val) => {
      setReverbSend(val);
      if (wetReverbGainRef.current) wetReverbGainRef.current.gain.value = val;
      if (dryGainRef.current) dryGainRef.current.gain.value = Math.max(0, 1 - val * 0.5);
    },
    delaySend,
    setDelaySend: (val) => {
      setDelaySend(val);
      if (wetDelayGainRef.current) wetDelayGainRef.current.gain.value = val;
    },
    delayTime,
    setDelayTime: (val) => {
      setDelayTime(val);
      if (delayNodeRef.current) delayNodeRef.current.delayTime.value = val;
    },
    delayFeedback,
    setDelayFeedback: (val) => {
      setDelayFeedback(val);
      if (delayFeedbackRef.current) delayFeedbackRef.current.gain.value = val;
    },
    audioCtxRef,
    soundSource,
    setSoundSource,
    loadSF2,
    sf2Loaded: !!sf2DataRef.current,
    initAudio,
  };
}

function noteToMidi(pitch) {
  const m = pitch.match(/^([A-G][#b]?)(\d+)$/);
  if (!m) return 60;
  const map = { 'C':0,'C#':1,'Db':1,'D':2,'D#':3,'Eb':3,'E':4,'F':5,'F#':6,'Gb':6,'G':7,'G#':8,'Ab':8,'A':9,'A#':10,'Bb':10,'B':11 };
  return (parseInt(m[2])+1)*12 + map[m[1]];
}
