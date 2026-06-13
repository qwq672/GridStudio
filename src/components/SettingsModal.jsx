import React, { useRef } from 'react';
import { useTranslation } from '../lib/i18n';

export default function SettingsModal({
  open,
  onClose,
  uiScale,
  onUiScaleChange,
  soundSource,
  onSoundSourceChange,
  autoSaveMode,
  onAutoSaveModeChange,
  onClearCache,
  onResetSettings,
  lang,
  onLangChange,
  onLoadSF2,
  sf2Loaded,
  sf2Name,
}) {
  const fileInputRef = useRef(null);
  const t = useTranslation(lang);

  if (!open) return null;

  const handleAutoSaveTypeChange = (type) => {
    let interval = 0;
    if (type === 'interval') {
      interval = 60;
    }
    onAutoSaveModeChange({ type, interval });
  };

  const handleIntervalChange = (e) => {
    const val = parseInt(e.target.value);
    if (!isNaN(val) && val > 0) {
      onAutoSaveModeChange({ ...autoSaveMode, interval: val });
    }
  };

  const handleSF2Select = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      const arrayBuffer = await file.arrayBuffer();
      const success = await onLoadSF2(arrayBuffer);
      if (success) {
        alert(lang === 'zh' ? `已加载音色库: ${file.name}` : `Soundfont loaded: ${file.name}`);
      } else {
        alert(lang === 'zh' ? '加载音色库失败' : 'Failed to load soundfont');
      }
    } catch (err) {
      alert((lang === 'zh' ? '加载音色库失败: ' : 'Failed to load soundfont: ') + err.message);
    }
    
    // 清空input以便再次选择同一文件
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="modal active" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxHeight: '80vh', overflowY: 'auto' }}>
        <h3>{t.settings}</h3>

        {/* 语言设置 */}
        <div className="settings-row">
          <span>{t.language}</span>
          <select value={lang} onChange={(e) => onLangChange(e.target.value)}>
            <option value="zh">中文</option>
            <option value="en">English</option>
          </select>
        </div>

        {/* 界面缩放 */}
        <div className="settings-row">
          <span>{t.uiScale}</span>
          <input type="range" min="70" max="150" step="5" value={uiScale} onChange={(e) => onUiScaleChange(parseInt(e.target.value))} />
          <span>{uiScale}%</span>
        </div>

        {/* 音色库管理 */}
        <div className="settings-group">
          <div style={{ fontWeight: 'bold', marginBottom: 8 }}>{t.soundSource}</div>
          
          <div className="settings-row">
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <input
                type="radio"
                name="soundSource"
                value="default"
                checked={soundSource === 'default'}
                onChange={() => onSoundSourceChange('default')}
              />
              {t.defaultOscillator}
            </label>
          </div>
          
          <div className="settings-row">
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <input
                type="radio"
                name="soundSource"
                value="network"
                checked={soundSource === 'network'}
                onChange={() => onSoundSourceChange('network')}
              />
              {t.networkSoundfont}
            </label>
          </div>
          
          <div className="settings-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 8 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <input
                type="radio"
                name="soundSource"
                value="sf2"
                checked={soundSource === 'sf2'}
                onChange={() => {}}
                disabled={!sf2Loaded}
              />
              {t.sf2Soundfont} {sf2Loaded && sf2Name && `(${sf2Name})`}
            </label>
            <div style={{ display: 'flex', gap: 8, marginLeft: 24 }}>
              <button 
                onClick={() => fileInputRef.current?.click()}
                style={{ padding: '4px 12px', fontSize: '0.85rem' }}
              >
                {t.loadSF2}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".sf2"
                onChange={handleSF2Select}
                style={{ display: 'none' }}
              />
            </div>
          </div>
        </div>

        {/* 自动保存 */}
        <div className="settings-group">
          <div style={{ fontWeight: 'bold', marginBottom: 8 }}>{t.autoSave}</div>
          <div className="settings-row">
            <label>
              <input
                type="radio"
                name="autosave"
                checked={autoSaveMode.type === 'onChange'}
                onChange={() => handleAutoSaveTypeChange('onChange')}
              /> {t.autoSaveOnChange}
            </label>
            <label>
              <input
                type="radio"
                name="autosave"
                checked={autoSaveMode.type === 'interval'}
                onChange={() => handleAutoSaveTypeChange('interval')}
              /> {t.autoSaveInterval}
            </label>
          </div>
          {autoSaveMode.type === 'interval' && (
            <div className="settings-row">
              <span>{t.intervalSeconds}</span>
              <input
                type="number"
                min="1"
                max="86400"
                value={autoSaveMode.interval}
                onChange={handleIntervalChange}
                style={{ width: '100px' }}
              />
              <span>{t.max24h}</span>
            </div>
          )}
        </div>

        {/* 缓存和设置重置 */}
        <div className="settings-row" style={{ justifyContent: 'space-between' }}>
          <button onClick={onClearCache}>{t.clearCache}</button>
          <button onClick={onResetSettings}>{t.resetSettings}</button>
        </div>

        <button onClick={onClose} style={{ marginTop: 16 }}>{t.close}</button>
      </div>
    </div>
  );
}
