// src/hooks/useAudioEngine.js
import { useEffect, useRef, useState } from 'react';
import Soundfont from 'soundfont-player';
import { noteToMidi } from '../lib/midi';

export function useAudioEngine() {
  const audioCtxRef = useRef(null);
  const masterGainRef = useRef(null);
  const dryGainRef = useRef(null);
  const wetReverbRef = useRef(null);
  const wetDelayRef = useRef(null);
  const instrumentRef = useRef(null);
  const [soundSource, setSoundSource] = useState('network'); // 'network' 或 'default'
  const [isLoading, setIsLoading] = useState(false);

  // 初始化音频上下文和效果器
  const initAudio = async () => {
    if (audioCtxRef.current) return audioCtxRef.current;
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    audioCtxRef.current = ctx;

    // 主音量
    const master = ctx.createGain();
    master.gain.value = 0.8;
    master.connect(ctx.destination);
    masterGainRef.current = master;

    // 混响 (简单增益模拟，实际可用 Convolver)
    const reverb = ctx.createGain();
    reverb.gain.value = 0.3;
    reverb.connect(master);
    // 延迟
    const delay = ctx.createDelay(1.5);
    delay.delayTime.value = 0.3;
    const delayGain = ctx.createGain();
    delayGain.gain.value = 0.2;
    delay.connect(delayGain);
    delayGain.connect(master);
    // 干声总线
    const dry = ctx.createGain();
    dry.connect(master);
    dryGainRef.current = dry;
    wetReverbRef.current = reverb;
    wetDelayRef.current = delayGain;

    return ctx;
  };

  // 加载网络音色 (使用 soundfont-player)
  const loadNetworkInstrument = async (program) => {
    if (!audioCtxRef.current) await initAudio();
    setIsLoading(true);
    try {
      // 简单映射：将 GM program 转换为 soundfont-player 的乐器名称
      // 这里只实现了钢琴 (program 0)，如需更多请扩展
      let instrumentName = 'acoustic_grand_piano';
      if (program === 40) instrumentName = 'violin';
      else if (program === 56) instrumentName = 'trumpet';
      else if (program === 48) instrumentName = 'string_ensemble_1';
      // 默认钢琴
      const inst = await Soundfont.instrument(audioCtxRef.current, instrumentName, {
        soundfont: 'MusyngKite',
        gain: 0.7,
        format: 'mp3'
      });
      instrumentRef.current = inst;
    } catch (err) {
      console.warn('网络音色加载失败，使用振荡器回退', err);
      instrumentRef.current = null;
    } finally {
      setIsLoading(false);
    }
  };

  // 播放音符
  const playNote = async (pitch, duration, velocity) => {
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    if (ctx.state === 'suspended') await ctx.resume();

    const vol = (velocity / 127) * 0.5;

    // 优先使用网络音色
    if (soundSource === 'network' && instrumentRef.current && !isLoading) {
      instrumentRef.current.play(pitch, ctx.currentTime, { gain: vol, duration });
      return;
    }

    // 振荡器回退（默认音色）
    const midi = noteToMidi(pitch);
    const freq = 440 * Math.pow(2, (midi - 69) / 12);
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.value = vol;
    osc.connect(gain);
    gain.connect(dryGainRef.current);
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
    osc.stop(ctx.currentTime + duration);
  };

  // 重新加载当前音色（当 program 改变时调用）
  const reloadInstrument = (program) => {
    if (soundSource === 'network') {
      loadNetworkInstrument(program);
    } else {
      instrumentRef.current = null;
    }
  };

  useEffect(() => {
    initAudio();
    loadNetworkInstrument(0);
  }, []);

  return {
    playNote,
    reloadInstrument,
    audioCtxRef,
    masterGainRef,
    dryGainRef,
    wetReverbRef,
    wetDelayRef,
    soundSource,
    setSoundSource,
    isLoading,
  };
}
