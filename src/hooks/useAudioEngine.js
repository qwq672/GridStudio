import { useRef, useState } from 'react';
import Soundfont from 'soundfont-player';

export function useAudioEngine() {
  const audioCtxRef = useRef(null);
  const masterGainRef = useRef(null);
  const dryGainRef = useRef(null);
  const wetReverbRef = useRef(null);
  const wetDelayRef = useRef(null);
  const instrumentRef = useRef(null);
  const [soundSource, setSoundSource] = useState('default'); // 'default' or 'network'
  const [reverbSend, setReverbSend] = useState(0.3);
  const [delaySend, setDelaySend] = useState(0.2);

  const initAudio = async () => {
    if (audioCtxRef.current) return audioCtxRef.current;
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    audioCtxRef.current = ctx;
    const master = ctx.createGain();
    master.gain.value = 0.8;
    master.connect(ctx.destination);
    masterGainRef.current = master;

    // 混响（简单增益，实际可用 Convolver）
    const reverb = ctx.createGain();
    reverb.gain.value = reverbSend;
    reverb.connect(master);
    // 延迟
    const delay = ctx.createDelay(1.5);
    delay.delayTime.value = 0.3;
    const delayGain = ctx.createGain();
    delayGain.gain.value = delaySend;
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
      // 简单映射，默认钢琴
      let name = 'acoustic_grand_piano';
      // 可根据 program 映射其他乐器（这里简化）
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

  const playNote = async (pitch, duration, velocity, program = 0) => {
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    if (ctx.state === 'suspended') await ctx.resume();
    const vol = (velocity / 127) * 0.5;

    if (soundSource === 'network' && instrumentRef.current) {
      instrumentRef.current.play(pitch, ctx.currentTime, { gain: vol, duration });
    } else {
      // 振荡器回退 - 修复崩溃：使用正弦波，保证稳定
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

  const setReverbSendValue = (val) => {
    setReverbSend(val);
    if (wetReverbRef.current) wetReverbRef.current.gain.value = val;
    if (dryGainRef.current) dryGainRef.current.gain.value = Math.max(0, 1 - val * 0.7);
  };

  const setDelaySendValue = (val) => {
    setDelaySend(val);
    if (wetDelayRef.current) wetDelayRef.current.gain.value = val;
  };

  // 初始化时加载网络音色
  initAudio().then(() => loadNetworkInstrument(0));

  return {
    playNote,
    audioCtxRef,
    soundSource,
    setSoundSource,
    reverbSend,
    delaySend,
    setReverbSend: setReverbSendValue,
    setDelaySend: setDelaySendValue,
    initAudio,
  };
}

// 辅助函数
function noteToMidi(pitch) {
  const m = pitch.match(/^([A-G][#b]?)(\d+)$/);
  if (!m) return 60;
  const map = { 'C':0,'C#':1,'Db':1,'D':2,'D#':3,'Eb':3,'E':4,'F':5,'F#':6,'Gb':6,'G':7,'G#':8,'Ab':8,'A':9,'A#':10,'Bb':10,'B':11 };
  return (parseInt(m[2])+1)*12 + map[m[1]];
}
