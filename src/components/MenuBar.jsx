import React, { useState } from 'react';

export default function MenuBar({ 
  onNewProject, onImportMidi, onExportMidi, onSaveProject, onLoadProject,
  onUndo, onRedo, onQuantize, onClearTrack,
  onOpenSettings, onToggleMode, onFullscreen, mode 
}) {
  const [activeMenu, setActiveMenu] = useState(null);
  const closeMenu = () => setActiveMenu(null);

  const menuItems = [
    { key: 'file', label: 'File', items: [
      { label: 'New Project', action: onNewProject },
      { label: 'Import MIDI', action: onImportMidi },
      { label: 'Export MIDI', action: onExportMidi },
      { label: 'Save Project (JSON)', action: onSaveProject },
      { label: 'Load Project (JSON)', action: onLoadProject },
    ] },
    { key: 'edit', label: 'Edit', items: [
      { label: 'Undo', action: onUndo },
      { label: 'Redo', action: onRedo },
      { label: 'Quantize Track (1/16)', action: onQuantize },
      { label: 'Clear Current Track', action: onClearTrack },
    ] },
    { key: 'settings', label: 'Settings', items: [
      { label: 'Open Settings', action: onOpenSettings },
      { label: `Switch to ${mode === 'desktop' ? 'Touch' : 'Desktop'} Mode`, action: onToggleMode },
      { label: 'Fullscreen', action: onFullscreen },
    ] },
  ];

  return (
    <div style={{ background: '#2a2a3a', borderBottom: '1px solid #3a3a4e', display: 'flex', padding: '0 8px', gap: 16, position: 'relative', zIndex: 100 }}>
      {menuItems.map(menu => (
        <div
          key={menu.key}
          style={{ position: 'relative', cursor: 'pointer', padding: '8px 12px' }}
          onMouseEnter={() => setActiveMenu(menu.key)}
          onMouseLeave={closeMenu}
        >
          {menu.label}
          {activeMenu === menu.key && (
            <div style={{ position: 'absolute', top: '36px', left: 0, background: '#2a2a3a', border: '1px solid #3a3a4e', borderRadius: 8, minWidth: 180, zIndex: 200 }}>
              {menu.items.map(item => (
                <div
                  key={item.label}
                  style={{ padding: '6px 12px', cursor: 'pointer', fontSize: '0.75rem' }}
                  onClick={() => { item.action(); closeMenu(); }}
                  onMouseEnter={e => e.currentTarget.style.background = '#5a6eff'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  {item.label}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
      <div style={{ flex: 1 }} />
      <div style={{ padding: '8px 12px', fontSize: '0.7rem', background: '#5a6eff', borderRadius: 20, margin: '4px 0' }}>
        {mode === 'desktop' ? 'Desktop' : 'Touch'}
      </div>
    </div>
  );
}
