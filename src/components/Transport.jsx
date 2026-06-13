// src/components/Transport.jsx
import React from 'react';
import { Icons } from './Icons';

export default function Transport({
  bpm,
  onBpmChange,
  isPlaying,
  onPlay,
  onStop,
  currentTime,
  totalDuration,
  onSeek,
}) {
  const formatTime = (sec) => {
    const mins = Math.floor(sec / 60);
    const secs = Math.floor(sec % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="controls-bar">
      <button onClick={onPlay} disabled={isPlaying}>
        <Icons.Play /> 播放
      </button>
      <button onClick={onStop} disabled={!isPlaying}>
        <Icons.Stop /> 停止
      </button>
      <div className="slider-label">
        <span>速度</span>
        <input
          type="range"
          min="40"
          max="200"
          value={bpm}
          onChange={e => onBpmChange(parseInt(e.target.value))}
          style={{ width: '100px' }}
        />
        <span>{bpm} BPM</span>
      </div>
      <div className="progress-bar" onClick={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        if (totalDuration) onSeek(percent * totalDuration);
      }}>
        <div className="progress-fill" style={{ width: `${(currentTime / totalDuration) * 100}%` }} />
      </div>
      <span>{formatTime(currentTime)} / {formatTime(totalDuration)}</span>
    </div>
  );
}
