// 多语言支持
export const translations = {
  zh: {
    // MenuBar
    file: '文件', newProject: '新建工程', importMidi: '导入 MIDI', exportMidi: '导出 MIDI',
    saveProject: '保存工程', loadProject: '加载工程', backToHome: '返回首页',
    edit: '编辑', undo: '撤销', redo: '重做', quantizeTrack: '量化当前轨道',
    clearTrack: '清空当前轨道', midiInfo: 'MIDI 信息',
    settings: '设置', optionsPanel: '选项面板', touchMode: '触屏模式', desktopMode: '桌面模式',
    fullscreen: '全屏',
    // TrackPanel
    tracks: '轨道', volume: '音量', pan: '声像', mute: '静音', unmute: '取消静音',
    instrument: '音色', searchInstrument: '搜索乐器号、中文名或英文名...',
    preview: '试听', clickToPreview: '点击试听', addTrack: '添加轨道',
    // PianoRoll
    zoomIn: '放大', zoomOut: '缩小', resetView: '重置视图',
    deleteNote: '删除音符', copyNotes: '复制', cutNotes: '裁切', pasteNotes: '粘贴',
    selectAll: '全选', deleteSelected: '删除选中',
    // Transport
    play: '播放', stop: '停止', pause: '暂停', metronome: '节拍器',
    reverb: '混响', delay: '延迟',
    delayTime: '延迟时间', delayFeedback: '反馈',
    // Settings
    uiScale: '界面缩放', soundSource: '音色库',
    defaultOscillator: '默认振荡器（离线预设）', networkSoundfont: '网络音色库（MusyngKite）',
    sf2Soundfont: 'SF2 音色库', loadSF2: '加载 SF2 文件',
    autoSave: '自动保存', autoSaveOnChange: '随改动自动保存', autoSaveInterval: '定时自动保存',
    intervalSeconds: '间隔（秒）', max24h: '秒（最大24小时）',
    clearCache: '清空所有本地缓存工程', resetSettings: '重置所有设置', close: '关闭',
    // MidiInfo
    title: '标题', artist: '作者', singer: '歌手', copyright: '版权',
    // HomePage
    importProject: '导入工程', recentProjects: '最近工程', load: '加载',
    clearRecent: '清空最近工程', tagline: '专业 MIDI 编辑器 · 自由创作',
    // Autosave dialog
    recoverTitle: '你有旧工程尚未保存', recoverDesc: '是否要恢复工程以保存或继续修改？',
    recover: '恢复工程', discard: '放弃',
    // Misc
    confirmNew: '新建工程将丢失未保存的更改，确定吗？',
    confirmBack: '返回主页将丢失未保存的更改，确定吗？',
    confirmClear: '清空所有本地缓存工程将无法恢复，确定吗？',
    cacheCleared: '缓存已清空', settingsReset: '设置已重置',
    importFailed: '导入 MIDI 失败: ', language: '语言',
  },
  en: {
    file: 'File', newProject: 'New Project', importMidi: 'Import MIDI', exportMidi: 'Export MIDI',
    saveProject: 'Save Project', loadProject: 'Load Project', backToHome: 'Back to Home',
    edit: 'Edit', undo: 'Undo', redo: 'Redo', quantizeTrack: 'Quantize Track',
    clearTrack: 'Clear Track', midiInfo: 'MIDI Info',
    settings: 'Settings', optionsPanel: 'Options', touchMode: 'Touch Mode', desktopMode: 'Desktop Mode',
    fullscreen: 'Fullscreen',
    tracks: 'Tracks', volume: 'Vol', pan: 'Pan', mute: 'Mute', unmute: 'Unmute',
    instrument: 'Instrument', searchInstrument: 'Search by ID, Chinese or English name...',
    preview: 'Preview', clickToPreview: 'Click to preview', addTrack: 'Add Track',
    zoomIn: 'Zoom In', zoomOut: 'Zoom Out', resetView: 'Reset',
    deleteNote: 'Delete', copyNotes: 'Copy', cutNotes: 'Cut', pasteNotes: 'Paste',
    selectAll: 'Select All', deleteSelected: 'Delete Selected',
    play: 'Play', stop: 'Stop', pause: 'Pause', metronome: 'Metronome',
    reverb: 'Reverb', delay: 'Delay',
    delayTime: 'Delay Time', delayFeedback: 'Feedback',
    uiScale: 'UI Scale', soundSource: 'Sound Source',
    defaultOscillator: 'Default Oscillator (Offline)', networkSoundfont: 'Network Soundfont (MusyngKite)',
    sf2Soundfont: 'SF2 Soundfont', loadSF2: 'Load SF2 File',
    autoSave: 'Auto Save', autoSaveOnChange: 'Save on Change', autoSaveInterval: 'Save by Interval',
    intervalSeconds: 'Interval (sec)', max24h: 'sec (max 24h)',
    clearCache: 'Clear All Cached Projects', resetSettings: 'Reset All Settings', close: 'Close',
    title: 'Title', artist: 'Artist', singer: 'Singer', copyright: 'Copyright',
    importProject: 'Import Project', recentProjects: 'Recent Projects', load: 'Load',
    clearRecent: 'Clear Recent', tagline: 'Professional MIDI Editor · Create Freely',
    recoverTitle: 'Unsaved Project Found', recoverDesc: 'Do you want to recover it?',
    recover: 'Recover', discard: 'Discard',
    confirmNew: 'Unsaved changes will be lost. Continue?',
    confirmBack: 'Unsaved changes will be lost. Continue?',
    confirmClear: 'All cached projects will be permanently deleted. Continue?',
    cacheCleared: 'Cache cleared', settingsReset: 'Settings reset',
    importFailed: 'Import MIDI failed: ', language: 'Language',
  }
};

export function useTranslation(lang) {
  return translations[lang] || translations.zh;
}
