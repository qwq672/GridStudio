import React, { useState, useEffect, useRef, useCallback } from 'react';
import MenuBar from './components/MenuBar';
import TrackPanel from './components/TrackPanel';
import PianoRoll from './components/PianoRoll';
import Transport from './components/Transport';
import SettingsModal from './components/SettingsModal';
import { useProject } from './hooks/useProject';
import { parseMidiFile, generateMidiFile } from './lib/midi';
import { useAudioEngine } from './hooks/useAudioEngine';
import './index.css';

export default function App() {
  // 项目管理
  const {
    tracks, currentTrackId, bpm, meta, setBpm, setMeta,
    addTrack, deleteTrack, updateTrack,
    addNote, deleteNote, updateNote,
    quantizeTrack, clearTrack,
    importMidiData, exportProject, importProject,
    undo, redo,
    setCurrentTrackId,
  } = useProject();

  // 音频引擎
  const { playNote, audioCtxRef, masterGainRef, dryGainRef, wetReverbRef, wetDelayRef } = useAudioEngine();

  // 播放状态
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const playIntervalRef = useRef(null);

  // UI 状态
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [mode, setMode] = useState('desktop');
  const [uiScale, setUiScale] = useState(100);
  const [reverbSend, setReverbSend] = useState(0.3);
  const [delaySend, setDelaySend] = useState(0.2);

  // 音色来源（默认振荡器）
  const [soundSource, setSoundSource] = useState('default');

  // 应用 UI 缩放
  useEffect(() => {
    document.body.style.zoom = uiScale / 100;
  }, [uiScale]);

  // 效果器参数更新
  useEffect(() => {
    if (wetReverbRef.current) wetReverbRef.current.gain.value = reverbSend;
    if (dryGainRef.current) dryGainRef.current.gain.value = Math.max(0, 1 - reverbSend * 0.7);
  }, [reverbSend]);
  useEffect(() => {
    if (wetDelayRef.current) wetDelayRef.current.gain.value = delaySend;
  }, [delaySend]);

  // 播放控制
  const stopPlayback = useCallback(() => {
    setIsPlaying(false);
    if (playIntervalRef.current) clearInterval(playIntervalRef.current);
    setCurrentTime(0);
  }, []);

  const startPlayback = useCallback(async () => {
    if (tracks.length === 0) return;
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    if (ctx.state === 'suspended') await ctx.resume();
    stopPlayback();
    setIsPlaying(true);
    const start = ctx.currentTime;
    const events = [];
    for (const track of tracks) {
      if (track.mute) continue;
      for (const note of track.notes) {
        events.push({
          time: note.startSec,
          dur: note.durationSec,
          pitch: note.pitch,
          vel: note.velocity,
          prog: track.program,
        });
      }
    }
    events.sort((a,b) => a.time - b.time);
    const total = events.length ? Math.max(...events.map(e => e.time + e.dur)) : 0;
    setTotalDuration(total);
    for (const ev of events) {
      setTimeout(() => {
        if (isPlaying) playNote(ev.pitch, ev.dur, ev.vel, ev.prog);
      }, ev.time * 1000);
    }
    playIntervalRef.current = setInterval(() => {
      if (!isPlaying) return;
      const elapsed = ctx.currentTime - start;
      setCurrentTime(Math.min(elapsed, total));
      if (elapsed >= total) stopPlayback();
    }, 50);
  }, [tracks, playNote, isPlaying, stopPlayback]);

  // 处理笔记变化（由 PianoRoll 触发）
  const handleNotesChange = useCallback((newNotes) => {
    const track = tracks.find(t => t.id === currentTrackId);
    if (track) {
      updateTrack(currentTrackId, { notes: newNotes });
    }
  }, [tracks, currentTrackId, updateTrack]);

  // MIDI 导入
  const handleImportMidi = useCallback(async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.mid,.midi';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      try {
        const arrayBuffer = await file.arrayBuffer();
        const data = await parseMidiFile(arrayBuffer);
        importMidiData(data);
      } catch (err) {
        alert('MIDI import failed: ' + err.message);
      }
    };
    input.click();
  }, [importMidiData]);

  // MIDI 导出
  const handleExportMidi = useCallback(() => {
    try {
      const file = generateMidiFile(tracks, bpm, meta);
      const blob = new Blob([file], { type: 'audio/midi' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'export.mid';
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('MIDI export failed: ' + err.message);
    }
  }, [tracks, bpm, meta]);

  // 工程导入/导出
  const handleSaveProject = useCallback(() => exportProject(), [exportProject]);
  const handleLoadProject = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const text = await file.text();
      importProject(text);
    };
    input.click();
  }, [importProject]);

  const handleNewProject = useCallback(() => {
    if (confirm('Start a new project? Current unsaved data will be lost.')) {
      window.location.reload(); // 简单重置，也可通过 useProject 实现
    }
  }, []);

  // 轨道操作包装
  const currentTrack = tracks.find(t => t.id === currentTrackId);
  const handleVolumeChange = (id, vol) => updateTrack(id, { volume: vol });
  const handlePanChange = (id, pan) => updateTrack(id, { pan });
  const handleMuteToggle = (id) => {
    const track = tracks.find(t => t.id === id);
    if (track) updateTrack(id, { mute: !track.mute });
  };
  const handleProgramChange = (id, program) => updateTrack(id, { program });

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <MenuBar
        onNewProject={handleNewProject}
        onImportMidi={handleImportMidi}
        onExportMidi={handleExportMidi}
        onSaveProject={handleSaveProject}
        onLoadProject={handleLoadProject}
        onUndo={undo}
        onRedo={redo}
        onQuantize={() => quantizeTrack(currentTrackId)}
        onClearTrack={() => clearTrack(currentTrackId)}
        onOpenSettings={() => setSettingsOpen(true)}
        onToggleMode={() => setMode(mode === 'desktop' ? 'touch' : 'desktop')}
        onFullscreen={() => { if (!document.fullscreenElement) document.documentElement.requestFullscreen(); else document.exitFullscreen(); }}
        mode={mode}
      />
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', padding: 8, gap: 8 }}>
        <TrackPanel
          tracks={tracks}
          currentTrackId={currentTrackId}
          onSelectTrack={setCurrentTrackId}
          onAddTrack={addTrack}
          onDeleteTrack={deleteTrack}
          onVolumeChange={handleVolumeChange}
          onPanChange={handlePanChange}
          onMuteToggle={handleMuteToggle}
          onProgramChange={handleProgramChange}
        />
        <PianoRoll
          track={currentTrack}
          onNotesChange={handleNotesChange}
          playNote={playNote}
          isPlaying={isPlaying}
          currentTime={currentTime}
        />
      </div>
      <Transport
        bpm={bpm}
        onBpmChange={setBpm}
        isPlaying={isPlaying}
        onPlay={startPlayback}
        onStop={stopPlayback}
        currentTime={currentTime}
        totalDuration={totalDuration}
        onSeek={(time) => {
          // 简单实现：停止并重新调度（简化）
          stopPlayback();
          // 不能直接 seek，需要重新调度，这里先不做复杂处理
          alert('Seek not yet implemented in this version');
        }}
        reverbSend={reverbSend}
        onReverbSendChange={setReverbSend}
        delaySend={delaySend}
        onDelaySendChange={setDelaySend}
      />
      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        uiScale={uiScale}
        onUiScaleChange={setUiScale}
        meta={meta}
        onMetaChange={setMeta}
        soundSource={soundSource}
        onSoundSourceChange={setSoundSource}
        onLoadSF2={() => alert('SF2 loading not yet implemented')}
      />
    </div>
  );
}
