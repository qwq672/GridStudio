import { useState, useCallback, useRef } from 'react';

// 生成唯一 ID
let nextId = 1;
function generateId() { return nextId++; }

export function useProject() {
  const [tracks, setTracks] = useState([
    { id: generateId(), name: "Piano", program: 0, notes: [], volume: 80, pan: 64, mute: false }
  ]);
  const [currentTrackId, setCurrentTrackId] = useState(tracks[0].id);
  const [bpm, setBpm] = useState(120);
  const [meta, setMeta] = useState({ title: "", artist: "", singer: "", copyright: "" });
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);

  const pushUndo = useCallback(() => {
    setUndoStack(prev => [...prev, { tracks, bpm, meta, currentTrackId }]);
    setRedoStack([]);
  }, [tracks, bpm, meta, currentTrackId]);

  const undo = useCallback(() => {
    if (undoStack.length === 0) return;
    const last = undoStack[undoStack.length - 1];
    setRedoStack(prev => [...prev, { tracks, bpm, meta, currentTrackId }]);
    setTracks(last.tracks);
    setBpm(last.bpm);
    setMeta(last.meta);
    setCurrentTrackId(last.currentTrackId);
    setUndoStack(prev => prev.slice(0, -1));
  }, [undoStack, tracks, bpm, meta, currentTrackId]);

  const redo = useCallback(() => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setUndoStack(prev => [...prev, { tracks, bpm, meta, currentTrackId }]);
    setTracks(next.tracks);
    setBpm(next.bpm);
    setMeta(next.meta);
    setCurrentTrackId(next.currentTrackId);
    setRedoStack(prev => prev.slice(0, -1));
  }, [redoStack, tracks, bpm, meta, currentTrackId]);

  // 轨道操作
  const addTrack = useCallback(() => {
    pushUndo();
    const newId = generateId();
    setTracks(prev => [...prev, { id: newId, name: `Track ${prev.length+1}`, program: 0, notes: [], volume: 80, pan: 64, mute: false }]);
    setCurrentTrackId(newId);
  }, [pushUndo]);

  const deleteTrack = useCallback((id) => {
    if (tracks.length === 1) return;
    pushUndo();
    setTracks(prev => prev.filter(t => t.id !== id));
    if (currentTrackId === id) {
      setCurrentTrackId(tracks[0].id === id ? tracks[1]?.id : tracks[0].id);
    }
  }, [tracks, currentTrackId, pushUndo]);

  const updateTrack = useCallback((id, updates) => {
    pushUndo();
    setTracks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  }, [pushUndo]);

  // 音符操作
  const addNote = useCallback((trackId, note) => {
    pushUndo();
    setTracks(prev => prev.map(t => {
      if (t.id !== trackId) return t;
      const existing = t.notes.find(n => Math.abs(n.startSec - note.startSec) < 0.05 && n.pitch === note.pitch);
      if (existing) return t;
      const newNotes = [...t.notes, note].sort((a,b) => a.startSec - b.startSec);
      return { ...t, notes: newNotes };
    }));
  }, [pushUndo]);

  const deleteNote = useCallback((trackId, noteToDelete) => {
    pushUndo();
    setTracks(prev => prev.map(t => {
      if (t.id !== trackId) return t;
      return { ...t, notes: t.notes.filter(n => n !== noteToDelete) };
    }));
  }, [pushUndo]);

  const updateNote = useCallback((trackId, oldNote, newNote) => {
    pushUndo();
    setTracks(prev => prev.map(t => {
      if (t.id !== trackId) return t;
      const notes = t.notes.map(n => n === oldNote ? newNote : n);
      notes.sort((a,b) => a.startSec - b.startSec);
      return { ...t, notes };
    }));
  }, [pushUndo]);

  const quantizeTrack = useCallback((trackId, gridSec = 0.25) => {
    pushUndo();
    setTracks(prev => prev.map(t => {
      if (t.id !== trackId) return t;
      const notes = t.notes.map(n => ({
        ...n,
        startSec: Math.round(n.startSec / gridSec) * gridSec,
        durationSec: Math.max(gridSec, Math.round(n.durationSec / gridSec) * gridSec),
      }));
      notes.sort((a,b) => a.startSec - b.startSec);
      return { ...t, notes };
    }));
  }, [pushUndo]);

  const clearTrack = useCallback((trackId) => {
    pushUndo();
    setTracks(prev => prev.map(t => t.id === trackId ? { ...t, notes: [] } : t));
  }, [pushUndo]);

  // 导入 MIDI 数据
  const importMidiData = useCallback((midiData) => {
    pushUndo();
    const newTracks = midiData.tracks.map((t, idx) => ({
      id: generateId(),
      name: t.name || `Track ${idx+1}`,
      program: t.program,
      notes: t.notes,
      volume: 80,
      pan: 64,
      mute: false,
    }));
    setTracks(newTracks);
    setBpm(midiData.bpm);
    setMeta(prev => ({ ...prev, title: midiData.title || "", copyright: midiData.copyright || "" }));
    setCurrentTrackId(newTracks[0]?.id);
  }, [pushUndo]);

  // 导出工程 JSON
  const exportProject = useCallback(() => {
    const data = { tracks, bpm, meta };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'gridstudio_project.json';
    a.click();
    URL.revokeObjectURL(url);
  }, [tracks, bpm, meta]);

  const importProject = useCallback((jsonData) => {
    pushUndo();
    const data = JSON.parse(jsonData);
    setTracks(data.tracks);
    setBpm(data.bpm);
    setMeta(data.meta || { title: "", artist: "", singer: "", copyright: "" });
    setCurrentTrackId(data.tracks[0]?.id);
  }, [pushUndo]);

  return {
    tracks, currentTrackId, bpm, meta,
    setBpm, setMeta,
    addTrack, deleteTrack, updateTrack,
    addNote, deleteNote, updateNote,
    quantizeTrack, clearTrack,
    importMidiData, exportProject, importProject,
    undo, redo,
    setCurrentTrackId,
  };
}
