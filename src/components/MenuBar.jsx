// src/components/MenuBar.jsx
import React, { useState } from 'react';
import { Icons } from './Icons';

export default function MenuBar({
  onNewProject,
  onImportMidi,
  onExportMidi,
  onSaveProject,
  onLoadProject,
  onOpenSettings,
  onOpenMidiInfo,
  onToggleMode,
  onFullscreen,
  mode,
}) {
  const [activeMenu, setActiveMenu] = useState(null);

  const menuItems = [
    {
      label: '文件',
      key: 'file',
      items: [
        { label: '新建工程', onClick: onNewProject },
        { label: '导入 MIDI', onClick: onImportMidi },
        { label: '导出 MIDI', onClick: onExportMidi },
        { label: '保存工程', onClick: onSaveProject },
        { label: '加载工程', onClick: onLoadProject },
        { label: 'MIDI 信息', onClick: onOpenMidiInfo },
      ],
    },
    {
      label: '编辑',
      key: 'edit',
      items: [
        { label: '撤销', onClick: () => window.dispatchEvent(new CustomEvent('undo')) },
        { label: '重做', onClick: () => window.dispatchEvent(new CustomEvent('redo')) },
        { label: '量化当前轨道', onClick: () => window.dispatchEvent(new CustomEvent('quantize')) },
        { label: '清空当前轨道', onClick: () => window.dispatchEvent(new CustomEvent('clearTrack')) },
      ],
    },
    {
      label: '设置',
      key: 'settings',
      items: [
        { label: '选项面板', onClick: onOpenSettings },
        { label: `${mode === 'desktop' ? '触屏模式' : '桌面模式'}`, onClick: onToggleMode },
        { label: '全屏', onClick: onFullscreen },
      ],
    },
    {
      label: '帮助',
      key: 'help',
      items: [
        { label: '关于', onClick: () => alert('GridStudio v1.0\nMIDI 编辑器') },
        { label: '快捷键', onClick: () => alert('暂未实现') },
      ],
    },
  ];

  return (
    <div className="menu-bar">
      {menuItems.map(menu => (
        <div
          key={menu.key}
          className={`menu-item ${activeMenu === menu.key ? 'active' : ''}`}
          onClick={() => setActiveMenu(activeMenu === menu.key ? null : menu.key)}
          onMouseEnter={() => setActiveMenu(menu.key)}
          onMouseLeave={() => setActiveMenu(null)}
        >
          {menu.label}
          <div className="menu-dropdown">
            {menu.items.map((item, idx) => (
              <a key={idx} onClick={item.onClick}>{item.label}</a>
            ))}
          </div>
        </div>
      ))}
      <div className="mode-badge">{mode === 'desktop' ? '桌面模式' : '触屏模式'}</div>
      <div style={{ flex: 1 }} />
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '0 8px' }}>
        <button onClick={onToggleMode}><Icons.Fullscreen /> 模式</button>
      </div>
    </div>
  );
}
