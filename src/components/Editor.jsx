import React from 'react';
import MenuBar from './MenuBar';
import TrackPanel from './TrackPanel';
import PianoRoll from './PianoRoll';
import Transport from './Transport';
import SettingsModal from './SettingsModal';
import MidiInfoModal from './MidiInfoModal';

export default function Editor({
  project,
  audioEngine,
  autoSaveMode,
  setAutoSaveMode,
  onExitToHome,
  onOpenSettings,
  onOpenMidiInfo,
  onExportMidi,
  onSaveProject,
  onLoadProject,
  onNewProject,
  onToggleMode,
  onFullscreen,
  mode,
  settingsOpen,
  setSettingsOpen,
  midiInfoOpen,
  setMidiInfoOpen,
  soundSource,
  setSoundSource,
  meta,
  setMeta,
  uiScale,
  onUiScaleChange,
  onClearCache,
  onResetSettings,
  lang,
  onLangChange,
  onLoadSF2,
  sf2Loaded,
  sf2Name,
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

  const { playNote, reverbSend, setReverbSend, delaySend, setDelaySend, delayTime, setDelayTime, delayFeedback, setDelayFeedback } = audioEngine;
  const currentTrack = tracks.find(t => t.id === currentTrackId);

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
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
        onOpenMidiInfo={onOpenMidiInfo}
        onToggleMode={onToggleMode}
        onFullscreen={onFullscreen}
        onExitToHome={onExitToHome}
        mode={mode}
        onUndo={undo}
        onRedo={redo}
        onQuantize={() => quantizeTrack(currentTrackId)}
        onClearTrack={() => clearTrack(currentTrackId)}
        lang={lang}
      />
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', padding: 8, gap: 8, minHeight: 0 }}>
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
          playNote={playNote}
          lang={lang}
        />
        {currentTrack && (
          <PianoRoll
            track={currentTrack}
            onNotesChange={(newNotes) => updateTrack(currentTrackId, { notes: newNotes })}
            playNote={(pitch, duration, velocity) => playNote(pitch, duration, velocity, currentTrack.program)}
            isPlaying={audioEngine.isPlaying}
            currentTime={audioEngine.currentTime}
            lang={lang}
          />
        )}
      </div>
      <Transport
        bpm={bpm}
        onBpmChange={setBpm}
        isPlaying={audioEngine.isPlaying}
        onPlay={() => audioEngine.startPlayback(tracks)}
        onStop={audioEngine.stopPlayback}
        currentTime={audioEngine.currentTime}
        totalDuration={audioEngine.totalDuration}
        onSeek={audioEngine.seekTo}
        reverbSend={reverbSend}
        onReverbSendChange={setReverbSend}
        delaySend={delaySend}
        onDelaySendChange={setDelaySend}
        delayTime={delayTime}
        onDelayTimeChange={setDelayTime}
        delayFeedback={delayFeedback}
        onDelayFeedbackChange={setDelayFeedback}
        lang={lang}
      />
      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        uiScale={uiScale}
        onUiScaleChange={onUiScaleChange}
        soundSource={soundSource}
        onSoundSourceChange={setSoundSource}
        autoSaveMode={autoSaveMode}
        onAutoSaveModeChange={setAutoSaveMode}
        onClearCache={onClearCache}
        onResetSettings={onResetSettings}
        lang={lang}
        onLangChange={onLangChange}
        onLoadSF2={onLoadSF2}
        sf2Loaded={sf2Loaded}
        sf2Name={sf2Name}
      />
      <MidiInfoModal
        open={midiInfoOpen}
        onClose={() => setMidiInfoOpen(false)}
        meta={meta}
        onMetaChange={setMeta}
        lang={lang}
      />
    </div>
  );
}
