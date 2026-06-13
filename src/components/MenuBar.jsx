import React, { useState } from 'react';
import { useTranslation } from '../lib/i18n';

export default function MenuBar({
  onNewProject, onImportMidi, onExportMidi, onSaveProject, onLoadProject,
  onOpenMidiInfo, onUndo, onRedo, onQuantize, onClearTrack,
  onOpenSettings, onToggleMode, onFullscreen, mode, onExitToHome,
  lang = 'zh',
  homeMode = false,
}) {
  const [activeMenu, setActiveMenu] = useState(null);
  const t = useTranslation(lang);

  const handleMenuClick = (menuName) => {
    setActiveMenu(activeMenu === menuName ? null : menuName);
  };

  const handleMenuBlur = () => {
    setTimeout(() => setActiveMenu(null), 200);
  };

  const disabledStyle = { opacity: 0.4, pointerEvents: 'none' };

  const handleItemClick = (callback, disabled) => {
    if (disabled) return;
    callback();
    setActiveMenu(null);
  };

  return (
    <div className="menu-bar" onBlur={handleMenuBlur}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginRight: '12px' }}>
        <img src="/icon.svg" alt="Arvgrid" style={{ width: '20px', height: '20px' }} />
        <span style={{ fontWeight: 'bold', color: '#5a6eff' }}>Arvgrid</span>
      </div>
      <div className={`menu-item ${activeMenu === 'file' ? 'active' : ''}`} onClick={() => handleMenuClick('file')}>
        {t.file}
        <div className="menu-dropdown">
          <a onClick={() => handleItemClick(onNewProject)}>{t.newProject}</a>
          <a onClick={() => handleItemClick(onImportMidi)}>{t.importMidi}</a>
          <a style={homeMode ? disabledStyle : {}} onClick={() => handleItemClick(onExportMidi, homeMode)}>{t.exportMidi}</a>
          <a style={homeMode ? disabledStyle : {}} onClick={() => handleItemClick(onSaveProject, homeMode)}>{t.saveProject}</a>
          <a onClick={() => handleItemClick(onLoadProject)}>{t.loadProject}</a>
          <a style={homeMode ? disabledStyle : {}} onClick={() => handleItemClick(onExitToHome, homeMode)}>{t.backToHome}</a>
        </div>
      </div>
      <div className={`menu-item ${activeMenu === 'edit' ? 'active' : ''}`} onClick={() => !homeMode && handleMenuClick('edit')} style={homeMode ? { opacity: 0.4, pointerEvents: 'none' } : {}}>
        {t.edit}
        <div className="menu-dropdown">
          <a onClick={() => handleItemClick(onUndo)}>{t.undo}</a>
          <a onClick={() => handleItemClick(onRedo)}>{t.redo}</a>
          <a onClick={() => handleItemClick(onQuantize)}>{t.quantizeTrack}</a>
          <a onClick={() => handleItemClick(onClearTrack)}>{t.clearTrack}</a>
          <a onClick={() => handleItemClick(onOpenMidiInfo)}>{t.midiInfo}</a>
        </div>
      </div>
      <div className={`menu-item ${activeMenu === 'settings' ? 'active' : ''}`} onClick={() => handleMenuClick('settings')}>
        {t.settings}
        <div className="menu-dropdown">
          <a onClick={() => handleItemClick(onOpenSettings)}>{t.optionsPanel}</a>
          <a style={homeMode ? disabledStyle : {}} onClick={() => handleItemClick(onToggleMode, homeMode)}>{mode === 'desktop' ? t.touchMode : t.desktopMode}</a>
          <a style={homeMode ? disabledStyle : {}} onClick={() => handleItemClick(onFullscreen, homeMode)}>{t.fullscreen}</a>
        </div>
      </div>
    </div>
  );
}
