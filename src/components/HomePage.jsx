import React from 'react';
import { Icons } from './Icons';

export default function HomePage({ onNewProject, onImportMidi, onImportProject, onLoadRecent, recentProjects, onClearRecent }) {
  return (
    <div style={{
      height: '100vh',
      background: 'linear-gradient(135deg, #1a1a2a 0%, #2a2a3a 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      position: 'relative',
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
        <h1 style={{ fontSize: '3rem', marginBottom: '8px', color: '#5a6eff' }}>GridStudio</h1>
        <p style={{ marginBottom: '32px', color: '#aaa' }}>专业 MIDI 编辑器 · 自由创作</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
          <button onClick={onNewProject} style={{ padding: '16px', fontSize: '1rem', background: '#5a6eff' }}>
            <Icons.Play /> 新建工程
          </button>
          <button onClick={onImportMidi} style={{ padding: '16px', fontSize: '1rem' }}>
            <Icons.Settings /> 导入 MIDI
          </button>
          <button onClick={onImportProject} style={{ padding: '16px', fontSize: '1rem' }}>
            <Icons.Fullscreen /> 导入工程
          </button>
        </div>

        {recentProjects.length > 0 && (
          <div>
            <h3 style={{ textAlign: 'left', marginBottom: '12px' }}>最近工程</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {recentProjects.map(proj => (
                <div key={proj.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#2a2a3a', padding: '12px', borderRadius: '8px' }}>
                  <div>
                    <div style={{ fontWeight: 'bold' }}>{proj.title}</div>
                    <div style={{ fontSize: '0.7rem', color: '#aaa' }}>{new Date(proj.timestamp).toLocaleString()}</div>
                  </div>
                  <button onClick={() => onLoadRecent(proj)} style={{ padding: '4px 12px' }}>加载</button>
                </div>
              ))}
            </div>
            <button onClick={onClearRecent} style={{ marginTop: '12px', background: '#aa4455' }}>清空最近工程</button>
          </div>
        )}
      </div>
    </div>
  );
}