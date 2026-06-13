// src/components/PianoRoll.jsx
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { noteToMidi, midiToNote } from '../lib/midi';
import { Icons } from './Icons';

const noteNames = ['C4','C#4','D4','D#4','E4','F4','F#4','G4','G#4','A4','A#4','B4'];
const baseNote = 60;
const noteCount = 12;

export default function PianoRoll({ track, onNotesChange, playNote, isPlaying, currentTime }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [zoomX, setZoomX] = useState(80);
  const [zoomY, setZoomY] = useState(20);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [dragState, setDragState] = useState({ active: false, startX: 0, startY: 0, note: null });
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, note: null });

  // 计算视口范围（可见的音符区域）
  const getVisibleRange = useCallback(() => {
    const container = containerRef.current;
    if (!container) return { startSec: 0, endSec: 10, startPitch: 0, endPitch: noteCount };
    const scrollLeft = container.scrollLeft;
    const scrollTop = container.scrollTop;
    const viewWidth = container.clientWidth;
    const viewHeight = container.clientHeight;
    const startSec = (scrollLeft + offsetX) / zoomX;
    const endSec = (scrollLeft + viewWidth + offsetX) / zoomX;
    const startPitchIdx = Math.floor((scrollTop + offsetY) / zoomY);
    const endPitchIdx = Math.ceil((scrollTop + viewHeight + offsetY) / zoomY);
    return {
      startSec: Math.max(0, startSec - 0.5),
      endSec: endSec + 0.5,
      startPitch: Math.max(0, startPitchIdx),
      endPitch: Math.min(noteCount, endPitchIdx)
    };
  }, [zoomX, zoomY, offsetX, offsetY]);

  // 绘制钢琴卷帘（可见区域渲染）
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !track) return;
    const ctx = canvas.getContext('2d');
    const { startSec, endSec, startPitch, endPitch } = getVisibleRange();
    const totalWidth = (endSec - startSec) * zoomX + 200;
    const totalHeight = (endPitch - startPitch) * zoomY + 60;
    canvas.width = totalWidth;
    canvas.height = totalHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 绘制网格线（相对坐标）
    ctx.strokeStyle = '#3a3a42';
    ctx.lineWidth = 0.5;
    const startBeat = Math.floor(startSec);
    for (let beat = startBeat; beat <= endSec + 1; beat++) {
      const x = (beat - startSec) * zoomX;
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
    }
    for (let i = startPitch; i <= endPitch; i++) {
      const y = (i - startPitch) * zoomY;
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
    }
    // 音名
    for (let i = startPitch; i < endPitch; i++) {
      const y = (i - startPitch) * zoomY;
      const noteName = noteNames[noteCount - 1 - i];
      ctx.fillStyle = '#a0a0a8';
      ctx.font = '10px monospace';
      ctx.fillText(noteName, 2, y + 12);
    }
    // 绘制可见音符
    track.notes.forEach(n => {
      const midi = noteToMidi(n.pitch);
      const pitchIdx = noteCount - 1 - (midi - baseNote);
      if (pitchIdx < startPitch || pitchIdx >= endPitch) return;
      if (n.startSec + n.durationSec < startSec || n.startSec > endSec) return;
      const x = (n.startSec - startSec) * zoomX;
      const y = (pitchIdx - startPitch) * zoomY;
      const w = n.durationSec * zoomX;
      const h = zoomY - 2;
      ctx.fillStyle = '#e08e3a';
      ctx.fillRect(x, y, w, h);
      ctx.fillStyle = `rgba(0,0,0,${0.2 + n.velocity / 255})`;
      ctx.fillRect(x, y, w, h / 3);
    });
    // 播放头
    if (isPlaying && currentTime >= startSec && currentTime <= endSec) {
      const x = (currentTime - startSec) * zoomX;
      ctx.fillStyle = 'rgba(224, 142, 58, 0.7)';
      ctx.fillRect(x, 0, 3, canvas.height);
    }
  }, [track, zoomX, zoomY, offsetX, offsetY, isPlaying, currentTime, getVisibleRange]);

  // 监听滚动和缩放变化重新绘制
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const onScroll = () => draw();
    container.addEventListener('scroll', onScroll);
    window.addEventListener('resize', draw);
    return () => {
      container.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', draw);
    };
  }, [draw]);

  useEffect(() => {
    draw();
  }, [draw, track, zoomX, zoomY, offsetX, offsetY, isPlaying, currentTime]);

  // 坐标转换（屏幕坐标 -> 音符坐标）
  const screenToNoteCoord = (clientX, clientY) => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    const rect = canvas.getBoundingClientRect();
    const sx = canvas.width / rect.width;
    const sy = canvas.height / rect.height;
    const canvasX = (clientX - rect.left) * sx;
    const canvasY = (clientY - rect.top) * sy;
    const { startSec, startPitch } = getVisibleRange();
    const sec = startSec + canvasX / zoomX;
    const pitchIdx = startPitch + canvasY / zoomY;
    const clampedPitchIdx = Math.min(Math.max(pitchIdx, 0), noteCount - 1);
    const midiNote = baseNote + (noteCount - 1 - clampedPitchIdx);
    return { sec: Math.max(0, sec), pitch: midiToNote(midiNote), pitchIdx: clampedPitchIdx };
  };

  const findNoteAtScreen = (clientX, clientY) => {
    const { sec, pitch } = screenToNoteCoord(clientX, clientY);
    return track.notes.find(n => Math.abs(n.startSec - sec) < 0.1 && n.pitch === pitch);
  };

  // 鼠标/触摸事件
  const handlePointerDown = (e) => {
    e.preventDefault();
    const point = e.touches ? e.touches[0] : e;
    const note = findNoteAtScreen(point.clientX, point.clientY);
    if (note) {
      setDragState({ active: true, startX: point.clientX, startY: point.clientY, note });
      return;
    }
    // 添加音符（量化到 0.25 秒）
    const { sec, pitch } = screenToNoteCoord(point.clientX, point.clientY);
    const quantizedSec = Math.round(sec / 0.25) * 0.25;
    onNotesChange([...track.notes, { pitch, startSec: quantizedSec, durationSec: 0.5, velocity: 90 }]);
    playNote(pitch, 0.3, 90);
  };

  const handlePointerMove = (e) => {
    if (!dragState.active) return;
    e.preventDefault();
    const point = e.touches ? e.touches[0] : e;
    const deltaX = (point.clientX - dragState.startX) / zoomX;
    const newStart = Math.max(0, dragState.note.startSec + deltaX);
    const quantizedStart = Math.round(newStart / 0.25) * 0.25;
    const updatedNote = { ...dragState.note, startSec: quantizedStart };
    const newNotes = track.notes.map(n => n === dragState.note ? updatedNote : n);
    newNotes.sort((a, b) => a.startSec - b.startSec);
    onNotesChange(newNotes);
    setDragState({ ...dragState, startX: point.clientX, note: updatedNote });
  };

  const handlePointerUp = () => {
    setDragState({ active: false, startX: 0, startY: 0, note: null });
  };

  const handleContextMenu = (e) => {
    e.preventDefault();
    const point = e.touches ? e.touches[0] : e;
    const note = findNoteAtScreen(point.clientX, point.clientY);
    setContextMenu({ visible: true, x: point.clientX, y: point.clientY, note });
  };

  const closeContextMenu = () => setContextMenu({ visible: false, x: 0, y: 0, note: null });

  const deleteCurrentNote = () => {
    if (contextMenu.note) {
      onNotesChange(track.notes.filter(n => n !== contextMenu.note));
    }
    closeContextMenu();
  };

  // 缩放控制
  const handleZoomXChange = (e) => setZoomX(parseInt(e.target.value));
  const handleZoomYChange = (e) => setZoomY(parseInt(e.target.value));
  const resetView = () => {
    setZoomX(80);
    setZoomY(20);
    setOffsetX(0);
    setOffsetY(0);
    if (containerRef.current) {
      containerRef.current.scrollLeft = 0;
      containerRef.current.scrollTop = 0;
    }
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#1e1e22', borderRadius: 8, overflow: 'hidden' }}>
      <div style={{ padding: 4, display: 'flex', gap: 12, alignItems: 'center', background: '#2a2a30', borderBottom: '1px solid #3a3a42' }}>
        <div className="slider-label">
          <Icons.ZoomIn />
          <span>横向缩放</span>
          <input type="range" min="20" max="200" value={zoomX} onChange={handleZoomXChange} style={{ width: 100 }} />
        </div>
        <div className="slider-label">
          <Icons.ZoomOut />
          <span>纵向缩放</span>
          <input type="range" min="8" max="60" value={zoomY} onChange={handleZoomYChange} style={{ width: 100 }} />
        </div>
        <button onClick={resetView}><Icons.Reset /> 重置视图</button>
      </div>
      <div
        ref={containerRef}
        className="piano-roll"
        style={{ flex: 1, overflow: 'auto', position: 'relative' }}
        onContextMenu={handleContextMenu}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <canvas ref={canvasRef} style={{ display: 'block' }} />
      </div>
      {contextMenu.visible && (
        <div
          style={{
            position: 'fixed',
            top: contextMenu.y,
            left: contextMenu.x,
            background: '#2a2a30',
            border: '1px solid #e08e3a',
            borderRadius: 4,
            zIndex: 1000,
            padding: '4px 0'
          }}
        >
          <button onClick={deleteCurrentNote} style={{ background: 'none', border: 'none', color: 'white', padding: '4px 12px', width: '100%', textAlign: 'left' }}>
            <Icons.Trash /> 删除音符
          </button>
        </div>
      )}
    </div>
  );
}
