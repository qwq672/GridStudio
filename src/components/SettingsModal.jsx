import React, { useState, useEffect } from 'react';

export default function SettingsModal({ open, onClose, onUiScaleChange, uiScale, onMetaChange, meta, soundSource, onSoundSourceChange, onLoadSF2 }) {
  const [localMeta, setLocalMeta] = useState(meta);
  useEffect(() => { setLocalMeta(meta); }, [meta]);
  if (!open) return null;
  return (
    <div className="modal active" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h3>Settings</h3>
        <div className="settings-row">
          <span>UI Scale</span>
          <input type="range" min="70" max="150" step="5" value={uiScale} onChange={e => onUiScaleChange(parseInt(e.target.value))} />
          <span>{uiScale}%</span>
        </div>
        <div className="settings-group">
          <div>MIDI Metadata</div>
          <div className="settings-row"><span>Title</span><input type="text" value={localMeta.title} onChange={e => setLocalMeta({...localMeta, title: e.target.value})} /></div>
          <div className="settings-row"><span>Artist</span><input type="text" value={localMeta.artist} onChange={e => setLocalMeta({...localMeta, artist: e.target.value})} /></div>
          <div className="settings-row"><span>Singer</span><input type="text" value={localMeta.singer} onChange={e => setLocalMeta({...localMeta, singer: e.target.value})} /></div>
          <div className="settings-row"><span>Copyright</span><input type="text" value={localMeta.copyright} onChange={e => setLocalMeta({...localMeta, copyright: e.target.value})} /></div>
          <button onClick={() => onMetaChange(localMeta)}>Apply</button>
        </div>
        <div className="settings-group">
          <div>Sound Source</div>
          <div className="settings-row">
            <select value={soundSource} onChange={e => onSoundSourceChange(e.target.value)}>
              <option value="default">Default Oscillator</option>
              <option value="network">Network SoundFont</option>
              <option value="sf2">SF2 File (Load)</option>
            </select>
          </div>
          {soundSource === 'sf2' && <button onClick={onLoadSF2}>Load SF2</button>}
        </div>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
