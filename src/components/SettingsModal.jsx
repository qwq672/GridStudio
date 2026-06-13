// src/components/SettingsModal.jsx
import React from 'react';
import { Icons } from './Icons';

export default function SettingsModal({ open, onClose, uiScale, onUiScaleChange }) {
  if (!open) return null;

  return (
    <div className="modal active" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3>设置</h3>
          <button onClick={onClose}><Icons.Close /></button>
        </div>
        <div className="settings-row">
          <span>界面缩放</span>
          <input
            type="range"
            min="70"
            max="150"
            step="5"
            value={uiScale}
            onChange={e => onUiScaleChange(parseInt(e.target.value))}
            style={{ flex: 1 }}
          />
          <span>{uiScale}%</span>
        </div>
        <div className="settings-row">
          <span>语言</span>
          <select defaultValue="zh">
            <option value="zh">中文</option>
            <option value="en">English</option>
          </select>
        </div>
        {/* 其他设置项可继续添加 */}
      </div>
    </div>
  );
}
