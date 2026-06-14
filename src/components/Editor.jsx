import React, { memo, useState } from 'react';
import MenuBar from './MenuBar';
import TrackPanel from './TrackPanel';
import PianoRoll from './PianoRoll';
import Transport from './Transport';
import SettingsModal from './SettingsModal';
import MidiInfoModal from './MidiInfoModal';
import { Icons } from './Icons';

const Editor = memo(({
  project, audioEngine, autoSaveMode, setAutoSaveMode,
  onExitToHome, onOpenSettings, onOpenMidiInfo, onExportMidi,
  onSaveProject, onLoadProject, onNewProject,
  onToggleMode, onFullscreen, mode,
  settingsOpen, setSettingsOpen, midiInfoOpen, setMidiInfoOpen,
  soundSource, setSoundSource, meta, setMeta,
  uiScale, onUiScaleChange, onClearCache, onResetSettings,
  lang, onLangChange, onLoadSF2, sf2Loaded, sf2Name,
}) => {
  const {
    tracks, currentTrackId, bpm, setBpm,
    addTrack, deleteTrack, updateTrack, quantizeTrack, clearTrack,
    undo, redo, setCurrentTrackId,
  } = project;

  const { playNote, reverbSend, setReverbSend, delaySend, setDelaySend, delayTime, setDelayTime, delayFeedback, setDelayFeedback } = audioEngine;
  const currentTrack = tracks.find(t => t.id === currentTrackId);
  const [editMode, setEditMode] = useState('pointer');
  const [quantizeValue, setQuantizeValue] = useState('1/4');
  const [aboutOpen, setAboutOpen] = useState(false);

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
        analyserNodeRef={audioEngine.analyserNodeRef}
        isPlaying={audioEngine.isPlaying}
        editMode={editMode}
        onEditModeChange={setEditMode}
        quantizeValue={quantizeValue}
        onQuantizeValueChange={setQuantizeValue}
        onOpenAbout={() => setAboutOpen(true)}
      />
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', padding: 6, gap: 6, minHeight: 0 }}>
        <TrackPanel
          tracks={tracks}
          currentTrackId={currentTrackId}
          onSelectTrack={setCurrentTrackId}
          onAddTrack={addTrack}
          onDeleteTrack={deleteTrack}
          onVolumeChange={(id, vol) => updateTrack(id, { volume: vol })}
          onPanChange={(id, pan) => updateTrack(id, { pan })}
          onMuteToggle={(id) => { const t = tracks.find(tr => tr.id === id); updateTrack(id, { mute: !t.mute }); }}
          onProgramChange={(id, prog) => updateTrack(id, { program: prog })}
          onColorChange={(id, color) => updateTrack(id, { color })}
          onCommentChange={(id, comment) => updateTrack(id, { comment })}
          playNote={playNote}
          lang={lang}
        />
        {currentTrack && (
          <PianoRoll
            track={currentTrack}
            onNotesChange={(newNotes) => updateTrack(currentTrackId, { notes: newNotes })}
            playNote={(pitch, duration, velocity) => playNote(pitch, duration, velocity, currentTrack.program)}
            isPlaying={audioEngine.isPlaying}
            getPlaybackTime={audioEngine.getPlaybackTime}
            lang={lang}
            editMode={editMode}
            quantizeValue={quantizeValue}
          />
        )}
      </div>
      <Transport
        bpm={bpm}
        onBpmChange={setBpm}
        isPlaying={audioEngine.isPlaying}
        isPaused={audioEngine.isPaused}
        onPlay={() => audioEngine.startPlayback(tracks, bpm)}
        onPause={audioEngine.pausePlayback}
        onResume={() => audioEngine.resumePlayback(tracks, bpm)}
        onStop={audioEngine.stopPlayback}
        currentTime={audioEngine.currentTime}
        totalDuration={audioEngine.totalDuration}
        onSeek={audioEngine.seekTo}
        getPlaybackTime={audioEngine.getPlaybackTime}
        reverbSend={reverbSend}
        onReverbSendChange={setReverbSend}
        delaySend={delaySend}
        onDelaySendChange={setDelaySend}
        delayTime={delayTime}
        onDelayTimeChange={setDelayTime}
        delayFeedback={delayFeedback}
        onDelayFeedbackChange={setDelayFeedback}
        metronomeOn={audioEngine.metronomeOn}
        onMetronomeOnChange={audioEngine.setMetronomeOn}
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
        bufferSize={audioEngine.bufferSize}
        onBufferSizeChange={audioEngine.setBufferSize}
      />
      <MidiInfoModal
        open={midiInfoOpen}
        onClose={() => setMidiInfoOpen(false)}
        meta={meta}
        onMetaChange={setMeta}
        lang={lang}
      />

      {/* 关于对话框 */}
      {aboutOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.7)' }} onClick={() => setAboutOpen(false)}>
          <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 12, padding: 24, maxWidth: 380, width: '90vw', textAlign: 'center' }} onClick={e => e.stopPropagation()}>
            <img src="/icon.svg" alt="Arvgrid" style={{ width: 64, height: 64, marginBottom: 12, opacity: 0.8 }} />
            <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 400 }}>Arvgrid</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: '4px 0 12px' }}>
              {lang === 'zh' ? '免费开源的 MIDI 编辑器' : 'Free & Open Source MIDI Editor'}
            </p>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              <div>Version 1.0.0</div>
              <div style={{ marginTop: 8 }}>
                {lang === 'zh' ? '基于 Web Audio API 构建' : 'Built with Web Audio API'}
              </div>
              <div>React + Vite</div>
              <div style={{ marginTop: 8, fontSize: '0.65rem' }}>
                {lang === 'zh' ? '支持 MIDI 导入/导出，SF2 音色库' : 'Supports MIDI import/export, SF2 soundfonts'}
              </div>
              <div style={{ marginTop: 12 }}>
                <a href="https://github.com" target="_blank" rel="noopener" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.7rem' }}>
                  GitHub
                </a>
              </div>
            </div>
            <button onClick={() => setAboutOpen(false)} className="primary" style={{ marginTop: 16 }}>{lang === 'zh' ? '关闭' : 'Close'}</button>
          </div>
        </div>
      )}
    </div>
  );
});

export default Editor;