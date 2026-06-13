import React from 'react';
import MenuBar from './MenuBar';
import TrackPanel from './TrackPanel';
import PianoRoll from './PianoRoll';
import Transport from './Transport';
import SettingsModal from './SettingsModal';

export default function Editor({
  project,
  audioEngine,
  autoSaveMode,
  setAutoSaveMode,
  onExitToHome,
  onOpenSettings,
  onExportMidi,
  onSaveProject,
  onLoadProject,
  onNewProject,
  onToggleMode,
  onFullscreen,
  mode,
  settingsOpen,
  setSettingsOpen,
  soundSource,
  setSoundSource,
  meta,
  setMeta,
}) {
  const {
    tracks,
    currentTrackId,
    bpm,
    setBpm,
    addTrack,
    deleteTrack,
    updateTrack,
    quantizeTrack,
    clearTrack,
    undo,
    redo,
    setCurrentTrackId,
  } = project;

  const { playNote, reverbSend, setReverbSend, delaySend, setDelaySend } = audioEngine;

  const currentTrack = tracks.find(t => t.id === currentTrackId);

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <MenuBar
        onNewProject={onNewProject}
        onImportMidi={() => {
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = '.mid,.midi';
          input.onchange = (e) => {
            if (e.target.files[0]) {
              const reader = new FileReader();
              reader.onload = async (ev) => {
                const { parseMidiFile } = await import('../lib/midi');
                const midiData = await parseMidiFile(ev.target.result);
                project.importMidiData(midiData);
              };
              reader.readAsArrayBuffer(e.target.files[0]);
            }
          };
          input.click();
        }}
        onExportMidi={onExportMidi}
        onSaveProject={onSaveProject}
        onLoadProject={onLoadProject}
        onOpenSettings={onOpenSettings}
        onToggleMode={onToggleMode}
        onFullscreen={onFullscreen}
        mode={mode}
        onUndo={undo}
        onRedo={redo}
        onQuantize={() => quantizeTrack(currentTrackId)}
        onClearTrack={() => clearTrack(currentTrackId)}
        onExitToHome={onExitToHome}
      />
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', padding: 8, gap: 8 }}>
        <TrackPanel
          tracks={tracks}
          currentTrackId={currentTrackId}
          onSelectTrack={setCurrentTrackId}
          onAddTrack={addTrack}
          onDeleteTrack={deleteTrack}
          onVolumeChange={(id, vol) => updateTrack(id, { volume: vol })}
          onPanChange={(id, pan) => updateTrack(id, { pan })}
          onMuteToggle={(id) => {
            const track = tracks.find(t => t.id === id);
            updateTrack(id, { mute: !track.mute });
          }}
          onProgramChange={(id, prog) => updateTrack(id, { program: prog })}
        />
        {currentTrack && (
          <PianoRoll
            track={currentTrack}
            onNotesChange={(newNotes) => updateTrack(currentTrackId, { notes: newNotes })}
            playNote={(pitch, duration, velocity) => playNote(pitch, duration, velocity, currentTrack.program)}
            isPlaying={project.isPlaying || false}
            currentTime={project.currentTime || 0}
          />
        )}
      </div>
      <Transport
        bpm={bpm}
        onBpmChange={setBpm}
        isPlaying={project.isPlaying || false}
        onPlay={project.startPlayback}
        onStop={project.stopPlayback}
        currentTime={project.currentTime || 0}
        totalDuration={project.totalDuration || 0}
        onSeek={(time) => {
          project.stopPlayback();
          project.setCurrentTime?.(time);
        }}
        reverbSend={reverbSend}
        onReverbSendChange={setReverbSend}
        delaySend={delaySend}
        onDelaySendChange={setDelaySend}
      />
      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        uiScale={100}  // 可以从 localStorage 读取，这里简化
        onUiScaleChange={(val) => { document.body.style.zoom = val / 100; localStorage.setItem('uiScale', val); }}
        soundSource={soundSource}
        onSoundSourceChange={setSoundSource}
        meta={meta}
        onMetaChange={setMeta}
        autoSaveMode={autoSaveMode}
        onAutoSaveModeChange={setAutoSaveMode}
        onClearCache={() => {
          if (confirm('清除所有缓存的未保存工程？此操作不可恢复。')) {
            localStorage.removeItem('gridstudio_autosave');
            localStorage.removeItem('gridstudio_recent_projects');
            alert('已清除所有本地缓存工程');
          }
        }}
        onResetSettings={() => {
          localStorage.removeItem('gridstudio_autosave_mode');
          localStorage.removeItem('uiScale');
          setAutoSaveMode({ type: 'onChange', interval: 0 });
          document.body.style.zoom = '1';
          alert('设置已重置');
        }}
      />
    </div>
  );
}