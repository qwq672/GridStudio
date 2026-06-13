import React, { useState, useEffect, useCallback } from 'react';
import { useProject, loadAutosave, clearAutosave, getRecentProjects } from './hooks/useProject';
import { useAudioEngine } from './hooks/useAudioEngine';
import { useAutoSave } from './hooks/useAutoSave';
import HomePage from './components/HomePage';
import Editor from './components/Editor';
import { parseMidiFile, generateMidiFile } from './lib/midi';

export default function App() {
  const [showHome, setShowHome] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [pendingAutosave, setPendingAutosave] = useState(null);
  const [recentProjects, setRecentProjects] = useState([]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [midiInfoOpen, setMidiInfoOpen] = useState(false);
  const [mode, setMode] = useState('desktop');

  const project = useProject();
  const audioEngine = useAudioEngine();

  // 自动保存设置
  const [autoSaveMode, setAutoSaveMode] = useState(() => {
    const saved = localStorage.getItem('gridstudio_autosave_mode');
    return saved ? JSON.parse(saved) : { type: 'onChange', interval: 0 };
  });

  const { triggerAutoSave } = useAutoSave(project.getCurrentProjectData, autoSaveMode);

  useEffect(() => {
    setHasUnsavedChanges(true);
    triggerAutoSave();
  }, [project.tracks, project.bpm, project.meta, project.currentTrackId]);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '你有未保存的工程，确定要离开吗？更改将丢失。';
        return e.returnValue;
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  useEffect(() => {
    const autosaveData = loadAutosave();
    if (autosaveData && autosaveData.tracks?.length) {
      setPendingAutosave(autosaveData);
    }
    setRecentProjects(getRecentProjects());
  }, []);

  const handleRecoverAutosave = () => {
    if (pendingAutosave) {
      project.importMidiData(pendingAutosave);
      setHasUnsavedChanges(false);
      clearAutosave();
      setPendingAutosave(null);
      setShowHome(false);
    }
  };

  const handleDiscardAutosave = () => {
    clearAutosave();
    setPendingAutosave(null);
    setShowHome(false);
    project.newProject();
  };

  const handleNewProject = () => {
    if (hasUnsavedChanges && !confirm('新建工程将丢失未保存的更改，确定吗？')) return;
    setHasUnsavedChanges(false);
    setShowHome(false);
    project.newProject();
  };

  const handleImportMidi = async (file) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const midiData = await parseMidiFile(arrayBuffer);
      project.importMidiData(midiData);
      setHasUnsavedChanges(false);
      setShowHome(false);
    } catch (err) {
      alert('导入 MIDI 失败: ' + err.message);
    }
  };

  const handleImportProject = (jsonData) => {
    project.importProject(jsonData);
    setHasUnsavedChanges(false);
    setShowHome(false);
  };

  const handleLoadRecent = (projectData) => {
    project.importMidiData(projectData);
    setHasUnsavedChanges(false);
    setShowHome(false);
  };

  const handleExportMidi = () => {
    const fileData = generateMidiFile(project.tracks, project.bpm, project.meta);
    const blob = new Blob([fileData], { type: 'audio/midi' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'export.mid';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSaveProject = () => {
    project.exportProject();
    setHasUnsavedChanges(false);
  };

  const handleLoadProjectFile = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      if (e.target.files[0]) {
        const reader = new FileReader();
        reader.onload = (ev) => handleImportProject(ev.target.result);
        reader.readAsText(e.target.files[0]);
      }
    };
    input.click();
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen();
    else document.exitFullscreen();
  };

  const handleClearCache = () => {
    if (confirm('清空所有本地缓存工程将无法恢复，确定吗？')) {
      localStorage.removeItem('gridstudio_autosave');
      localStorage.removeItem('gridstudio_recent_projects');
      setRecentProjects([]);
      alert('缓存已清空');
    }
  };

  const handleResetSettings = () => {
    localStorage.removeItem('gridstudio_ui_scale');
    localStorage.removeItem('gridstudio_sound_source');
    localStorage.removeItem('gridstudio_autosave_mode');
    setAutoSaveMode({ type: 'onChange', interval: 0 });
    if (typeof onUiScaleChange === 'function') onUiScaleChange(100);
    if (typeof onSoundSourceChange === 'function') onSoundSourceChange('default');
    alert('设置已重置');
  };

  if (pendingAutosave) {
    return (
      <div style={{
        position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
        background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000
      }}>
        <div style={{ background: '#2a2a3a', padding: '24px', borderRadius: '16px', maxWidth: '400px', textAlign: 'center' }}>
          <h3>你有旧工程尚未保存</h3>
          <p>是否要恢复工程以保存或继续修改？</p>
          <div style={{ display: 'flex', gap: '16px', marginTop: '20px', justifyContent: 'center' }}>
            <button onClick={handleRecoverAutosave}>恢复工程</button>
            <button onClick={handleDiscardAutosave}>放弃</button>
          </div>
        </div>
      </div>
    );
  }

  if (showHome) {
    return (
      <HomePage
        onNewProject={handleNewProject}
        onImportMidi={() => {
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = '.mid,.midi';
          input.onchange = (e) => e.target.files[0] && handleImportMidi(e.target.files[0]);
          input.click();
        }}
        onImportProject={handleLoadProjectFile}
        recentProjects={recentProjects}
        onLoadRecent={handleLoadRecent}
      />
    );
  }

  return (
    <Editor
      project={project}
      audioEngine={audioEngine}
      autoSaveMode={autoSaveMode}
      setAutoSaveMode={setAutoSaveMode}
      onExitToHome={() => {
        if (hasUnsavedChanges && !confirm('返回主页将丢失未保存的更改，确定吗？')) return;
        setShowHome(true);
      }}
      onOpenSettings={() => setSettingsOpen(true)}
      onOpenMidiInfo={() => setMidiInfoOpen(true)}
      onExportMidi={handleExportMidi}
      onSaveProject={handleSaveProject}
      onLoadProject={handleLoadProjectFile}
      onNewProject={handleNewProject}
      onToggleMode={() => setMode(mode === 'desktop' ? 'touch' : 'desktop')}
      onFullscreen={toggleFullscreen}
      mode={mode}
      settingsOpen={settingsOpen}
      setSettingsOpen={setSettingsOpen}
      midiInfoOpen={midiInfoOpen}
      setMidiInfoOpen={setMidiInfoOpen}
      soundSource={audioEngine.soundSource}
      setSoundSource={audioEngine.setSoundSource}
      meta={project.meta}
      setMeta={project.setMeta}
      uiScale={100}  // 从 localStorage 读取，此处简化
      onUiScaleChange={(val) => localStorage.setItem('gridstudio_ui_scale', val)}
      onClearCache={handleClearCache}
      onResetSettings={handleResetSettings}
    />
  );
}