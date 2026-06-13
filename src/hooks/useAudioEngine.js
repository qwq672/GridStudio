import { useEffect, useRef, useState } from 'react';
import Soundfont from 'soundfont-player';

export function useAudioEngine() {
  const audioCtxRef = useRef(null);
  const masterGainRef = useRef(null);
  const dryGainRef = useRef(null);
  const wetReverbRef = useRef(null);
  const wetDelayRef = useRef(null);
  const instrumentRef = useRef(null);
  const [soundSource, setSoundSource] = useState('default');

  const initAudio = async () => {
    if (audioCtxRef.current) return audioCtxRef.current;
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    audioCtxRef.current = ctx;
    const master = ctx.createGain();
    master.gain.value = 0.8;
    master.connect(ctx.destination);
    masterGainRef.current = master;

    // 简易混响
    const reverb = ctx.createGain();
    reverb.gain.value = 0.3;
    reverb.connect(master);
    const delay = ctx.createDelay(1.5);
    delay.delayTime.value = 0.3;
    const delayGain = ctx.createGain();
    delayGain.gain.value = 0.2;
    delay.connect(delayGain);
    delayGain.connect(master);
    const dry = ctx.createGain();
    dry.connect(master);
    dryGainRef.current = dry;
    wetReverbRef.current = reverb;
    wetDelayRef.current = delayGain;
    return ctx;
  };

  const loadNetworkInstrument = async (program) => {
    if (!audioCtxRef.current) await initAudio();
    try {
      const name = 'acoustic_grand_piano'; // 可扩展为根据 program 映射
      const inst = await Soundfont.instrument(audioCtxRef.current, name, {
        soundfont: 'MusyngKite',
        gain: 0.7,
      });
      instrumentRef.current = inst;
    } catch (err) {
      console.warn("音色加载失败", err);
      instrumentRef.current = null;
    }
  };

  const playNote = async (pitch, duration, velocity) => {
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    if (ctx.state === 'suspended') await ctx.resume();
    const vol = velocity / 127 * 0.5;
    if (instrumentRef.current) {
      instrumentRef.current.play(pitch, ctx.currentTime, { gain: vol, duration });
    } else {
      // 振荡器回退
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
    }
  };

  // 辅助函数 noteToMidi 需要从 lib/midi 导入，但为避免循环依赖，在此定义
  function noteToMidi(pitch) {
    const m = pitch.match(/^([A-G][#b]?)(\d+)$/);
    if (!m) return 60;
    const map = { 'C':0,'C#':1,'Db':1,'D':2,'D#':3,'Eb':3,'E':4,'F':5,'F#':6,'Gb':6,'G':7,'G#':8,'Ab':8,'A':9,'A#':10,'Bb':10,'B':11 };
    return (parseInt(m[2])+1)*12 + map[m[1]];
  }

  useEffect(() => {
    initAudio();
    loadNetworkInstrument(0);
  }, []);

  return {
    playNote,
    audioCtxRef,
    masterGainRef,
    dryGainRef,
    wetReverbRef,
    wetDelayRef,
    soundSource,
    setSoundSource,
  };
}
