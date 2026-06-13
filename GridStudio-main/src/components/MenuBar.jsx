import React from 'react';

export default function MenuBar({
  onNewProject, onImportMidi, onExportMidi, onSaveProject, onLoadProject,
  onOpenMidiInfo, onUndo, onRedo, onQuantize, onClearTrack,
  onOpenSettings, onToggleMode, onFullscreen, mode
}) {
  return (
    <div className="menu-bar">
      <div className="menu-item">文件
        <div className="menu-dropdown">
          <a onClick={onNewProject}>新建工程</a>
          <a onClick={onImportMidi}>导入 MIDI</a>
          <a onClick={onExportMidi}>导出 MIDI</a>
          <a onClick={onSaveProject}>保存工程</a>
          <a onClick={onLoadProject}>加载工程</a>
        </div>
      </div>
      <div className="menu-item">编辑
        <div className="menu-dropdown">
          <a onClick={onUndo}>撤销</a>
          <a onClick={onRedo}>重做</a>
          <a onClick={onQuantize}>量化当前轨道</a>
          <a onClick={onClearTrack}>清空当前轨道</a>
          <a onClick={onOpenMidiInfo}>MIDI 信息</a>
        </div>
      </div>
      <div className="menu-item">设置
        <div className="menu-dropdown">
          <a onClick={onOpenSettings}>选项面板</a>
          <a onClick={onToggleMode}>{mode === 'desktop' ? '触屏模式' : '桌面模式'}</a>
          <a onClick={onFullscreen}>全屏</a>
        </div>
      </div>
    </div>
  );
}