import React, { useState } from 'react';
import { Icons } from './Icons';
import { useTranslation } from '../lib/i18n';
import MenuBar from './MenuBar';
import SettingsModal from './SettingsModal';

export default function HomePage({ 
  onNewProject, onImportMidi, onImportProject, onLoadRecent, recentProjects, onClearRecent, 
  lang = 'zh', onLangChange, onLoadSF2, sf2Loaded, sf2Name,
  uiScale, onUiScaleChange, onClearCache, onResetSettings,
  pendingAutosave, onRecoverAutosave, onDiscardAutosave
}) {
  const t = useTranslation(lang);
  const [settingsOpen, setSettingsOpen] = useState(false);
  
  return (
    <div style={{
      height: '100vh',
      background: 'linear-gradient(135deg, #1a1a2a 0%, #2a2a3a 100%)',
      display: 'flex',
      flexDirection: 'column',
      padding: '0',
      position: 'relative',
      overflow: 'auto'
    }}>
      <MenuBar
        homeMode={true}
        onNewProject={onNewProject}
        onImportMidi={onImportMidi}
        onLoadProject={onImportProject}
        onOpenSettings={() => setSettingsOpen(true)}
        lang={lang}
      />
      
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '20px',
        overflow: 'auto'
      }}>
        <div style={{
          maxWidth: '800px',
          width: '100%',
          background: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(10px)',
          borderRadius: '24px',
          padding: '32px',
          textAlign: 'center'
        }}>
          <img 
            src="/icon.svg" 
            alt="Arvgrid Logo" 
            style={{ 
              width: '120px', 
              height: 'auto', 
              marginBottom: '16px',
              filter: 'drop-shadow(0 4px 8px rgba(90, 110, 255, 0.3))'
            }} 
          />
          <h1 style={{ fontSize: '3rem', marginBottom: '8px', color: '#5a6eff' }}>Arvgrid</h1>
          <p style={{ marginBottom: '32px', color: '#aaa' }}>{t.tagline}</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
            <button onClick={onNewProject} style={{ padding: '16px', fontSize: '1rem', background: '#5a6eff' }}>
              <Icons.Play /> {t.newProject}
            </button>
            <button onClick={onImportMidi} style={{ padding: '16px', fontSize: '1rem' }}>
              <Icons.Settings /> {t.importMidi}
            </button>
            <button onClick={onImportProject} style={{ padding: '16px', fontSize: '1rem' }}>
              <Icons.Fullscreen /> {t.importProject}
            </button>
          </div>

          {recentProjects.length > 0 && (
            <div>
              <h3 style={{ textAlign: 'left', marginBottom: '12px' }}>{t.recentProjects}</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {recentProjects.map(proj => (
                  <div key={proj.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#2a2a3a', padding: '12px', borderRadius: '8px' }}>
                    <div>
                      <div style={{ fontWeight: 'bold' }}>{proj.title}</div>
                      <div style={{ fontSize: '0.7rem', color: '#aaa' }}>{new Date(proj.timestamp).toLocaleString()}</div>
                    </div>
                    <button onClick={() => onLoadRecent(proj)} style={{ padding: '4px 12px' }}>{t.load}</button>
                  </div>
                ))}
              </div>
              <button onClick={onClearRecent} style={{ marginTop: '12px', background: '#aa4455' }}>{t.clearRecent}</button>
            </div>
          )}
        </div>

        {pendingAutosave && (
          <div style={{
            maxWidth: '800px',
            width: '100%',
            background: 'rgba(90, 110, 255, 0.1)',
            border: '1px solid #5a6eff',
            borderRadius: '16px',
            padding: '24px',
            marginTop: '20px',
            textAlign: 'left'
          }}>
            <h3 style={{ color: '#5a6eff', marginBottom: '8px' }}>{t.recoverTitle}</h3>
            <p style={{ color: '#aaa', marginBottom: '16px' }}>{t.recoverDesc}</p>
            <div style={{ display: 'flex', gap: '16px' }}>
              <button onClick={onRecoverAutosave} style={{ background: '#5a6eff' }}>{t.recover}</button>
              <button onClick={onDiscardAutosave} style={{ background: '#aa4455' }}>{t.discard}</button>
            </div>
          </div>
        )}
      </div>

      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        uiScale={uiScale}
        onUiScaleChange={onUiScaleChange}
        soundSource="default"
        onSoundSourceChange={() => {}}
        autoSaveMode={{ type: 'onChange', interval: 0 }}
        onAutoSaveModeChange={() => {}}
        onClearCache={onClearCache}
        onResetSettings={onResetSettings}
        lang={lang}
        onLangChange={onLangChange}
        onLoadSF2={onLoadSF2}
        sf2Loaded={sf2Loaded}
        sf2Name={sf2Name}
      />
    </div>
  );
}
