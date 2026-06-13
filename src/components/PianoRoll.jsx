import React, { useEffect, useRef, useState, useCallback } from 'react';
import { noteToMidi, midiToNote } from '../lib/midi';
import { useTranslation } from '../lib/i18n';

// 扩展音域：C2 (MIDI 36) 到 C7 (MIDI 96)，共 61 个音符
const BASE_MIDI = 36; // C2
const NOTE_COUNT = 61; // C2 到 C7

// 生成音符名称数组
const noteNames = [];
for (let i = 0; i < NOTE_COUNT; i++) {
  noteNames.push(midiToNote(BASE_MIDI + i));
}

export default function PianoRoll({ track, onNotesChange, playNote, isPlaying, currentTime, lang = 'zh' }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [zoomX, setZoomX] = useState(80);
  const [zoomY, setZoomY] = useState(20);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [dragState, setDragState] = useState({ active: false, type: null, startX: 0, startY: 0, note: null });
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, note: null });
  const [selectedNotes, setSelectedNotes] = useState([]);
  const [clipboard, setClipboard] = useState([]);
  const t = useTranslation(lang);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !track) return;
    const ctx = canvas.getContext('2d');
    
    let maxSec = 4;
    if (track.notes.length) {
      maxSec = Math.max(...track.notes.map(n => n.startSec + n.durationSec));
    }
    
    canvas.width = Math.max(800, maxSec * zoomX + 100);
    canvas.height = NOTE_COUNT * zoomY;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 绘制网格
    ctx.strokeStyle = '#2a2a2a';
    ctx.lineWidth = 1;
    
    // 垂直线（时间）
    for (let s = 0; s <= maxSec + 1; s++) {
      const x = s * zoomX - offsetX;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    
    // 水平线（音符）
    for (let i = 0; i <= NOTE_COUNT; i++) {
      const y = i * zoomY - offsetY;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
    
    // 绘制音符名称标签
    ctx.fillStyle = '#888';
    ctx.font = '10px monospace';
    for (let i = 0; i < NOTE_COUNT; i++) {
      const y = i * zoomY - offsetY;
      if (y > -20 && y < canvas.height + 20) {
        ctx.fillText(noteNames[NOTE_COUNT - 1 - i], 2, y + 12);
      }
    }
    
    // 绘制音符
    track.notes.forEach(n => {
      const midi = noteToMidi(n.pitch);
      const pitchIdx = NOTE_COUNT - 1 - (midi - BASE_MIDI);
      if (pitchIdx < 0 || pitchIdx >= NOTE_COUNT) return;
      
      const x = n.startSec * zoomX - offsetX;
      const y = pitchIdx * zoomY - offsetY;
      const w = n.durationSec * zoomX;
      const h = zoomY - 2;
      
      const isSelected = selectedNotes.includes(n);
      
      // 音符主体
      ctx.fillStyle = isSelected ? '#5a9fd4' : '#888';
      ctx.fillRect(x, y, w, h);
      
      // 音符顶部高光（表示力度）
      ctx.fillStyle = `rgba(255,255,255,${0.1 + n.velocity / 255})`;
      ctx.fillRect(x, y, w, h / 3);
      
      // 选中边框
      if (isSelected) {
        ctx.strokeStyle = '#5a9fd4';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, w, h);
      }
    });
    
    // 绘制播放头红线
    if (isPlaying && currentTime > 0) {
      const playheadX = currentTime * zoomX - offsetX;
      ctx.strokeStyle = '#ff4444';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(playheadX, 0);
      ctx.lineTo(playheadX, canvas.height);
      ctx.stroke();
    }
  }, [track, zoomX, zoomY, offsetX, offsetY, isPlaying, currentTime, selectedNotes]);

  useEffect(() => {
    draw();
  }, [draw]);

  const getBeatPitchFromXY = (clientX, clientY) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const sx = canvas.width / rect.width;
    const sy = canvas.height / rect.height;
    const cx = (clientX - rect.left) * sx;
    const cy = (clientY - rect.top) * sy;
    const sec = (cx + offsetX) / zoomX;
    let pitchIdx = Math.floor((cy + offsetY) / zoomY);
    pitchIdx = Math.min(Math.max(pitchIdx, 0), NOTE_COUNT - 1);
    const midiNote = BASE_MIDI + (NOTE_COUNT - 1 - pitchIdx);
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
      const pitchIdx = NOTE_COUNT - 1 - (midi - BASE_MIDI);
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
    
    // 多选支持：Shift+点击添加/移除选择
    if (note) {
      if (e.shiftKey) {
        // Shift+点击：切换选择状态
        if (selectedNotes.includes(note)) {
          setSelectedNotes(selectedNotes.filter(n => n !== note));
        } else {
          setSelectedNotes([...selectedNotes, note]);
        }
      } else {
        // 普通点击：如果点击的是已选中的音符，开始拖拽
        if (selectedNotes.includes(note)) {
          setDragState({ active: true, type: 'move', startX: point.clientX, startY: point.clientY, note, notes: [...selectedNotes] });
        } else {
          // 点击未选中的音符：只选择这个音符
          setSelectedNotes([note]);
          setDragState({ active: true, type: 'move', startX: point.clientX, startY: point.clientY, note, notes: [note] });
        }
      }
      return;
    }
    
    // 点击空白处：取消选择并创建新音符
    setSelectedNotes([]);
    const { sec, pitch } = getBeatPitchFromXY(point.clientX, point.clientY);
    const quantizedSec = Math.round(sec / 0.25) * 0.25;
    const newNote = { pitch, startSec: quantizedSec, durationSec: 0.5, velocity: 90 };
    onNotesChange([...track.notes, newNote]);
    playNote(pitch, 0.3, 90);
  };

  const handleMouseMove = (e) => {
    if (!dragState.active) return;
    e.preventDefault();
    const point = e.touches ? e.touches[0] : e;
    
    if (dragState.type === 'move') {
      const dx = (point.clientX - dragState.startX) / zoomX;
      const dy = (point.clientY - dragState.startY) / zoomY;
      
      // 批量移动所有选中的音符
      const updatedNotes = track.notes.map(n => {
        if (dragState.notes.includes(n)) {
          const newStart = Math.max(0, n.startSec + dx);
          const quantizedStart = Math.round(newStart / 0.25) * 0.25;
          
          // 计算音高变化
          const midi = noteToMidi(n.pitch);
          const pitchIdx = NOTE_COUNT - 1 - (midi - BASE_MIDI);
          const newPitchIdx = Math.min(Math.max(0, pitchIdx + Math.round(dy)), NOTE_COUNT - 1);
          const newMidi = BASE_MIDI + (NOTE_COUNT - 1 - newPitchIdx);
          const newPitch = midiToNote(newMidi);
          
          return { ...n, startSec: quantizedStart, pitch: newPitch };
        }
        return n;
      });
      
      updatedNotes.sort((a, b) => a.startSec - b.startSec);
      onNotesChange(updatedNotes);
      
      // 更新拖拽状态中的音符引用
      const newSelectedNotes = updatedNotes.filter(n => dragState.notes.some(old => old.pitch === n.pitch && old.startSec === n.startSec));
      setDragState({ ...dragState, startX: point.clientX, startY: point.clientY, notes: newSelectedNotes });
      setSelectedNotes(newSelectedNotes);
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
      setSelectedNotes(selectedNotes.filter(n => n !== contextMenu.note));
    }
    closeContextMenu();
  };

  // 复制选中的音符
  const copySelectedNotes = useCallback(() => {
    if (selectedNotes.length === 0) return;
    const minStart = Math.min(...selectedNotes.map(n => n.startSec));
    // 保存相对位置
    const copied = selectedNotes.map(n => ({
      ...n,
      startSec: n.startSec - minStart
    }));
    setClipboard(copied);
  }, [selectedNotes]);

  // 裁切选中的音符
  const cutSelectedNotes = useCallback(() => {
    if (selectedNotes.length === 0) return;
    copySelectedNotes();
    const remaining = track.notes.filter(n => !selectedNotes.includes(n));
    onNotesChange(remaining);
    setSelectedNotes([]);
  }, [selectedNotes, track.notes, copySelectedNotes, onNotesChange]);

  // 粘贴音符
  const pasteNotes = useCallback(() => {
    if (clipboard.length === 0) return;
    const pasteStart = currentTime || 0;
    const newNotes = clipboard.map(n => ({
      ...n,
      startSec: n.startSec + pasteStart
    }));
    onNotesChange([...track.notes, ...newNotes]);
    setSelectedNotes(newNotes);
  }, [clipboard, currentTime, track.notes, onNotesChange]);

  // 全选
  const selectAllNotes = useCallback(() => {
    setSelectedNotes([...track.notes]);
  }, [track.notes]);

  // 删除选中的音符
  const deleteSelectedNotes = useCallback(() => {
    if (selectedNotes.length === 0) return;
    const remaining = track.notes.filter(n => !selectedNotes.includes(n));
    onNotesChange(remaining);
    setSelectedNotes([]);
  }, [selectedNotes, track.notes, onNotesChange]);

  // 键盘快捷键
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'c') {
          e.preventDefault();
          copySelectedNotes();
        } else if (e.key === 'x') {
          e.preventDefault();
          cutSelectedNotes();
        } else if (e.key === 'v') {
          e.preventDefault();
          pasteNotes();
        } else if (e.key === 'a') {
          e.preventDefault();
          selectAllNotes();
        }
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        deleteSelectedNotes();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [copySelectedNotes, cutSelectedNotes, pasteNotes, selectAllNotes, deleteSelectedNotes]);

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
    <div ref={containerRef} style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#1e1e1e', borderRadius: 8, overflow: 'hidden', minHeight: 0 }}>
      <div style={{ padding: 4, display: 'flex', gap: 8, flexShrink: 0 }}>
        <button onClick={handleZoomIn}>放大</button>
        <button onClick={handleZoomOut}>缩小</button>
        <button onClick={handleResetView}>重置</button>
      </div>
      <div style={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
        <canvas ref={canvasRef} width="800" height="300" style={{ display: 'block' }} />
      </div>
      {contextMenu.visible && (
        <div style={{ position: 'fixed', top: contextMenu.y, left: contextMenu.x, background: '#2a2a2a', border: '1px solid #888', borderRadius: 4, zIndex: 1000 }}>
          <button onClick={deleteNote} style={{ display: 'block', width: '100%', textAlign: 'left' }}>删除音符</button>
        </div>
      )}
    </div>
  );
}
