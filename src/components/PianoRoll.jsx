import React, { useEffect, useRef, useState, useCallback } from 'react';
import { midiToNote, noteToMidi } from '../lib/midi';

const noteNames = ['C4','C#4','D4','D#4','E4','F4','F#4','G4','G#4','A4','A#4','B4'];
const baseNote = 60;
const noteCount = 12;

export default function PianoRoll({ track, onNotesChange, playNote, isPlaying, currentTime }) {
  const canvasRef = useRef(null);
  const [zoomX, setZoomX] = useState(80);
  const [zoomY, setZoomY] = useState(20);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [dragState, setDragState] = useState({ active: false, type: null, startX: 0, startY: 0, note: null });
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, note: null });

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !track) return;
    const ctx = canvas.getContext('2d');
    let maxSec = 4;
    if (track.notes.length) {
      maxSec = Math.max(...track.notes.map(n => n.startSec + n.durationSec));
    }
    canvas.width = Math.max(800, maxSec * zoomX + 100);
    canvas.height = noteCount * zoomY + 60;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // 网格
    ctx.strokeStyle = '#3a3a4e';
    for (let s = 0; s <= maxSec; s++) {
      const x = s * zoomX - offsetX;
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
    }
    for (let i = 0; i <= noteCount; i++) {
      const y = i * zoomY - offsetY;
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
    }
    // 音名
    for (let i = 0; i < noteCount; i++) {
      const y = i * zoomY - offsetY;
      ctx.fillStyle = '#aaa';
      ctx.fillText(noteNames[noteCount-1-i], 2, y+12);
    }
    // 音符
    track.notes.forEach(n => {
      const midi = noteToMidi(n.pitch);
      const pitchIdx = noteCount-1 - (midi - baseNote);
      if (pitchIdx < 0 || pitchIdx >= noteCount) return;
      const x = n.startSec * zoomX - offsetX;
      const y = pitchIdx * zoomY - offsetY;
      const w = n.durationSec * zoomX;
      const h = zoomY - 2;
      ctx.fillStyle = '#5a6eff';
      ctx.fillRect(x, y, w, h);
      ctx.fillStyle = `rgba(0,0,0,${0.2 + n.velocity/255})`;
      ctx.fillRect(x, y, w, h/3);
    });
    // 播放头
    if (isPlaying) {
      const x = currentTime * zoomX - offsetX;
      ctx.fillStyle = 'rgba(255,100,50,0.5)';
      ctx.fillRect(x, 0, 3, canvas.height);
    }
  }, [track, zoomX, zoomY, offsetX, offsetY, isPlaying, currentTime]);

  useEffect(() => {
    draw();
  }, [draw]);

  // 坐标转换
  const getBeatPitchFromXY = (clientX, clientY) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const sx = canvas.width / rect.width;
    const sy = canvas.height / rect.height;
    let cx = (clientX - rect.left) * sx;
    let cy = (clientY - rect.top) * sy;
    let sec = (cx + offsetX) / zoomX;
    let pitchIdx = Math.floor((cy + offsetY) / zoomY);
    pitchIdx = Math.min(Math.max(pitchIdx, 0), noteCount-1);
    let midiNote = baseNote + (noteCount-1 - pitchIdx);
    return { sec: Math.max(0, sec), pitch: midiToNote(midiNote) };
  };

  const findNoteAt = (x, y) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const sx = canvas.width / rect.width;
    const sy = canvas.height / rect.height;
    const canvasX = (x - rect.left) * sx;
    const canvasY = (y - rect.top) * sy;
    for (const n of track.notes) {
      const midi = noteToMidi(n.pitch);
      const pitchIdx = noteCount-1 - (midi - baseNote);
      const noteX = n.startSec * zoomX - offsetX;
      const noteY = pitchIdx * zoomY - offsetY;
      const noteW = n.durationSec * zoomX;
      const noteH = zoomY - 2;
      if (canvasX >= noteX && canvasX <= noteX + noteW && canvasY >= noteY && canvasY <= noteY + noteH) {
        return n;
      }
    }
    return null;
  };

  const handleMouseDown = (e) => {
    e.preventDefault();
    const point = e.touches ? e.touches[0] : e;
    const note = findNoteAt(point.clientX, point.clientY);
    if (note) {
      setDragState({ active: true, type: 'move', startX: point.clientX, startY: point.clientY, note });
      return;
    }
    // 添加音符
    const { sec, pitch } = getBeatPitchFromXY(point.clientX, point.clientY);
    const quantizedSec = Math.round(sec / 0.25) * 0.25;
    onNotesChange([...track.notes, { pitch, startSec: quantizedSec, durationSec: 0.5, velocity: 90 }]);
    playNote(pitch, 0.3, 90);
  };

  const handleMouseMove = (e) => {
    if (!dragState.active) return;
    e.preventDefault();
    const point = e.touches ? e.touches[0] : e;
    if (dragState.type === 'move') {
      const dx = (point.clientX - dragState.startX) / zoomX;
      const newStart = Math.max(0, dragState.note.startSec + dx);
      const quantizedStart = Math.round(newStart / 0.25) * 0.25;
      const updatedNote = { ...dragState.note, startSec: quantizedStart };
      const newNotes = track.notes.map(n => n === dragState.note ? updatedNote : n);
      newNotes.sort((a,b) => a.startSec - b.startSec);
      onNotesChange(newNotes);
      setDragState({ ...dragState, startX: point.clientX, note: updatedNote });
    }
  };

  const handleMouseUp = () => {
    setDragState({ active: false, type: null, startX: 0, startY: 0, note: null });
  };

  const handleContextMenu = (e) => {
    e.preventDefault();
    const point = e.touches ? e.touches[0] : e;
    const note = findNoteAt(point.clientX, point.clientY);
    setContextMenu({ visible: true, x: point.clientX, y: point.clientY, note });
  };

  const closeContextMenu = () => setContextMenu({ visible: false, x: 0, y: 0, note: null });

  const deleteNote = () => {
    if (contextMenu.note) {
      onNotesChange(track.notes.filter(n => n !== contextMenu.note));
    }
    closeContextMenu();
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('contextmenu', handleContextMenu);
    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [track, dragState]);

  const handleZoomIn = () => setZoomX(z => Math.min(300, z * 1.2));
  const handleZoomOut = () => setZoomX(z => Math.max(20, z * 0.8));
  const handleResetView = () => { setOffsetX(0); setOffsetY(0); setZoomX(80); setZoomY(20); };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#1e1e2f', borderRadius: 8, overflow: 'hidden' }}>
      <div style={{ padding: 4, display: 'flex', gap: 8 }}>
        <button onClick={handleZoomIn}>Zoom In</button>
        <button onClick={handleZoomOut}>Zoom Out</button>
        <button onClick={handleResetView}>Reset</button>
      </div>
      <div style={{ flex: 1, overflow: 'auto' }}>
        <canvas ref={canvasRef} width="800" height="300" style={{ display: 'block' }} />
      </div>
      {contextMenu.visible && (
        <div style={{ position: 'fixed', top: contextMenu.y, left: contextMenu.x, background: '#2a2a3a', border: '1px solid #5a6eff', borderRadius: 4, zIndex: 1000 }}>
          <button onClick={deleteNote} style={{ display: 'block', width: '100%', textAlign: 'left' }}>Delete Note</button>
        </div>
      )}
    </div>
  );
}
