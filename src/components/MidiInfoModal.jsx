import React from 'react';
import { useTranslation } from '../lib/i18n';

export default function MidiInfoModal({ open, onClose, meta, onMetaChange, lang = 'zh' }) {
  const t = useTranslation(lang);
  
  if (!open) return null;
  return (
    <div className="modal active" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
        <h3>{t.midiInfo}</h3>
        <div className="settings-row"><span>{t.title}</span><input type="text" value={meta.title} onChange={(e) => onMetaChange({ ...meta, title: e.target.value })} /></div>
        <div className="settings-row"><span>{t.artist}</span><input type="text" value={meta.artist} onChange={(e) => onMetaChange({ ...meta, artist: e.target.value })} /></div>
        <div className="settings-row"><span>{t.singer}</span><input type="text" value={meta.singer} onChange={(e) => onMetaChange({ ...meta, singer: e.target.value })} /></div>
        <div className="settings-row"><span>{t.copyright}</span><input type="text" value={meta.copyright} onChange={(e) => onMetaChange({ ...meta, copyright: e.target.value })} /></div>
        <button onClick={onClose} style={{ marginTop: 16 }}>{t.close}</button>
      </div>
    </div>
  );
}
