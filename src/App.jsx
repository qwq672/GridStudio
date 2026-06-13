import React, { useState, useEffect, useRef, useCallback } from 'react';
import { parseMidiFile, generateMidiFile } from './lib/midi';
import { useProject } from './hooks/useProject';
import { useAudioEngine } from './hooks/useAudioEngine';
import MenuBar from './components/MenuBar';
import TrackPanel from './components/TrackPanel';
import PianoRoll from './components/PianoRoll';
import Transport from './components/Transport';
import SettingsModal from './components/SettingsModal';

export default function App() {
  const {
    tracks, currentTrackId, bpm, meta,
    setBpm, setMeta,
    addTrack, deleteTrack, updateTrack,
    addNote, deleteNote, updateNote,
    quantizeTrack, clearTrack,
    importMidiData, exportProject, importProject,
    undo, redo,
    setCurrentTrackId,
  } = useProject();

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [mode, setMode] = useState('desktop');

  const audioEngine = useAudioEngine();
  const { playNote, setSoundSource, soundSource, loadInstrument } = audioEngine;

  const playIntervalRef = useRef(null);
  const startTimeRef = useRef(0);
  const scheduledEventsRef = useRef([]);

  // 停止播放
  const stopPlayback = useCallback(() => {
    if (playIntervalRef.current) clearInterval(playIntervalRef.current);
    setIsPlaying(false);
    setCurrentTime(0);
    // 停止所有正在发声的音符（简单粗暴地关闭 AudioContext 中的所有节点，但为了安全，重新初始化）
    if (audioEngine.audioCtxRef.current) {
      // 不直接 close，只是暂停
    }
  }, [audioEngine]);

  // 开始播放
  const startPlayback = useCallback(async () => {
    if (isPlaying) stopPlayback();
    await audioEngine.initAudio();
    const ctx = audioEngine.audioCtxRef.current;
    if (ctx.state === 'suspended') await ctx.resume();

    // 收集所有音符事件
    let events = [];
    tracks.forEach(track => {
      if (track.mute) return;
      track.notes.forEach(note => {
        events.push({
          time: note.startSec,
          duration: note.durationSec,
          pitch: note.pitch,
          velocity: note.velocity,
          program: track.program,
        });
      });
    });
    events.sort((a, b) => a.time - b.time);
    const total = events.length ? Math.max(...events.map(e => e.time + e.duration)) : 0;
    setTotalDuration(total);
    if (total === 0) return;

    const startTime = ctx.currentTime;
    startTimeRef.current = startTime;
    setIsPlaying(true);

    // 调度音符
    for (const ev of events) {
      const timeoutId = setTimeout(() => {
        if (isPlaying) {
          // 使用 soundfont-player 播放，如果不可用则回退到振荡器
          audioEngine.playNote(ev.pitch, ev.duration, ev.velocity, ev.program);
        }
      }, (ev.time) * 1000);
      scheduledEventsRef.current.push(timeoutId);
    }

    // 进度更新
    playIntervalRef.current = setInterval(() => {
      if (!isPlaying) return;
      const elapsed = ctx.currentTime - startTime;
      setCurrentTime(Math.min(elapsed, total));
      if (elapsed >= total) {
        stopPlayback();
      }
    }, 50);
  }, [tracks, isPlaying, audioEngine, stopPlayback]);

  // 清理定时器
  useEffect(() => {
    return () => {
      if (playIntervalRef.current) clearInterval(playIntervalRef.current);
      scheduledEventsRef.current.forEach(tid => clearTimeout(tid));
    };
  }, []);

  // 处理 MIDI 导入
  const handleImportMidi = async (file) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const midiData = await parseMidiFile(arrayBuffer);
      importMidiData(midiData);
    } catch (err) {
      alert("导入 MIDI 失败: " + err.message);
    }
  };

  // 导出 MIDI
  const handleExportMidi = () => {
    const fileData = generateMidiFile(tracks, bpm, meta);
    const blob = new Blob([fileData], { type: 'audio/midi' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'export.mid';
    a.click();
    URL.revokeObjectURL(url);
  };

  // 新建工程
  const handleNewProject = () => {
    if (confirm("新建工程将丢失当前进度，是否继续？")) {
      // 重置所有状态
      importMidiData({ bpm: 120, tracks: [{ name: "Piano", program: 0, notes: [] }], title: "", copyright: "" });
    }
  };

  // 全屏
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen();
    else document.exitFullscreen();
  };

  // 当前轨道对象
  const currentTrack = tracks.find(t => t.id === currentTrackId);

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <MenuBar
        onNewProject={handleNewProject}
        onImportMidi={() => {
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = '.mid,.midi';
          input.onchange = (e) => {
            if (e.target.files[0]) handleImportMidi(e.target.files[0]);
          };
          input.click();
        }}
        onExportMidi={handleExportMidi}
        onSaveProject={exportProject}
        onLoadProject={() => {
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = '.json';
          input.onchange = (e) => {
            if (e.target.files[0]) {
              const reader = new FileReader();
              reader.onload = (ev) => importProject(ev.target.result);
              reader.readAsText(e.target.files[0]);
            }
          };
          input.click();
        }}
        onOpenSettings={() => setSettingsOpen(true)}
        onToggleMode={() => setMode(mode === 'desktop' ? 'touch' : 'desktop')}
        onFullscreen={toggleFullscreen}
        mode={mode}
        onUndo={undo}
        onRedo={redo}
        onQuantize={() => quantizeTrack(currentTrackId)}
        onClearTrack={() => clearTrack(currentTrackId)}
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
            isPlaying={isPlaying}
            currentTime={currentTime}
          />
        )}
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
          // 跳转播放暂不实现复杂逻辑，简单停止并重置时间
          stopPlayback();
          setCurrentTime(time);
        }}
        reverbSend={audioEngine.reverbSend}
        onReverbSendChange={(val) => audioEngine.setReverbSend(val)}
        delaySend={audioEngine.delaySend}
        onDelaySendChange={(val) => audioEngine.setDelaySend(val)}
      />
      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        uiScale={100}
        onUiScaleChange={() => {}}
        soundSource={soundSource}
        onSoundSourceChange={setSoundSource}
        meta={meta}
        onMetaChange={setMeta}
      />
    </div>
  );
}
