import React from 'react';

export default function SettingsModal({
  open,
  onClose,
  uiScale,
  onUiScaleChange,
  soundSource,
  onSoundSourceChange,
  meta,
  onMetaChange,
  autoSaveMode,
  onAutoSaveModeChange,
  onClearCache,
  onResetSettings,
}) {
  if (!open) return null;

  const handleAutoSaveTypeChange = (type) => {
    let interval = 0;
    if (type === 'interval') {
      interval = 60; // 默认60秒
    }
    onAutoSaveModeChange({ type, interval });
  };

  const handleIntervalChange = (e) => {
    const val = parseInt(e.target.value);
    if (!isNaN(val) && val > 0) {
      onAutoSaveModeChange({ ...autoSaveMode, interval: val });
    }
  };

  return (
    <div className="modal active" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3>设置</h3>

        <div className="settings-row">
          <span>界面缩放</span>
          <input type="range" min="70" max="150" step="5" value={uiScale} onChange={(e) => onUiScaleChange(parseInt(e.target.value))} />
          <span>{uiScale}%</span>
        </div>

        <div className="settings-row">
          <span>音色库</span>
          <select value={soundSource} onChange={(e) => onSoundSourceChange(e.target.value)}>
            <option value="default">默认振荡器（离线预设）</option>
            <option value="network">网络音色库（MusyngKite）</option>
          </select>
        </div>

        <div className="settings-group">
          <div>自动保存</div>
          <div className="settings-row">
            <label>
              <input
                type="radio"
                name="autosave"
                checked={autoSaveMode.type === 'onChange'}
                onChange={() => handleAutoSaveTypeChange('onChange')}
              /> 随改动自动保存
            </label>
            <label>
              <input
                type="radio"
                name="autosave"
                checked={autoSaveMode.type === 'interval'}
                onChange={() => handleAutoSaveTypeChange('interval')}
              /> 定时自动保存
            </label>
          </div>
          {autoSaveMode.type === 'interval' && (
            <div className="settings-row">
              <span>间隔（秒）</span>
              <input
                type="number"
                min="1"
                max="86400"
                value={autoSaveMode.interval}
                onChange={handleIntervalChange}
                style={{ width: '100px' }}
              />
              <span>秒（最大24小时）</span>
            </div>
          )}
        </div>

        <div className="settings-group">
          <div>MIDI 元数据</div>
          <div className="settings-row"><span>标题</span><input type="text" value={meta.title} onChange={(e) => onMetaChange({ ...meta, title: e.target.value })} /></div>
          <div className="settings-row"><span>作者</span><input type="text" value={meta.artist} onChange={(e) => onMetaChange({ ...meta, artist: e.target.value })} /></div>
          <div className="settings-row"><span>歌手</span><input type="text" value={meta.singer} onChange={(e) => onMetaChange({ ...meta, singer: e.target.value })} /></div>
          <div className="settings-row"><span>版权</span><input type="text" value={meta.copyright} onChange={(e) => onMetaChange({ ...meta, copyright: e.target.value })} /></div>
        </div>

        <div className="settings-row" style={{ justifyContent: 'space-between' }}>
          <button onClick={onClearCache}>清空所有本地缓存工程</button>
          <button onClick={onResetSettings}>重置所有设置</button>
        </div>

        <button onClick={onClose} style={{ marginTop: 16 }}>关闭</button>
      </div>
    </div>
  );
}