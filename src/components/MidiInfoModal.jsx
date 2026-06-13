import React from 'react';

export default function MidiInfoModal({ open, onClose, meta, onMetaChange }) {
  if (!open) return null;
  return (
    <div className="modal active" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
        <h3>MIDI 信息</h3>
        <div className="settings-row"><span>标题</span><input type="text" value={meta.title} onChange={(e) => onMetaChange({ ...meta, title: e.target.value })} /></div>
        <div className="settings-row"><span>作者</span><input type="text" value={meta.artist} onChange={(e) => onMetaChange({ ...meta, artist: e.target.value })} /></div>
        <div className="settings-row"><span>歌手</span><input type="text" value={meta.singer} onChange={(e) => onMetaChange({ ...meta, singer: e.target.value })} /></div>
        <div className="settings-row"><span>版权</span><input type="text" value={meta.copyright} onChange={(e) => onMetaChange({ ...meta, copyright: e.target.value })} /></div>
        <button onClick={onClose} style={{ marginTop: 16 }}>关闭</button>
      </div>
    </div>
  );
}