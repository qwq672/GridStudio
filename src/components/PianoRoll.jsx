import React, { useEffect, useRef, useState, useCallback } from 'react';
import { noteToMidi, midiToNote } from '../lib/midi';
import { Icons } from './Icons';
import { useTranslation } from '../lib/i18n';

const BASE_MIDI = 36, NOTE_COUNT = 61;
const noteNames = [];
for (let i = 0; i < NOTE_COUNT; i++) noteNames.push(midiToNote(BASE_MIDI + i));

function parseQ(v) {
  if (!v) return 0.25;
  if (v.includes('/')) { const [a, b] = v.split('/').map(Number); return a / b; }
  return Number(v) || 0.25;
}

export default function PianoRoll({ track, onNotesChange, playNote, isPlaying, getPlaybackTime, lang = 'zh', editMode = 'pointer', quantizeValue = '1/4' }) {
  const canvasRef = useRef(null);
  const playheadCanvasRef = useRef(null);
  const containerRef = useRef(null);
  const [zoomX, setZoomX] = useState(80);
  const [zoomY, setZoomY] = useState(20);
  const offsetXRef = useRef(0);
  const offsetYRef = useRef(0);
  const [dragState, setDragState] = useState({ active: false, type: null, startX: 0, startY: 0, notes: [] });
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0 });
  const [selectedNotes, setSelectedNotes] = useState([]);
  const [clipboard, setClipboard] = useState([]);
  const [marqueeRect, setMarqueeRect] = useState(null);
  const t = useTranslation(lang);
  const maxSecRef = useRef(4);
  const selectedSetRef = useRef(new Set());
  const rafRef = useRef(null);
  const playheadSizeRef = useRef({ width: 0, height: 0 });
  const notesByIdRef = useRef({});
  const drawPendingRef = useRef(false);

  const qStep = parseQ(quantizeValue);

  // Assign stable IDs to notes for fast lookup
  useEffect(() => {
    track.notes.forEach((n, i) => { if (!n._id) n._id = i; });
  }, [track.notes]);

  useEffect(() => { selectedSetRef.current = new Set(selectedNotes); }, [selectedNotes]);

  useEffect(() => {
    maxSecRef.current = track.notes.length ? Math.max(4, ...track.notes.map(n => n.startSec + n.durationSec)) : 4;
  }, [track.notes]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !track) return;
    const ctx = canvas.getContext('2d');
    const maxSec = maxSecRef.current;
    const ox = offsetXRef.current;
    const oy = offsetYRef.current;

    canvas.width = Math.max(800, maxSec * zoomX + 120);
    canvas.height = NOTE_COUNT * zoomY;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 节拍网格
    const beatSec = 60 / 120; // 120 BPM basis grid
    for (let b = 0; b <= Math.ceil(maxSec / beatSec) + 1; b++) {
      const x = b * beatSec * zoomX - ox;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      if (b % 4 === 0) { ctx.strokeStyle = '#3a3a42'; ctx.lineWidth = 1; }
      else if (b % 1 === 0) { ctx.strokeStyle = '#2c2c34'; ctx.lineWidth = 0.5; }
      else { continue; }
      ctx.stroke();
    }
    for (let i = 0; i <= NOTE_COUNT; i++) {
      const y = i * zoomY - oy;
      if (i % 12 === 0) { ctx.strokeStyle = '#3a3a42'; ctx.lineWidth = 0.8; }
      else { ctx.strokeStyle = '#2a2a30'; ctx.lineWidth = 0.4; }
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    const selSet = selectedSetRef.current;
    track.notes.forEach(n => {
      const midi = noteToMidi(n.pitch);
      const pitchIdx = NOTE_COUNT - 1 - (midi - BASE_MIDI);
      if (pitchIdx < 0 || pitchIdx >= NOTE_COUNT) return;
      const x = n.startSec * zoomX - ox;
      const y = pitchIdx * zoomY - oy;
      const w = Math.max(2, n.durationSec * zoomX);
      const h = zoomY - 2;
      const isSel = selSet.has(n);
      ctx.fillStyle = isSel ? '#a0a0a8' : '#888';
      ctx.fillRect(x, y, w, h);
      ctx.fillStyle = `rgba(255,255,255,${0.08 + (n.velocity || 90) / 350})`;
      ctx.fillRect(x, y, w, h / 3);
      if (isSel) { ctx.strokeStyle = '#ccc'; ctx.lineWidth = 1.5; ctx.strokeRect(x, y, w, h); }
    });

    if (marqueeRect) {
      ctx.fillStyle = 'rgba(255,255,255,0.06)';
      ctx.strokeStyle = '#888';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.fillRect(marqueeRect.x, marqueeRect.y, marqueeRect.w, marqueeRect.h);
      ctx.strokeRect(marqueeRect.x, marqueeRect.y, marqueeRect.w, marqueeRect.h);
      ctx.setLineDash([]);
    }
    drawPendingRef.current = false;
  }, [track, zoomX, zoomY, marqueeRect]);

  // 惰性重绘：避免高频onScroll触发多次重绘
  const requestRedraw = useCallback(() => {
    if (!drawPendingRef.current) {
      drawPendingRef.current = true;
      requestAnimationFrame(() => draw());
    }
  }, [draw]);

  const drawPlayhead = useCallback((currentTime) => {
    const canvas = playheadCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const mainCanvas = canvasRef.current;
    if (mainCanvas) {
      const w = mainCanvas.width, h = mainCanvas.height;
      if (playheadSizeRef.current.width !== w || playheadSizeRef.current.height !== h) {
        canvas.width = w; canvas.height = h;
        playheadSizeRef.current = { width: w, height: h };
      }
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (isPlaying && currentTime > 0) {
      const px = currentTime * zoomX - offsetXRef.current;
      ctx.strokeStyle = '#cc4444';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(px, 0);
      ctx.lineTo(px, canvas.height);
      ctx.stroke();
    }
  }, [isPlaying, zoomX]);

  useEffect(() => { draw(); }, [draw]);

  useEffect(() => {
    if (!isPlaying) { if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; } drawPlayhead(0); return; }
    let lastTime = 0;
    const animate = (ts) => {
      if (ts - lastTime < 30) { rafRef.current = requestAnimationFrame(animate); return; }
      lastTime = ts;
      if (getPlaybackTime) drawPlayhead(getPlaybackTime());
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [isPlaying, drawPlayhead, getPlaybackTime]);

  const canvasToLogical = (clientX, clientY) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const sx = canvas.width / rect.width;
    const sy = canvas.height / rect.height;
    return { x: (clientX - rect.left) * sx, y: (clientY - rect.top) * sy };
  };

  const logicalToSecPitch = (lx, ly) => {
    const sec = (lx + offsetXRef.current) / zoomX;
    let pitchIdx = Math.min(Math.max(Math.floor((ly + offsetYRef.current) / zoomY), 0), NOTE_COUNT - 1);
    return { sec: Math.max(0, sec), pitch: midiToNote(BASE_MIDI + (NOTE_COUNT - 1 - pitchIdx)) };
  };

  const findNoteAtLogical = (lx, ly) => {
    const ox = offsetXRef.current, oy = offsetYRef.current;
    // 反向遍历提升性能（最近的音符通常最后绘制）
    for (let i = track.notes.length - 1; i >= 0; i--) {
      const n = track.notes[i];
      const midi = noteToMidi(n.pitch);
      const pitchIdx = NOTE_COUNT - 1 - (midi - BASE_MIDI);
      const nx = n.startSec * zoomX - ox;
      const ny = pitchIdx * zoomY - oy;
      if (lx >= nx && lx <= nx + Math.max(2, n.durationSec * zoomX) && ly >= ny && ly <= ny + zoomY - 2) return n;
    }
    return null;
  };

  const findNotesInRect = (rx, ry, rw, rh) => {
    const ox = offsetXRef.current, oy = offsetYRef.current;
    return track.notes.filter(n => {
      const midi = noteToMidi(n.pitch);
      const pitchIdx = NOTE_COUNT - 1 - (midi - BASE_MIDI);
      const nx = n.startSec * zoomX - ox;
      const ny = pitchIdx * zoomY - oy;
      const nw = Math.max(2, n.durationSec * zoomX);
      const nh = zoomY - 2;
      return nx < rx + rw && nx + nw > rx && ny < ry + rh && ny + nh > ry;
    });
  };

  const quantizeSec = (sec) => Math.round(sec / qStep) * qStep;

  const handlePointerDown = (e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const point = e.touches ? e.touches[0] : e;
    const { x: lx, y: ly } = canvasToLogical(point.clientX, point.clientY);

    if (editMode === 'pointer') {
      const note = findNoteAtLogical(lx, ly);
      setSelectedNotes(note ? [note] : []);
      return;
    }

    if (editMode === 'draw') {
      const { sec, pitch } = logicalToSecPitch(lx, ly);
      const newNote = { pitch, startSec: quantizeSec(sec), durationSec: Math.max(qStep, 0.05), velocity: 90 };
      onNotesChange([...track.notes, newNote].sort((a, b) => a.startSec - b.startSec));
      playNote(pitch, 0.3, 90);
      return;
    }

    const note = findNoteAtLogical(lx, ly);

    if (editMode === 'erase') {
      if (note) { onNotesChange(track.notes.filter(n => n !== note)); setSelectedNotes(prev => prev.filter(n => n !== note)); }
      setDragState({ active: true, type: 'erase', startX: lx, startY: ly, notes: [] });
      return;
    }

    if (editMode === 'select') {
      if (note && !e.shiftKey) {
        if (selectedSetRef.current.has(note)) {
          setDragState({ active: true, type: 'move', startX: lx, startY: ly, notes: [...selectedNotes] });
        } else {
          setSelectedNotes([note]);
          setDragState({ active: true, type: 'move', startX: lx, startY: ly, notes: [note] });
        }
      } else if (note && e.shiftKey) {
        setSelectedNotes(prev => prev.includes(note) ? prev.filter(n => n !== note) : [...prev, note]);
      } else if (!note) {
        setSelectedNotes([]);
        setDragState({ active: true, type: 'marquee', startX: lx, startY: ly, notes: [] });
        setMarqueeRect({ x: lx, y: ly, w: 0, h: 0 });
      }
    }
  };

  const handlePointerMove = (e) => {
    if (!dragState.active) return;
    e.preventDefault();
    const point = e.touches ? e.touches[0] : e;
    const { x: lx, y: ly } = canvasToLogical(point.clientX, point.clientY);

    if (dragState.type === 'move') {
      const dx = lx - dragState.startX, dy = ly - dragState.startY;
      const dSec = dx / zoomX, dPitch = Math.round(dy / zoomY);
      const selSet = new Set(dragState.notes);
      const updated = track.notes.map(n => {
        if (!selSet.has(n)) return n;
        const midi = noteToMidi(n.pitch);
        const newIdx = Math.min(Math.max(0, (NOTE_COUNT - 1 - (midi - BASE_MIDI)) + dPitch), NOTE_COUNT - 1);
        return { ...n, startSec: Math.max(0, quantizeSec(n.startSec + dSec)), pitch: midiToNote(BASE_MIDI + (NOTE_COUNT - 1 - newIdx)) };
      });
      updated.sort((a, b) => a.startSec - b.startSec);
      onNotesChange(updated);
      const newSel = updated.filter(n => selSet.has(n));
      setDragState(prev => ({ ...prev, startX: lx, startY: ly, notes: newSel }));
      setSelectedNotes(newSel);
    }

    if (dragState.type === 'marquee') {
      const rx = Math.min(dragState.startX, lx), ry = Math.min(dragState.startY, ly);
      const rw = Math.abs(lx - dragState.startX), rh = Math.abs(ly - dragState.startY);
      setMarqueeRect({ x: rx, y: ry, w: rw, h: rh });
      setSelectedNotes(findNotesInRect(rx, ry, rw, rh));
    }

    if (dragState.type === 'erase') {
      const note = findNoteAtLogical(lx, ly);
      if (note) { onNotesChange(track.notes.filter(n => n !== note)); setSelectedNotes(prev => prev.filter(n => n !== note)); }
    }
  };

  const handlePointerUp = () => {
    if (dragState.type === 'marquee') setMarqueeRect(null);
    setDragState({ active: false, type: null, startX: 0, startY: 0, notes: [] });
  };

  const handleContextMenu = (e) => {
    e.preventDefault();
    const point = e.touches ? e.touches[0] : e;
    const { x: lx, y: ly } = canvasToLogical(point.clientX, point.clientY);
    const note = findNoteAtLogical(lx, ly);
    if (note && !selectedSetRef.current.has(note)) setSelectedNotes([note]);
    setContextMenu({ visible: true, x: point.clientX, y: point.clientY });
  };

  const closeCM = () => setContextMenu({ visible: false, x: 0, y: 0 });

  const quantizeNotes = useCallback((step) => {
    const sv = 1 / step;
    onNotesChange(track.notes.map(n => {
      if (!selectedSetRef.current.has(n)) return n;
      const qS = Math.round(n.startSec * sv) / sv;
      const qE = Math.round((n.startSec + n.durationSec) * sv) / sv;
      return { ...n, startSec: qS, durationSec: Math.max(0.05, qE - qS) };
    }));
    closeCM();
  }, [track.notes, onNotesChange]);

  const changeVelocity = useCallback((delta) => {
    onNotesChange(track.notes.map(n => selectedSetRef.current.has(n) ? { ...n, velocity: Math.max(1, Math.min(127, (n.velocity || 90) + delta)) } : n));
    closeCM();
  }, [track.notes, onNotesChange]);

  const copySelected = useCallback(() => {
    if (selectedNotes.length === 0) return;
    const minStart = Math.min(...selectedNotes.map(n => n.startSec));
    setClipboard(selectedNotes.map(n => ({ ...n, startSec: n.startSec - minStart })));
    closeCM();
  }, [selectedNotes]);

  const cutSelected = useCallback(() => {
    if (selectedNotes.length === 0) return;
    copySelected();
    onNotesChange(track.notes.filter(n => !selectedSetRef.current.has(n)));
    setSelectedNotes([]);
  }, [selectedNotes, track.notes, copySelected, onNotesChange]);

  const pasteNotes = useCallback(() => {
    if (clipboard.length === 0) return;
    const newNotes = clipboard.map(n => ({ ...n }));
    onNotesChange([...track.notes, ...newNotes].sort((a, b) => a.startSec - b.startSec));
    setSelectedNotes(newNotes);
    closeCM();
  }, [clipboard, track.notes, onNotesChange]);

  const deleteSelected = useCallback(() => {
    if (selectedNotes.length === 0) return;
    onNotesChange(track.notes.filter(n => !selectedSetRef.current.has(n)));
    setSelectedNotes([]);
    closeCM();
  }, [selectedNotes, track.notes, onNotesChange]);

  const selectAll = useCallback(() => setSelectedNotes([...track.notes]), [track.notes]);

  // Ctrl shortcuts
  useEffect(() => {
    const h = (e) => {
      if (!e.ctrlKey && !e.metaKey) {
        if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); deleteSelected(); }
        return;
      }
      if (e.key === 'c') { e.preventDefault(); copySelected(); }
      else if (e.key === 'x') { e.preventDefault(); cutSelected(); }
      else if (e.key === 'v') { e.preventDefault(); pasteNotes(); }
      else if (e.key === 'a') { e.preventDefault(); selectAll(); }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [copySelected, cutSelected, pasteNotes, selectAll, deleteSelected]);

  // Canvas事件绑定
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.addEventListener('mousedown', handlePointerDown);
    canvas.addEventListener('touchstart', handlePointerDown, { passive: false });
    canvas.addEventListener('contextmenu', handleContextMenu);
    const up = handlePointerUp;
    const mov = handlePointerMove;
    window.addEventListener('mousemove', mov);
    window.addEventListener('touchmove', mov, { passive: false });
    window.addEventListener('mouseup', up);
    window.addEventListener('touchend', up);
    return () => {
      canvas.removeEventListener('mousedown', handlePointerDown);
      canvas.removeEventListener('touchstart', handlePointerDown);
      canvas.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('mousemove', mov);
      window.removeEventListener('touchmove', mov);
      window.removeEventListener('mouseup', up);
      window.removeEventListener('touchend', up);
    };
  }, [track, dragState, editMode, zoomX, zoomY, quantizeValue, selectedNotes]);

  return (
    <div ref={containerRef} style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--bg)', borderRadius: 6, overflow: 'hidden', minHeight: 0 }}>
      {/* 工具栏 */}
      <div style={{ padding: '3px 6px', display: 'flex', gap: 4, flexShrink: 0, background: 'var(--panel)', borderBottom: '1px solid var(--border)', alignItems: 'center' }}>
        <button onClick={() => setZoomX(z => Math.min(300, z * 1.2))} title={t.zoomIn} style={{ padding: '2px 6px' }}><Icons.ZoomIn /></button>
        <button onClick={() => setZoomX(z => Math.max(20, z * 0.8))} title={t.zoomOut} style={{ padding: '2px 6px' }}><Icons.ZoomOut /></button>
        <button onClick={() => { offsetXRef.current = 0; offsetYRef.current = 0; setZoomX(80); setZoomY(20); }} title={t.resetView} style={{ padding: '2px 6px' }}><Icons.Reset /></button>
        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>
          {selectedNotes.length > 0 ? `${selectedNotes.length} ${lang === 'zh' ? '个音符' : ' notes'}` : ''}
        </span>
      </div>

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0 }}>
        <div style={{ width: 38, flexShrink: 0, background: 'var(--track-bg)', borderRight: '1px solid var(--border)', overflow: 'hidden' }}>
          <canvas ref={(el) => { if (el) { el.width = 38; el.height = NOTE_COUNT * zoomY; const ctx = el.getContext('2d'); ctx.clearRect(0, 0, 38, el.height); ctx.fillStyle = '#6a6a70'; ctx.font = '9px monospace'; for (let i = 0; i < NOTE_COUNT; i++) { const y = i * zoomY; ctx.fillText(noteNames[NOTE_COUNT - 1 - i], 2, y + 11); } } }} style={{ display: 'block' }} />
        </div>
        <div style={{ flex: 1, overflow: 'auto', minHeight: 0, position: 'relative' }} onScroll={(e) => { offsetXRef.current = e.target.scrollLeft; offsetYRef.current = e.target.scrollTop; requestRedraw(); }}>
          <canvas ref={canvasRef} width={800} height={300} style={{ display: 'block' }} />
          <canvas ref={playheadCanvasRef} width={800} height={300} style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }} />
        </div>
      </div>

      {contextMenu.visible && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 999 }} onClick={closeCM} onContextMenu={e => { e.preventDefault(); closeCM(); }}>
          <div style={{ position: 'fixed', top: Math.min(contextMenu.y, window.innerHeight - 260), left: Math.min(contextMenu.x, window.innerWidth - 150), background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 6, zIndex: 1000, minWidth: 140, padding: 4, boxShadow: '0 4px 16px rgba(0,0,0,0.6)' }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', padding: '4px 8px', borderBottom: '1px solid var(--border)', marginBottom: 3 }}>
              {selectedNotes.length > 0 ? `${selectedNotes.length} ${lang === 'zh' ? '个音符' : ' notes'}` : ''}
            </div>
            <button onClick={() => quantizeNotes(1/8)} style={{ display: 'block', width: '100%', textAlign: 'left', background: 'none', border: 'none', borderRadius: 3, padding: '5px 8px', fontSize: '0.72rem', color: 'var(--text)' }}>{t.quantize8th}</button>
            <button onClick={() => quantizeNotes(1/4)} style={{ display: 'block', width: '100%', textAlign: 'left', background: 'none', border: 'none', borderRadius: 3, padding: '5px 8px', fontSize: '0.72rem', color: 'var(--text)' }}>{t.quantize4th}</button>
            <button onClick={() => quantizeNotes(1/2)} style={{ display: 'block', width: '100%', textAlign: 'left', background: 'none', border: 'none', borderRadius: 3, padding: '5px 8px', fontSize: '0.72rem', color: 'var(--text)' }}>{t.quantizeHalf}</button>
            <div style={{ height: 1, background: 'var(--border)', margin: '2px 0' }} />
            <button onClick={() => changeVelocity(10)} style={{ display: 'block', width: '100%', textAlign: 'left', background: 'none', border: 'none', borderRadius: 3, padding: '5px 8px', fontSize: '0.72rem', color: 'var(--text)' }}>{t.changeVelocity} +10</button>
            <button onClick={() => changeVelocity(-10)} style={{ display: 'block', width: '100%', textAlign: 'left', background: 'none', border: 'none', borderRadius: 3, padding: '5px 8px', fontSize: '0.72rem', color: 'var(--text)' }}>{t.changeVelocity} -10</button>
            <div style={{ height: 1, background: 'var(--border)', margin: '2px 0' }} />
            <button onClick={copySelected} style={{ display: 'block', width: '100%', textAlign: 'left', background: 'none', border: 'none', borderRadius: 3, padding: '5px 8px', fontSize: '0.72rem', color: 'var(--text)' }}>{t.copy}</button>
            <button onClick={cutSelected} style={{ display: 'block', width: '100%', textAlign: 'left', background: 'none', border: 'none', borderRadius: 3, padding: '5px 8px', fontSize: '0.72rem', color: 'var(--text)' }}>{t.cut}</button>
            <button onClick={pasteNotes} style={{ display: 'block', width: '100%', textAlign: 'left', background: 'none', border: 'none', borderRadius: 3, padding: '5px 8px', fontSize: '0.72rem', color: 'var(--text)' }}>{t.paste}</button>
            <div style={{ height: 1, background: 'var(--border)', margin: '2px 0' }} />
            <button onClick={deleteSelected} style={{ display: 'block', width: '100%', textAlign: 'left', background: 'none', border: 'none', borderRadius: 3, padding: '5px 8px', fontSize: '0.72rem', color: 'var(--danger)' }}>{t.deleteSelected}</button>
          </div>
        </div>
      )}
    </div>
  );
}