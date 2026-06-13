// src/App.jsx
import React, { useState, useEffect } from 'react';
import { useProject } from './hooks/useProject';
import { useAudioEngine } from './hooks/useAudioEngine';
import MenuBar from './components/MenuBar';
import TrackPanel from './components/TrackPanel';
import PianoRoll from './components/PianoRoll';
import Transport from './components/Transport';
import SettingsModal from './components/SettingsModal';
import { Icons } from './components/Icons';
import './index.css';

export default function App() {
  // 核心状态
  const {
    tracks, setTracks,
    currentTrackId, setCurrentTrackId,
    bpm, setBpm,
    meta, setMeta,
    addTrack, deleteTrack, updateTrack,
    addNote, deleteNote, updateNote,
    quantizeTrack, clearTrack,
    importMidiData, exportProject, importProject,
    undo, redo,
  } = useProject();

  const { playNote, audioCtxRef, setSoundSource, soundSource } = useAudioEngine();
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

  // 整体界面缩放
  useEffect(() => {
    document.body.style.zoom = uiScale / 100;
    localStorage.setItem('uiScale', uiScale);
  }, [uiScale]);

  // 播放相关（简化，实际需要实现调度）
  const startPlayback = () => {
    if (!audioCtxRef.current) return;
    setIsPlaying(true);
    // TODO: 实现音符调度
  };
  const stopPlayback = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const currentTrack = tracks.find(t => t.id === currentTrackId);

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <MenuBar
        onNewProject={() => window.location.reload()}
        onImportMidi={() => {
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = '.mid,.midi';
          input.onchange = async e => {
            const file = e.target.files[0];
            if (!file) return;
            const arrayBuffer = await file.arrayBuffer();
            const { parseMidiFile } = await import('./lib/midi');
            const midiData = await parseMidiFile(arrayBuffer);
            importMidiData(midiData);
          };
          input.click();
        }}
        onExportMidi={() => alert('导出 MIDI 待实现')}
        onSaveProject={() => exportProject()}
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
        onFullscreen={() => {
          if (!document.fullscreenElement) document.documentElement.requestFullscreen();
          else document.exitFullscreen();
        }}
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
          onNotesChange={(newNotes) => {
            if (currentTrack) {
              updateTrack(currentTrackId, { notes: newNotes });
            }
          }}
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
            <input type="text" value={meta.title} onChange={e => setMeta({ ...meta, title: e.target.value })} style={{ width: '100%', marginTop: 4 }} />
          </div>
          <div style={{ margin: '16px 0' }}>
            <label>作者</label>
            <input type="text" value={meta.artist} onChange={e => setMeta({ ...meta, artist: e.target.value })} style={{ width: '100%', marginTop: 4 }} />
          </div>
          <div style={{ margin: '16px 0' }}>
            <label>歌手</label>
            <input type="text" value={meta.singer} onChange={e => setMeta({ ...meta, singer: e.target.value })} style={{ width: '100%', marginTop: 4 }} />
          </div>
          <div style={{ margin: '16px 0' }}>
            <label>版权</label>
            <input type="text" value={meta.copyright} onChange={e => setMeta({ ...meta, copyright: e.target.value })} style={{ width: '100%', marginTop: 4 }} />
          </div>
          <button onClick={() => setMidiInfoOpen(false)}>关闭</button>
        </div>
      </div>
    </div>
  );
}
