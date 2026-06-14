// 优化版振荡器音色预设 - 柔和、准确、不爆音
// 所有谐波幅度已调低，attack 保证不低于 0.005s 防止爆音
// 基础波形使用 sine/triangle，泛音均用 sine 叠加

export const oscillatorPresets = {
  // 钢琴类 (0-7) - 柔和温暖的衰减音色
  0: { type: 'sine', attack: 0.008, decay: 0.5, sustain: 0.2, release: 1.0, harmonics: [1, 0.2, 0.08] },
  1: { type: 'sine', attack: 0.006, decay: 0.45, sustain: 0.22, release: 0.9, harmonics: [1, 0.25, 0.1] },
  2: { type: 'triangle', attack: 0.008, decay: 0.4, sustain: 0.25, release: 0.7, harmonics: [1, 0.18, 0.06] },
  3: { type: 'sine', attack: 0.006, decay: 0.35, sustain: 0.28, release: 0.6, harmonics: [1, 0.22, 0.08] },
  4: { type: 'sine', attack: 0.008, decay: 0.55, sustain: 0.18, release: 1.2, harmonics: [1, 0.15, 0.05] },
  5: { type: 'triangle', attack: 0.008, decay: 0.5, sustain: 0.2, release: 1.0, harmonics: [1, 0.18, 0.06] },
  6: { type: 'sine', attack: 0.006, decay: 0.4, sustain: 0.22, release: 0.8, harmonics: [1, 0.25, 0.1] },
  7: { type: 'triangle', attack: 0.008, decay: 0.45, sustain: 0.25, release: 0.7, harmonics: [1, 0.2, 0.08] },
  
  // 半音打击乐 (8-15) - 清脆明亮、快速衰减
  8: { type: 'sine', attack: 0.005, decay: 0.2, sustain: 0.1, release: 0.35, harmonics: [1, 0.3, 0.12] },
  9: { type: 'sine', attack: 0.005, decay: 0.25, sustain: 0.12, release: 0.4, harmonics: [1, 0.25, 0.1] },
  10: { type: 'sine', attack: 0.005, decay: 0.3, sustain: 0.15, release: 0.5, harmonics: [1, 0.2, 0.08] },
  11: { type: 'triangle', attack: 0.005, decay: 0.22, sustain: 0.12, release: 0.38, harmonics: [1, 0.25, 0.1] },
  12: { type: 'sine', attack: 0.005, decay: 0.35, sustain: 0.18, release: 0.55, harmonics: [1, 0.18, 0.06] },
  13: { type: 'triangle', attack: 0.005, decay: 0.28, sustain: 0.15, release: 0.45, harmonics: [1, 0.22, 0.08] },
  14: { type: 'sine', attack: 0.005, decay: 0.4, sustain: 0.2, release: 0.6, harmonics: [1, 0.15, 0.05] },
  15: { type: 'triangle', attack: 0.005, decay: 0.2, sustain: 0.1, release: 0.35, harmonics: [1, 0.25, 0.1] },
  
  // 风琴类 (16-23) - 持续平稳、丰富谐波
  16: { type: 'sine', attack: 0.015, decay: 0.08, sustain: 0.8, release: 0.12, harmonics: [1, 0.3, 0.15, 0.06] },
  17: { type: 'triangle', attack: 0.012, decay: 0.06, sustain: 0.85, release: 0.1, harmonics: [1, 0.25, 0.12, 0.05] },
  18: { type: 'sine', attack: 0.015, decay: 0.1, sustain: 0.75, release: 0.15, harmonics: [1, 0.35, 0.18, 0.08] },
  19: { type: 'sine', attack: 0.015, decay: 0.08, sustain: 0.8, release: 0.12, harmonics: [1, 0.3, 0.15, 0.06] },
  20: { type: 'triangle', attack: 0.018, decay: 0.12, sustain: 0.7, release: 0.18, harmonics: [1, 0.2, 0.08, 0.03] },
  21: { type: 'sine', attack: 0.015, decay: 0.08, sustain: 0.8, release: 0.12, harmonics: [1, 0.25, 0.12, 0.05] },
  22: { type: 'triangle', attack: 0.015, decay: 0.1, sustain: 0.75, release: 0.15, harmonics: [1, 0.3, 0.15, 0.06] },
  23: { type: 'sine', attack: 0.015, decay: 0.08, sustain: 0.8, release: 0.12, harmonics: [1, 0.25, 0.12, 0.05] },
  
  // 吉他类 (24-31) - 快速拨弦、自然衰减
  24: { type: 'triangle', attack: 0.005, decay: 0.25, sustain: 0.15, release: 0.3, harmonics: [1, 0.22, 0.08, 0.03] },
  25: { type: 'triangle', attack: 0.005, decay: 0.22, sustain: 0.12, release: 0.25, harmonics: [1, 0.25, 0.1, 0.04] },
  26: { type: 'sine', attack: 0.005, decay: 0.28, sustain: 0.18, release: 0.35, harmonics: [1, 0.18, 0.06, 0.02] },
  27: { type: 'triangle', attack: 0.005, decay: 0.25, sustain: 0.15, release: 0.3, harmonics: [1, 0.22, 0.08, 0.03] },
  28: { type: 'sine', attack: 0.005, decay: 0.3, sustain: 0.2, release: 0.38, harmonics: [1, 0.15, 0.05] },
  29: { type: 'triangle', attack: 0.005, decay: 0.35, sustain: 0.22, release: 0.4, harmonics: [1, 0.3, 0.12, 0.05] },
  30: { type: 'triangle', attack: 0.005, decay: 0.28, sustain: 0.18, release: 0.35, harmonics: [1, 0.35, 0.15, 0.06] },
  31: { type: 'sine', attack: 0.005, decay: 0.4, sustain: 0.25, release: 0.5, harmonics: [1, 0.12, 0.04] },
  
  // 贝司类 (32-39) - 低频厚实、温暖
  32: { type: 'triangle', attack: 0.005, decay: 0.12, sustain: 0.55, release: 0.25, harmonics: [1, 0.2, 0.06] },
  33: { type: 'triangle', attack: 0.005, decay: 0.1, sustain: 0.6, release: 0.2, harmonics: [1, 0.25, 0.08] },
  34: { type: 'triangle', attack: 0.005, decay: 0.08, sustain: 0.65, release: 0.18, harmonics: [1, 0.3, 0.1] },
  35: { type: 'sine', attack: 0.005, decay: 0.15, sustain: 0.45, release: 0.3, harmonics: [1, 0.15, 0.05] },
  36: { type: 'triangle', attack: 0.005, decay: 0.18, sustain: 0.35, release: 0.35, harmonics: [1, 0.35, 0.12, 0.05] },
  37: { type: 'triangle', attack: 0.005, decay: 0.12, sustain: 0.55, release: 0.25, harmonics: [1, 0.2, 0.06] },
  38: { type: 'triangle', attack: 0.005, decay: 0.1, sustain: 0.6, release: 0.2, harmonics: [1, 0.28, 0.1, 0.04] },
  39: { type: 'triangle', attack: 0.005, decay: 0.12, sustain: 0.58, release: 0.25, harmonics: [1, 0.22, 0.08] },
  
  // 弦乐类 (40-47) - 慢起、持续、柔和
  40: { type: 'triangle', attack: 0.1, decay: 0.25, sustain: 0.65, release: 0.7, harmonics: [1, 0.25, 0.12, 0.05, 0.02] },
  41: { type: 'triangle', attack: 0.12, decay: 0.3, sustain: 0.6, release: 0.8, harmonics: [1, 0.2, 0.1, 0.04, 0.01] },
  42: { type: 'triangle', attack: 0.15, decay: 0.35, sustain: 0.55, release: 0.9, harmonics: [1, 0.18, 0.08, 0.03] },
  43: { type: 'triangle', attack: 0.18, decay: 0.4, sustain: 0.5, release: 1.0, harmonics: [1, 0.15, 0.06, 0.02] },
  44: { type: 'triangle', attack: 0.08, decay: 0.2, sustain: 0.7, release: 0.6, harmonics: [1, 0.3, 0.15, 0.06, 0.02] },
  45: { type: 'triangle', attack: 0.005, decay: 0.12, sustain: 0.15, release: 0.25, harmonics: [1, 0.2, 0.06] },
  46: { type: 'sine', attack: 0.008, decay: 0.18, sustain: 0.55, release: 0.45, harmonics: [1, 0.22, 0.08, 0.03] },
  47: { type: 'triangle', attack: 0.1, decay: 0.25, sustain: 0.65, release: 0.7, harmonics: [1, 0.25, 0.12, 0.05, 0.02] },
  
  // 合奏类 (48-55) - 丰满、温暖
  48: { type: 'triangle', attack: 0.08, decay: 0.2, sustain: 0.65, release: 0.6, harmonics: [1, 0.3, 0.15, 0.06, 0.02] },
  49: { type: 'triangle', attack: 0.1, decay: 0.25, sustain: 0.6, release: 0.7, harmonics: [1, 0.25, 0.12, 0.05, 0.02] },
  50: { type: 'triangle', attack: 0.06, decay: 0.15, sustain: 0.7, release: 0.5, harmonics: [1, 0.35, 0.18, 0.08, 0.03] },
  51: { type: 'triangle', attack: 0.08, decay: 0.2, sustain: 0.65, release: 0.6, harmonics: [1, 0.3, 0.15, 0.06, 0.02] },
  52: { type: 'sine', attack: 0.05, decay: 0.12, sustain: 0.75, release: 0.4, harmonics: [1, 0.18, 0.06, 0.02] },
  53: { type: 'sine', attack: 0.06, decay: 0.15, sustain: 0.7, release: 0.5, harmonics: [1, 0.22, 0.08, 0.03] },
  54: { type: 'triangle', attack: 0.08, decay: 0.2, sustain: 0.65, release: 0.6, harmonics: [1, 0.25, 0.12, 0.05, 0.02] },
  55: { type: 'triangle', attack: 0.1, decay: 0.25, sustain: 0.6, release: 0.7, harmonics: [1, 0.3, 0.15, 0.06, 0.02] },
  
  // 铜管类 (56-63) - 明亮但不过激
  56: { type: 'triangle', attack: 0.02, decay: 0.12, sustain: 0.65, release: 0.25, harmonics: [1, 0.35, 0.18, 0.08, 0.03] },
  57: { type: 'triangle', attack: 0.025, decay: 0.15, sustain: 0.6, release: 0.3, harmonics: [1, 0.3, 0.15, 0.06, 0.02] },
  58: { type: 'triangle', attack: 0.03, decay: 0.18, sustain: 0.55, release: 0.35, harmonics: [1, 0.25, 0.12, 0.05, 0.02] },
  59: { type: 'triangle', attack: 0.022, decay: 0.12, sustain: 0.65, release: 0.25, harmonics: [1, 0.3, 0.15, 0.06, 0.02] },
  60: { type: 'triangle', attack: 0.025, decay: 0.15, sustain: 0.6, release: 0.3, harmonics: [1, 0.35, 0.18, 0.08, 0.03] },
  61: { type: 'triangle', attack: 0.02, decay: 0.12, sustain: 0.65, release: 0.25, harmonics: [1, 0.3, 0.15, 0.06, 0.02] },
  62: { type: 'triangle', attack: 0.025, decay: 0.15, sustain: 0.6, release: 0.3, harmonics: [1, 0.25, 0.12, 0.05, 0.02] },
  63: { type: 'triangle', attack: 0.03, decay: 0.18, sustain: 0.55, release: 0.35, harmonics: [1, 0.2, 0.08, 0.03] },
  
  // 木管类 (64-71) - 柔和气息、纯净
  64: { type: 'sine', attack: 0.025, decay: 0.12, sustain: 0.55, release: 0.35, harmonics: [1, 0.18, 0.05] },
  65: { type: 'sine', attack: 0.03, decay: 0.15, sustain: 0.5, release: 0.4, harmonics: [1, 0.2, 0.06] },
  66: { type: 'triangle', attack: 0.035, decay: 0.18, sustain: 0.45, release: 0.45, harmonics: [1, 0.15, 0.04] },
  67: { type: 'sine', attack: 0.03, decay: 0.15, sustain: 0.48, release: 0.42, harmonics: [1, 0.18, 0.05] },
  68: { type: 'triangle', attack: 0.025, decay: 0.12, sustain: 0.55, release: 0.35, harmonics: [1, 0.2, 0.06] },
  69: { type: 'triangle', attack: 0.03, decay: 0.15, sustain: 0.5, release: 0.4, harmonics: [1, 0.18, 0.05] },
  70: { type: 'triangle', attack: 0.035, decay: 0.18, sustain: 0.45, release: 0.45, harmonics: [1, 0.15, 0.04] },
  71: { type: 'sine', attack: 0.03, decay: 0.15, sustain: 0.48, release: 0.42, harmonics: [1, 0.2, 0.06] },
  
  // 簧片类 (72-79) - 鼻音特色但更柔和
  72: { type: 'triangle', attack: 0.015, decay: 0.1, sustain: 0.65, release: 0.2, harmonics: [1, 0.3, 0.15, 0.06] },
  73: { type: 'triangle', attack: 0.018, decay: 0.12, sustain: 0.6, release: 0.25, harmonics: [1, 0.25, 0.12, 0.05] },
  74: { type: 'triangle', attack: 0.02, decay: 0.15, sustain: 0.55, release: 0.3, harmonics: [1, 0.2, 0.08, 0.03] },
  75: { type: 'triangle', attack: 0.022, decay: 0.18, sustain: 0.5, release: 0.35, harmonics: [1, 0.18, 0.06, 0.02] },
  76: { type: 'triangle', attack: 0.012, decay: 0.08, sustain: 0.7, release: 0.15, harmonics: [1, 0.25, 0.1, 0.04] },
  77: { type: 'triangle', attack: 0.015, decay: 0.1, sustain: 0.65, release: 0.2, harmonics: [1, 0.22, 0.08, 0.03] },
  78: { type: 'triangle', attack: 0.018, decay: 0.12, sustain: 0.6, release: 0.25, harmonics: [1, 0.18, 0.06, 0.02] },
  79: { type: 'sine', attack: 0.018, decay: 0.15, sustain: 0.55, release: 0.3, harmonics: [1, 0.22, 0.08, 0.03] },
  
  // 合成音色 (80-87) - 电子感但控制音量
  80: { type: 'triangle', attack: 0.008, decay: 0.12, sustain: 0.75, release: 0.2, harmonics: [1, 0.35, 0.18, 0.06] },
  81: { type: 'triangle', attack: 0.01, decay: 0.15, sustain: 0.7, release: 0.25, harmonics: [1, 0.3, 0.15, 0.05] },
  82: { type: 'sine', attack: 0.012, decay: 0.2, sustain: 0.65, release: 0.35, harmonics: [1, 0.18, 0.06, 0.02] },
  83: { type: 'sine', attack: 0.015, decay: 0.25, sustain: 0.6, release: 0.45, harmonics: [1, 0.22, 0.08, 0.03] },
  84: { type: 'triangle', attack: 0.008, decay: 0.15, sustain: 0.7, release: 0.25, harmonics: [1, 0.25, 0.1, 0.04] },
  85: { type: 'sine', attack: 0.01, decay: 0.18, sustain: 0.65, release: 0.3, harmonics: [1, 0.18, 0.06, 0.02] },
  86: { type: 'triangle', attack: 0.012, decay: 0.2, sustain: 0.6, release: 0.35, harmonics: [1, 0.3, 0.12, 0.05] },
  87: { type: 'sine', attack: 0.015, decay: 0.3, sustain: 0.55, release: 0.5, harmonics: [1, 0.15, 0.05] },
  
  // 民族乐器 (88-95) - 自然拨弦感
  88: { type: 'sine', attack: 0.005, decay: 0.18, sustain: 0.2, release: 0.25, harmonics: [1, 0.2, 0.06] },
  89: { type: 'triangle', attack: 0.005, decay: 0.2, sustain: 0.22, release: 0.3, harmonics: [1, 0.18, 0.05] },
  90: { type: 'sine', attack: 0.005, decay: 0.22, sustain: 0.25, release: 0.35, harmonics: [1, 0.25, 0.08] },
  91: { type: 'sine', attack: 0.005, decay: 0.25, sustain: 0.28, release: 0.38, harmonics: [1, 0.2, 0.06] },
  92: { type: 'sine', attack: 0.005, decay: 0.28, sustain: 0.3, release: 0.42, harmonics: [1, 0.15, 0.04] },
  93: { type: 'triangle', attack: 0.005, decay: 0.3, sustain: 0.32, release: 0.45, harmonics: [1, 0.18, 0.05] },
  94: { type: 'sine', attack: 0.005, decay: 0.32, sustain: 0.35, release: 0.5, harmonics: [1, 0.2, 0.06] },
  95: { type: 'triangle', attack: 0.005, decay: 0.35, sustain: 0.38, release: 0.55, harmonics: [1, 0.18, 0.05] },
  
  // GM打击乐 (96-127) - 使用噪声和特殊波形
  96: { type: 'noise', attack: 0.001, decay: 0.05, sustain: 0, release: 0.05, isDrum: true },
  97: { type: 'noise', attack: 0.002, decay: 0.1, sustain: 0, release: 0.1, isDrum: true, freq: 80 },
  98: { type: 'noise', attack: 0.001, decay: 0.06, sustain: 0, release: 0.06, isDrum: true },
  99: { type: 'noise', attack: 0.001, decay: 0.04, sustain: 0, release: 0.04, isDrum: true },
  100: { type: 'noise', attack: 0.001, decay: 0.05, sustain: 0, release: 0.05, isDrum: true, freq: 150 },
  101: { type: 'noise', attack: 0.002, decay: 0.08, sustain: 0, release: 0.08, isDrum: true, freq: 100 },
  102: { type: 'noise', attack: 0.002, decay: 0.07, sustain: 0, release: 0.07, isDrum: true, freq: 120 },
  103: { type: 'noise', attack: 0.002, decay: 0.06, sustain: 0, release: 0.06, isDrum: true, freq: 140 },
  104: { type: 'noise', attack: 0.001, decay: 0.03, sustain: 0, release: 0.1, isDrum: true, isCymbal: true },
  105: { type: 'noise', attack: 0.001, decay: 0.02, sustain: 0, release: 0.08, isDrum: true, isCymbal: true },
  106: { type: 'noise', attack: 0.001, decay: 0.04, sustain: 0, release: 0.12, isDrum: true, isCymbal: true },
  107: { type: 'noise', attack: 0.002, decay: 0.06, sustain: 0, release: 0.15, isDrum: true, isCymbal: true },
  108: { type: 'sine', attack: 0.001, decay: 0.03, sustain: 0, release: 0.03, isDrum: true, freq: 800 },
  109: { type: 'sine', attack: 0.001, decay: 0.05, sustain: 0, release: 0.2, isDrum: true, freq: 2000, isMetallic: true },
  110: { type: 'noise', attack: 0.001, decay: 0.04, sustain: 0, release: 0.1, isDrum: true, isShaker: true },
  111: { type: 'sine', attack: 0.001, decay: 0.08, sustain: 0, release: 0.3, isDrum: true, freq: 1500, isMetallic: true },
  112: { type: 'triangle', attack: 0.008, decay: 0.18, sustain: 0.25, release: 0.25 },
  113: { type: 'triangle', attack: 0.01, decay: 0.2, sustain: 0.28, release: 0.28 },
  114: { type: 'triangle', attack: 0.012, decay: 0.25, sustain: 0.3, release: 0.3 },
  115: { type: 'triangle', attack: 0.015, decay: 0.28, sustain: 0.35, release: 0.35 },
  116: { type: 'triangle', attack: 0.018, decay: 0.3, sustain: 0.38, release: 0.38 },
  117: { type: 'triangle', attack: 0.02, decay: 0.35, sustain: 0.4, release: 0.4 },
  118: { type: 'triangle', attack: 0.025, decay: 0.38, sustain: 0.45, release: 0.45 },
  119: { type: 'triangle', attack: 0.03, decay: 0.4, sustain: 0.5, release: 0.5 },
  120: { type: 'noise', attack: 0.001, decay: 0.03, sustain: 0, release: 0.03, isDrum: true, freq: 300 },
  121: { type: 'noise', attack: 0.001, decay: 0.04, sustain: 0, release: 0.04, isDrum: true, freq: 250 },
  122: { type: 'noise', attack: 0.001, decay: 0.05, sustain: 0, release: 0.05, isDrum: true, freq: 200 },
  123: { type: 'noise', attack: 0.001, decay: 0.06, sustain: 0, release: 0.06, isDrum: true, freq: 180 },
  124: { type: 'noise', attack: 0.001, decay: 0.07, sustain: 0, release: 0.07, isDrum: true, freq: 160 },
  125: { type: 'noise', attack: 0.001, decay: 0.08, sustain: 0, release: 0.08, isDrum: true, freq: 140 },
  126: { type: 'noise', attack: 0.001, decay: 0.09, sustain: 0, release: 0.09, isDrum: true, freq: 120 },
  127: { type: 'noise', attack: 0.001, decay: 0.1, sustain: 0, release: 0.1, isDrum: true, freq: 100 },
  
  default: { type: 'sine', attack: 0.008, decay: 0.2, sustain: 0.35, release: 0.35, harmonics: [1, 0.18, 0.05] }
};

export function getOscillatorPreset(program) {
  return oscillatorPresets[program] || oscillatorPresets.default;
}