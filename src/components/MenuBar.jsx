import React, { useState } from 'react';
import { useTranslation } from '../lib/i18n';

export default function MenuBar({
  onNewProject, onImportMidi, onExportMidi, onSaveProject, onLoadProject,
  onOpenMidiInfo, onUndo, onRedo, onQuantize, onClearTrack,
  onOpenSettings, onToggleMode, onFullscreen, mode, onExitToHome,
  lang = 'zh',
}) {
  const [activeMenu, setActiveMenu] = useState(null);
  const t = useTranslation(lang);

  const handleMenuClick = (menuName) => {
    setActiveMenu(activeMenu === menuName ? null : menuName);
  };

  const handleMenuBlur = () => {
    setTimeout(() => setActiveMenu(null), 200);
  };

  const handleItemClick = (callback) => {
    callback();
    setActiveMenu(null);
  };

  return (
    <div className="menu-bar" onBlur={handleMenuBlur}>
      <div className={`menu-item ${activeMenu === 'file' ? 'active' : ''}`} onClick={() => handleMenuClick('file')}>
        {t.file}
        <div className="menu-dropdown">
          <a onClick={() => handleItemClick(onNewProject)}>{t.newProject}</a>
          <a onClick={() => handleItemClick(onImportMidi)}>{t.importMidi}</a>
          <a onClick={() => handleItemClick(onExportMidi)}>{t.exportMidi}</a>
          <a onClick={() => handleItemClick(onSaveProject)}>{t.saveProject}</a>
          <a onClick={() => handleItemClick(onLoadProject)}>{t.loadProject}</a>
          <a onClick={() => handleItemClick(onExitToHome)}>{t.backToHome}</a>
        </div>
      </div>
      <div className={`menu-item ${activeMenu === 'edit' ? 'active' : ''}`} onClick={() => handleMenuClick('edit')}>
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
          <a onClick={() => handleItemClick(onToggleMode)}>{mode === 'desktop' ? t.touchMode : t.desktopMode}</a>
          <a onClick={() => handleItemClick(onFullscreen)}>{t.fullscreen}</a>
        </div>
      </div>
    </div>
  );
}
