// src/App.jsx
import React, { useState, useEffect } from 'react';
import { useProject } from './hooks/useProject';
import { useAudioEngine } from './hooks/useAudioEngine';
import MenuBar from './components/MenuBar';
// src/App.jsx
import React, { useState, useEffect } from 'react';
import { useProject } from './hooks/useProject';
import { useAudioEngine } from './hooks/useAudioEngine';
import MenuBar from './components/MenuBar';
import TrackPanel from './components/TrackPanel';
import PianoRoll from './components/PianoRoll';
import Transport from './components/Transport';
import SettingsModal from './components/SettingsModal';
import './index.css';

export default function App() {
  const {
    tracks,
    currentTrackId,
    bpm,
    meta,
    setBpm,
    setMeta,
    setCurrentTrackId,
    addTrack,
    deleteTrack,
    updateTrack,
    addNote,
    deleteNote,
    updateNote,
    quantizeTrack,
    clearTrack,
    importMidiData,
    exportProject,
    importProject,
    undo,
    redo,
  } = useProject();

  const { playNote, reloadInstrument, soundSource, setSoundSource } = useAudioEngine();

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [midiInfoOpen, setMidiInfoOpen] = useState(false);
  const [mode, setMode] = useState('desktop');
  const [uiScale, setUiScale] = useState(() => {
    const saved = localStorage.getItem('uiScale');
    return saved ? parseInt(saved) : 100;
  });

  // 监听自定义事件（撤销/重做/量化/清空）
  useEffect(() => {
    const handleUndo = () => undo();
    const handleRedo = () => redo();
    const handleQuantize = () => {
      if (currentTrackId) quantizeTrack(currentTrackId, 0.25);
    };
    const handleClear = () => {
      if (currentTrackId && confirm('清空当前轨道所有音符？')) clearTrack(currentTrackId);
    };
    window.addEventListener('undo', handleUndo);
    window.addEventListener('redo', handleRedo);
    window.addEventListener('quantize', handleQuantize);
    window.addEventListener('clearTrack', handleClear);
    return () => {
      window.removeEventListener('undo', handleUndo);
      window.removeEventListener('redo', handleRedo);
      window.removeEventListener('quantize', handleQuantize);
      window.removeEventListener('clearTrack', handleClear);
    };
  }, [undo, redo, quantizeTrack, clearTrack, currentTrackId]);

  // 整体界面缩放
  useEffect(() => {
    document.body.style.zoom = uiScale / 100;
    localStorage.setItem('uiScale', uiScale);
  }, [uiScale]);

  // 播放控制（简化演示，实际需要实现精确调度）
  const startPlayback = () => {
    if (!tracks.length) return;
    setIsPlaying(true);
    // TODO: 实现音符调度
  };
  const stopPlayback = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const currentTrack = tracks.find(t => t.id === currentTrackId);

  // 处理音符变化
  const handleNotesChange = (newNotes) => {
    if (currentTrack) {
      updateTrack(currentTrackId, { notes: newNotes });
    }
  };

  // 导入 MIDI
  const handleImportMidi = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.mid,.midi';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const arrayBuffer = await file.arrayBuffer();
      const { parseMidiFile } = await import('./lib/midi');
      const midiData = await parseMidiFile(arrayBuffer);
      importMidiData(midiData);
      // 重新加载音色（第一个轨道的 program）
      if (midiData.tracks.length > 0) {
        reloadInstrument(midiData.tracks[0].program);
      }
    };
    input.click();
  };

  // 导出 MIDI
  const handleExportMidi = async () => {
    if (!tracks.length) return;
    const { generateMidiFile } = await import('./lib/midi');
    const midiBlob = generateMidiFile(tracks, bpm, meta);
    const url = URL.createObjectURL(new Blob([midiBlob], { type: 'audio/midi' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'export.mid';
    a.click();
    URL.revokeObjectURL(url);
  };

  // 全屏
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <MenuBar
        onNewProject={() => window.location.reload()}
        onImportMidi={handleImportMidi}
        onExportMidi={handleExportMidi}
        onSaveProject={exportProject}
        onLoadProject={() => {
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = '.json';
          input.onchange = async e => {
            const file = e.target.files[0];
            const text = await file.text();
            importProject(text);
          };
          input.click();
        }}
        onOpenSettings={() => setSettingsOpen(true)}
        onOpenMidiInfo={() => setMidiInfoOpen(true)}
        onToggleMode={() => setMode(mode === 'desktop' ? 'touch' : 'desktop')}
        onFullscreen={toggleFullscreen}
        mode={mode}
      />
      <div className="workspace">
        <TrackPanel
          tracks={tracks}
          currentTrackId={currentTrackId}
          onSelectTrack={setCurrentTrackId}
          onAddTrack={addTrack}
          onDeleteTrack={deleteTrack}
          onUpdateTrack={updateTrack}
          soundSource={soundSource}
          setSoundSource={setSoundSource}
          playNote={playNote}
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
        onSeek={(time) => setCurrentTime(time)}
      />
      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        uiScale={uiScale}
        onUiScaleChange={setUiScale}
      />
      {/* MIDI 信息编辑模态框 */}
      <div className={`modal ${midiInfoOpen ? 'active' : ''}`} onClick={() => setMidiInfoOpen(false)}>
        <div className="modal-content" onClick={e => e.stopPropagation()}>
          <h3>MIDI 信息</h3>
          <div style={{ margin: '16px 0' }}>
            <label>标题</label>
            <input
              type="text"
              value={meta.title}
              onChange={e => setMeta({ ...meta, title: e.target.value })}
              style={{ width: '100%', marginTop: 4 }}
            />
          </div>
          <div style={{ margin: '16px 0' }}>
            <label>作者</label>
            <input
              type="text"
              value={meta.artist}
              onChange={e => setMeta({ ...meta, artist: e.target.value })}
              style={{ width: '100%', marginTop: 4 }}
            />
          </div>
          <div style={{ margin: '16px 0' }}>
            <label>歌手</label>
            <input
              type="text"
              value={meta.singer}
              onChange={e => setMeta({ ...meta, singer: e.target.value })}
              style={{ width: '100%', marginTop: 4 }}
            />
          </div>
          <div style={{ margin: '16px 0' }}>
            <label>版权</label>
            <input
              type="text"
              value={meta.copyright}
              onChange={e => setMeta({ ...meta, copyright: e.target.value })}
              style={{ width: '100%', marginTop: 4 }}
            />
          </div>
          <button onClick={() => setMidiInfoOpen(false)}>关闭</button>
        </div>
      </div>
    </div>
  );
}
