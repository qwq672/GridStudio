import React from 'react';

export default function Transport({ bpm, onBpmChange, isPlaying, onPlay, onStop, currentTime, totalDuration, onSeek, reverbSend, onReverbSendChange, delaySend, onDelaySendChange }) {
  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };
  const percent = totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0;
  return (
    <div style={{ background: '#2a2a3a', borderTop: '1px solid #3a3a4e', padding: 6, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
      <button onClick={onPlay} style={{ background: '#5a6eff' }}>▶</button>
      <button onClick={onStop}>⏹</button>
      <span>BPM</span>
      <input type="number" value={bpm} onChange={e => onBpmChange(parseInt(e.target.value))} style={{ width: 60 }} />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
        <div className="progress-bar" style={{ flex: 1, position: 'relative', background: '#3a3a4e', height: 4, borderRadius: 2, cursor: 'pointer' }} onClick={e => {
          const rect = e.currentTarget.getBoundingClientRect();
          const ratio = (e.clientX - rect.left) / rect.width;
          onSeek(ratio * totalDuration);
        }}>
          <div className="progress-fill" style={{ width: `${percent}%`, height: '100%', background: '#5a6eff', borderRadius: 2 }} />
        </div>
        <span style={{ fontSize: '0.7rem' }}>{formatTime(currentTime)} / {formatTime(totalDuration)}</span>
      </div>
      <span>Reverb</span>
      <input type="range" min="0" max="1" step="0.01" value={reverbSend} onChange={e => onReverbSendChange(parseFloat(e.target.value))} style={{ width: 80 }} />
      <span>{Math.round(reverbSend * 100)}%</span>
      <span>Delay</span>
      <input type="range" min="0" max="1" step="0.01" value={delaySend} onChange={e => onDelaySendChange(parseFloat(e.target.value))} style={{ width: 80 }} />
      <span>{Math.round(delaySend * 100)}%</span>
    </div>
  );
}
