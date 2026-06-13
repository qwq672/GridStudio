import React, { useState, useRef } from 'react';
import { Icons } from './Icons';
import { useTranslation } from '../lib/i18n';

export default function Transport({
  bpm,
  onBpmChange,
  isPlaying,
  onPlay,
  onStop,
  currentTime,
  totalDuration,
  onSeek,
  reverbSend,
  onReverbSendChange,
  delaySend,
  onDelaySendChange,
  delayTime,
  onDelayTimeChange,
  delayFeedback,
  onDelayFeedbackChange,
  lang = 'zh',
}) {
  const [isDragging, setIsDragging] = useState(false);
  const progressBarRef = useRef(null);
  const t = useTranslation(lang);

  const formatTime = (sec) => {
    const mins = Math.floor(sec / 60);
    const secs = Math.floor(sec % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSeekMouseDown = (e) => {
    setIsDragging(true);
    handleSeek(e);
  };

  const handleSeek = (e) => {
    if (!progressBarRef.current) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = Math.max(0, Math.min(1, x / rect.width));
    const newTime = percent * totalDuration;
    onSeek(newTime);
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      handleSeek(e);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  React.useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging]);

  return (
    <div className="controls-bar" style={{ padding: '6px', display: 'flex', gap: '12px', alignItems: 'center', borderTop: '1px solid #3a3a4e', flexShrink: 0 }}>
      <button onClick={onPlay} disabled={isPlaying}>{Icons.Play ? <Icons.Play /> : '▶'}</button>
      <button onClick={onStop} disabled={!isPlaying}>{Icons.Stop ? <Icons.Stop /> : '⏹'}</button>
      <span>BPM</span>
      <input type="number" value={bpm} onChange={(e) => onBpmChange(parseInt(e.target.value))} style={{ width: '70px' }} />
      <div 
        ref={progressBarRef}
        className="progress-bar" 
        style={{ width: '200px', height: '8px', background: '#3a3a4e', borderRadius: '4px', cursor: 'pointer', position: 'relative' }}
        onMouseDown={handleSeekMouseDown}
      >
        <div className="progress-fill" style={{ width: `${totalDuration ? (currentTime / totalDuration) * 100 : 0}%`, height: '100%', background: '#5a6eff', borderRadius: '4px', pointerEvents: 'none' }} />
      </div>
      <span>{formatTime(currentTime)} / {formatTime(totalDuration)}</span>
      <div style={{ marginLeft: 'auto', display: 'flex', gap: '12px', alignItems: 'center' }}>
        <span>{t.reverb}</span>
        <input type="range" min="0" max="1" step="0.01" value={reverbSend} onChange={(e) => onReverbSendChange(parseFloat(e.target.value))} style={{ width: '60px' }} />
        <span>{Math.round(reverbSend * 100)}%</span>
        <span>{t.delay}</span>
        <input type="range" min="0" max="1" step="0.01" value={delaySend} onChange={(e) => onDelaySendChange(parseFloat(e.target.value))} style={{ width: '60px' }} />
        <span>{Math.round(delaySend * 100)}%</span>
        <span>{t.delayTime}</span>
        <input type="range" min="0.05" max="1" step="0.01" value={delayTime} onChange={(e) => onDelayTimeChange(parseFloat(e.target.value))} style={{ width: '60px' }} />
        <span>{Math.round(delayTime * 1000)}ms</span>
        <span>{t.delayFeedback}</span>
        <input type="range" min="0" max="0.9" step="0.01" value={delayFeedback} onChange={(e) => onDelayFeedbackChange(parseFloat(e.target.value))} style={{ width: '60px' }} />
        <span>{Math.round(delayFeedback * 100)}%</span>
      </div>
    </div>
  );
}
