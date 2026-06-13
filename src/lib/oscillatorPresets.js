// 改进版振荡器音色预设 - 更柔和、更自然的音色
// 使用多层振荡器叠加和更精细的包络

export const oscillatorPresets = {
  // 钢琴类 (0-7) - 柔和温暖
  0: { type: 'sine', attack: 0.008, decay: 0.4, sustain: 0.3, release: 1.2, harmonics: [1, 0.5, 0.25] },
  1: { type: 'sine', attack: 0.01, decay: 0.35, sustain: 0.35, release: 1.0, harmonics: [1, 0.6, 0.3] },
  2: { type: 'triangle', attack: 0.012, decay: 0.3, sustain: 0.4, release: 0.8, harmonics: [1, 0.4, 0.2] },
  3: { type: 'sine', attack: 0.015, decay: 0.25, sustain: 0.45, release: 0.7, harmonics: [1, 0.5, 0.25] },
  4: { type: 'sine', attack: 0.01, decay: 0.45, sustain: 0.25, release: 1.5, harmonics: [1, 0.3, 0.15] },
  5: { type: 'triangle', attack: 0.012, decay: 0.4, sustain: 0.3, release: 1.2, harmonics: [1, 0.4, 0.2] },
  6: { type: 'sine', attack: 0.008, decay: 0.3, sustain: 0.35, release: 0.9, harmonics: [1, 0.6, 0.3] },
  7: { type: 'triangle', attack: 0.01, decay: 0.35, sustain: 0.4, release: 0.8, harmonics: [1, 0.5, 0.25] },
  
  // 半音打击乐 (8-15) - 清脆明亮
  8: { type: 'sine', attack: 0.002, decay: 0.15, sustain: 0.15, release: 0.4, harmonics: [1, 0.8, 0.4] },
  9: { type: 'sine', attack: 0.003, decay: 0.2, sustain: 0.2, release: 0.5, harmonics: [1, 0.7, 0.35] },
  10: { type: 'sine', attack: 0.004, decay: 0.25, sustain: 0.25, release: 0.6, harmonics: [1, 0.6, 0.3] },
  11: { type: 'triangle', attack: 0.003, decay: 0.18, sustain: 0.2, release: 0.45, harmonics: [1, 0.7, 0.35] },
  12: { type: 'sine', attack: 0.005, decay: 0.3, sustain: 0.3, release: 0.7, harmonics: [1, 0.5, 0.25] },
  13: { type: 'triangle', attack: 0.004, decay: 0.22, sustain: 0.25, release: 0.55, harmonics: [1, 0.6, 0.3] },
  14: { type: 'sine', attack: 0.006, decay: 0.35, sustain: 0.35, release: 0.8, harmonics: [1, 0.4, 0.2] },
  15: { type: 'triangle', attack: 0.003, decay: 0.15, sustain: 0.15, release: 0.4, harmonics: [1, 0.7, 0.35] },
  
  // 风琴类 (16-23) - 持续平稳
  16: { type: 'sine', attack: 0.02, decay: 0.1, sustain: 0.85, release: 0.15, harmonics: [1, 0.8, 0.6, 0.4] },
  17: { type: 'triangle', attack: 0.018, decay: 0.08, sustain: 0.9, release: 0.12, harmonics: [1, 0.7, 0.5, 0.3] },
  18: { type: 'sine', attack: 0.022, decay: 0.12, sustain: 0.8, release: 0.18, harmonics: [1, 0.9, 0.7, 0.5] },
  19: { type: 'sine', attack: 0.02, decay: 0.1, sustain: 0.85, release: 0.15, harmonics: [1, 0.8, 0.6, 0.4] },
  20: { type: 'triangle', attack: 0.025, decay: 0.15, sustain: 0.75, release: 0.2, harmonics: [1, 0.6, 0.4, 0.2] },
  21: { type: 'sine', attack: 0.02, decay: 0.1, sustain: 0.85, release: 0.15, harmonics: [1, 0.7, 0.5, 0.3] },
  22: { type: 'triangle', attack: 0.022, decay: 0.12, sustain: 0.8, release: 0.18, harmonics: [1, 0.8, 0.6, 0.4] },
  23: { type: 'sine', attack: 0.02, decay: 0.1, sustain: 0.85, release: 0.15, harmonics: [1, 0.7, 0.5, 0.3] },
  
  // 吉他类 (24-31) - 自然拨弦
  24: { type: 'triangle', attack: 0.003, decay: 0.2, sustain: 0.25, release: 0.35, harmonics: [1, 0.6, 0.3, 0.15] },
  25: { type: 'triangle', attack: 0.002, decay: 0.18, sustain: 0.2, release: 0.3, harmonics: [1, 0.7, 0.35, 0.18] },
  26: { type: 'sine', attack: 0.004, decay: 0.22, sustain: 0.3, release: 0.4, harmonics: [1, 0.5, 0.25, 0.12] },
  27: { type: 'triangle', attack: 0.003, decay: 0.2, sustain: 0.25, release: 0.35, harmonics: [1, 0.6, 0.3, 0.15] },
  28: { type: 'sine', attack: 0.005, decay: 0.25, sustain: 0.35, release: 0.45, harmonics: [1, 0.4, 0.2, 0.1] },
  29: { type: 'sawtooth', attack: 0.006, decay: 0.3, sustain: 0.4, release: 0.5, harmonics: [1, 0.8, 0.5, 0.25] },
  30: { type: 'sawtooth', attack: 0.004, decay: 0.22, sustain: 0.3, release: 0.4, harmonics: [1, 0.9, 0.6, 0.3] },
  31: { type: 'sine', attack: 0.008, decay: 0.35, sustain: 0.45, release: 0.6, harmonics: [1, 0.3, 0.15, 0.08] },
  
  // 贝司类 (32-39) - 低频厚实
  32: { type: 'triangle', attack: 0.008, decay: 0.15, sustain: 0.6, release: 0.3, harmonics: [1, 0.5, 0.25] },
  33: { type: 'triangle', attack: 0.006, decay: 0.12, sustain: 0.7, release: 0.25, harmonics: [1, 0.6, 0.3] },
  34: { type: 'triangle', attack: 0.005, decay: 0.1, sustain: 0.75, release: 0.2, harmonics: [1, 0.7, 0.35] },
  35: { type: 'sine', attack: 0.007, decay: 0.18, sustain: 0.5, release: 0.35, harmonics: [1, 0.4, 0.2] },
  36: { type: 'sawtooth', attack: 0.009, decay: 0.2, sustain: 0.4, release: 0.4, harmonics: [1, 0.8, 0.5, 0.25] },
  37: { type: 'triangle', attack: 0.008, decay: 0.15, sustain: 0.6, release: 0.3, harmonics: [1, 0.5, 0.25] },
  38: { type: 'sawtooth', attack: 0.006, decay: 0.12, sustain: 0.7, release: 0.25, harmonics: [1, 0.7, 0.4, 0.2] },
  39: { type: 'triangle', attack: 0.007, decay: 0.15, sustain: 0.65, release: 0.3, harmonics: [1, 0.6, 0.3] },
  
  // 弦乐类 (40-47) - 柔和持续
  40: { type: 'sawtooth', attack: 0.12, decay: 0.3, sustain: 0.7, release: 0.8, harmonics: [1, 0.7, 0.5, 0.3, 0.15] },
  41: { type: 'sawtooth', attack: 0.15, decay: 0.35, sustain: 0.65, release: 0.9, harmonics: [1, 0.6, 0.4, 0.2, 0.1] },
  42: { type: 'sawtooth', attack: 0.18, decay: 0.4, sustain: 0.6, release: 1.0, harmonics: [1, 0.5, 0.3, 0.15, 0.08] },
  43: { type: 'sawtooth', attack: 0.2, decay: 0.45, sustain: 0.55, release: 1.1, harmonics: [1, 0.4, 0.2, 0.1, 0.05] },
  44: { type: 'sawtooth', attack: 0.1, decay: 0.25, sustain: 0.75, release: 0.7, harmonics: [1, 0.8, 0.6, 0.4, 0.2] },
  45: { type: 'triangle', attack: 0.008, decay: 0.15, sustain: 0.2, release: 0.3, harmonics: [1, 0.5, 0.25] },
  46: { type: 'sine', attack: 0.01, decay: 0.2, sustain: 0.6, release: 0.5, harmonics: [1, 0.6, 0.3, 0.15] },
  47: { type: 'sawtooth', attack: 0.12, decay: 0.3, sustain: 0.7, release: 0.8, harmonics: [1, 0.7, 0.5, 0.3, 0.15] },
  
  // 合奏类 (48-55) - 丰满
  48: { type: 'sawtooth', attack: 0.1, decay: 0.25, sustain: 0.7, release: 0.7, harmonics: [1, 0.8, 0.6, 0.4, 0.2] },
  49: { type: 'sawtooth', attack: 0.12, decay: 0.3, sustain: 0.65, release: 0.8, harmonics: [1, 0.7, 0.5, 0.3, 0.15] },
  50: { type: 'sawtooth', attack: 0.08, decay: 0.2, sustain: 0.75, release: 0.6, harmonics: [1, 0.9, 0.7, 0.5, 0.25] },
  51: { type: 'sawtooth', attack: 0.1, decay: 0.25, sustain: 0.7, release: 0.7, harmonics: [1, 0.8, 0.6, 0.4, 0.2] },
  52: { type: 'sine', attack: 0.06, decay: 0.15, sustain: 0.8, release: 0.5, harmonics: [1, 0.5, 0.3, 0.15] },
  53: { type: 'sine', attack: 0.08, decay: 0.2, sustain: 0.75, release: 0.6, harmonics: [1, 0.6, 0.4, 0.2] },
  54: { type: 'sawtooth', attack: 0.1, decay: 0.25, sustain: 0.7, release: 0.7, harmonics: [1, 0.7, 0.5, 0.3, 0.15] },
  55: { type: 'sawtooth', attack: 0.12, decay: 0.3, sustain: 0.65, release: 0.8, harmonics: [1, 0.8, 0.6, 0.4, 0.2] },
  
  // 铜管类 (56-63) - 明亮有力
  56: { type: 'sawtooth', attack: 0.025, decay: 0.15, sustain: 0.7, release: 0.3, harmonics: [1, 0.9, 0.7, 0.5, 0.25] },
  57: { type: 'sawtooth', attack: 0.03, decay: 0.18, sustain: 0.65, release: 0.35, harmonics: [1, 0.8, 0.6, 0.4, 0.2] },
  58: { type: 'sawtooth', attack: 0.035, decay: 0.2, sustain: 0.6, release: 0.4, harmonics: [1, 0.7, 0.5, 0.3, 0.15] },
  59: { type: 'sawtooth', attack: 0.028, decay: 0.15, sustain: 0.7, release: 0.3, harmonics: [1, 0.8, 0.6, 0.4, 0.2] },
  60: { type: 'sawtooth', attack: 0.03, decay: 0.18, sustain: 0.65, release: 0.35, harmonics: [1, 0.9, 0.7, 0.5, 0.25] },
  61: { type: 'sawtooth', attack: 0.025, decay: 0.15, sustain: 0.7, release: 0.3, harmonics: [1, 0.8, 0.6, 0.4, 0.2] },
  62: { type: 'sawtooth', attack: 0.03, decay: 0.18, sustain: 0.65, release: 0.35, harmonics: [1, 0.7, 0.5, 0.3, 0.15] },
  63: { type: 'sawtooth', attack: 0.035, decay: 0.2, sustain: 0.6, release: 0.4, harmonics: [1, 0.6, 0.4, 0.2, 0.1] },
  
  // 木管类 (64-71) - 柔和气息
  64: { type: 'sine', attack: 0.03, decay: 0.15, sustain: 0.6, release: 0.4, harmonics: [1, 0.5, 0.25] },
  65: { type: 'sine', attack: 0.035, decay: 0.18, sustain: 0.55, release: 0.45, harmonics: [1, 0.6, 0.3] },
  66: { type: 'triangle', attack: 0.04, decay: 0.2, sustain: 0.5, release: 0.5, harmonics: [1, 0.4, 0.2] },
  67: { type: 'sine', attack: 0.038, decay: 0.18, sustain: 0.52, release: 0.48, harmonics: [1, 0.5, 0.25] },
  68: { type: 'triangle', attack: 0.03, decay: 0.15, sustain: 0.6, release: 0.4, harmonics: [1, 0.6, 0.3] },
  69: { type: 'triangle', attack: 0.035, decay: 0.18, sustain: 0.55, release: 0.45, harmonics: [1, 0.5, 0.25] },
  70: { type: 'triangle', attack: 0.04, decay: 0.2, sustain: 0.5, release: 0.5, harmonics: [1, 0.4, 0.2] },
  71: { type: 'sine', attack: 0.038, decay: 0.18, sustain: 0.52, release: 0.48, harmonics: [1, 0.6, 0.3] },
  
  // 簧片类 (72-79) - 鼻音特色
  72: { type: 'sawtooth', attack: 0.02, decay: 0.12, sustain: 0.7, release: 0.25, harmonics: [1, 0.8, 0.6, 0.4] },
  73: { type: 'sawtooth', attack: 0.022, decay: 0.15, sustain: 0.65, release: 0.3, harmonics: [1, 0.7, 0.5, 0.3] },
  74: { type: 'sawtooth', attack: 0.025, decay: 0.18, sustain: 0.6, release: 0.35, harmonics: [1, 0.6, 0.4, 0.2] },
  75: { type: 'sawtooth', attack: 0.028, decay: 0.2, sustain: 0.55, release: 0.4, harmonics: [1, 0.5, 0.3, 0.15] },
  76: { type: 'triangle', attack: 0.015, decay: 0.1, sustain: 0.75, release: 0.2, harmonics: [1, 0.7, 0.4, 0.2] },
  77: { type: 'triangle', attack: 0.018, decay: 0.12, sustain: 0.7, release: 0.25, harmonics: [1, 0.6, 0.3, 0.15] },
  78: { type: 'triangle', attack: 0.02, decay: 0.15, sustain: 0.65, release: 0.3, harmonics: [1, 0.5, 0.25, 0.12] },
  79: { type: 'sine', attack: 0.022, decay: 0.18, sustain: 0.6, release: 0.35, harmonics: [1, 0.6, 0.3, 0.15] },
  
  // 合成音色 (80-87)
  80: { type: 'square', attack: 0.01, decay: 0.15, sustain: 0.8, release: 0.25, harmonics: [1, 0.9, 0.7, 0.5] },
  81: { type: 'sawtooth', attack: 0.012, decay: 0.2, sustain: 0.75, release: 0.3, harmonics: [1, 0.8, 0.6, 0.4] },
  82: { type: 'sine', attack: 0.015, decay: 0.25, sustain: 0.7, release: 0.4, harmonics: [1, 0.5, 0.3, 0.15] },
  83: { type: 'sine', attack: 0.018, decay: 0.3, sustain: 0.65, release: 0.5, harmonics: [1, 0.6, 0.4, 0.2] },
  84: { type: 'triangle', attack: 0.01, decay: 0.18, sustain: 0.75, release: 0.3, harmonics: [1, 0.7, 0.4, 0.2] },
  85: { type: 'sine', attack: 0.012, decay: 0.2, sustain: 0.7, release: 0.35, harmonics: [1, 0.5, 0.3, 0.15] },
  86: { type: 'sawtooth', attack: 0.015, decay: 0.25, sustain: 0.65, release: 0.4, harmonics: [1, 0.8, 0.5, 0.25] },
  87: { type: 'sine', attack: 0.02, decay: 0.35, sustain: 0.6, release: 0.6, harmonics: [1, 0.4, 0.2, 0.1] },
  
  // 民族乐器 (88-95)
  88: { type: 'sine', attack: 0.005, decay: 0.15, sustain: 0.25, release: 0.3, harmonics: [1, 0.6, 0.3] },
  89: { type: 'triangle', attack: 0.006, decay: 0.18, sustain: 0.3, release: 0.35, harmonics: [1, 0.5, 0.25] },
  90: { type: 'sine', attack: 0.007, decay: 0.2, sustain: 0.35, release: 0.4, harmonics: [1, 0.7, 0.35] },
  91: { type: 'sine', attack: 0.008, decay: 0.22, sustain: 0.4, release: 0.45, harmonics: [1, 0.6, 0.3] },
  92: { type: 'sine', attack: 0.009, decay: 0.25, sustain: 0.45, release: 0.5, harmonics: [1, 0.4, 0.2] },
  93: { type: 'triangle', attack: 0.01, decay: 0.28, sustain: 0.5, release: 0.55, harmonics: [1, 0.5, 0.25] },
  94: { type: 'sine', attack: 0.012, decay: 0.3, sustain: 0.55, release: 0.6, harmonics: [1, 0.6, 0.3] },
  95: { type: 'triangle', attack: 0.015, decay: 0.32, sustain: 0.6, release: 0.65, harmonics: [1, 0.5, 0.25] },
  
  // GM打击乐 (96-127) - 使用噪声和特殊波形
  96: { type: 'noise', attack: 0.001, decay: 0.05, sustain: 0, release: 0.05, isDrum: true },  // 小鼓
  97: { type: 'noise', attack: 0.002, decay: 0.1, sustain: 0, release: 0.1, isDrum: true, freq: 80 },  // 大鼓
  98: { type: 'noise', attack: 0.001, decay: 0.06, sustain: 0, release: 0.06, isDrum: true },  // 侧鼓
  99: { type: 'noise', attack: 0.001, decay: 0.04, sustain: 0, release: 0.04, isDrum: true },  // 手鼓
  100: { type: 'noise', attack: 0.001, decay: 0.05, sustain: 0, release: 0.05, isDrum: true, freq: 150 },  // 通鼓
  101: { type: 'noise', attack: 0.002, decay: 0.08, sustain: 0, release: 0.08, isDrum: true, freq: 100 },  // 定音鼓
  102: { type: 'noise', attack: 0.002, decay: 0.07, sustain: 0, release: 0.07, isDrum: true, freq: 120 },  // 低音通鼓
  103: { type: 'noise', attack: 0.002, decay: 0.06, sustain: 0, release: 0.06, isDrum: true, freq: 140 },  // 中鼓
  104: { type: 'noise', attack: 0.001, decay: 0.03, sustain: 0, release: 0.1, isDrum: true, isCymbal: true },  // 镲
  105: { type: 'noise', attack: 0.001, decay: 0.02, sustain: 0, release: 0.08, isDrum: true, isCymbal: true },  // 踩镲
  106: { type: 'noise', attack: 0.001, decay: 0.04, sustain: 0, release: 0.12, isDrum: true, isCymbal: true },  // 铃鼓
  107: { type: 'noise', attack: 0.002, decay: 0.06, sustain: 0, release: 0.15, isDrum: true, isCymbal: true },  // 铜鼓
  108: { type: 'sine', attack: 0.001, decay: 0.03, sustain: 0, release: 0.03, isDrum: true, freq: 800 },  // 木鱼
  109: { type: 'sine', attack: 0.001, decay: 0.05, sustain: 0, release: 0.2, isDrum: true, freq: 2000, isMetallic: true },  // 三角铁
  110: { type: 'noise', attack: 0.001, decay: 0.04, sustain: 0, release: 0.1, isDrum: true, isShaker: true },  // 沙锤
  111: { type: 'sine', attack: 0.001, decay: 0.08, sustain: 0, release: 0.3, isDrum: true, freq: 1500, isMetallic: true },  // 铃铛
  112: { type: 'sawtooth', attack: 0.01, decay: 0.2, sustain: 0.3, release: 0.3 },
  113: { type: 'sawtooth', attack: 0.012, decay: 0.25, sustain: 0.35, release: 0.35 },
  114: { type: 'sawtooth', attack: 0.015, decay: 0.3, sustain: 0.4, release: 0.4 },
  115: { type: 'sawtooth', attack: 0.018, decay: 0.35, sustain: 0.45, release: 0.45 },
  116: { type: 'sawtooth', attack: 0.02, decay: 0.4, sustain: 0.5, release: 0.5 },
  117: { type: 'sawtooth', attack: 0.025, decay: 0.45, sustain: 0.55, release: 0.55 },
  118: { type: 'sawtooth', attack: 0.03, decay: 0.5, sustain: 0.6, release: 0.6 },
  119: { type: 'sawtooth', attack: 0.035, decay: 0.55, sustain: 0.65, release: 0.65 },
  120: { type: 'noise', attack: 0.001, decay: 0.03, sustain: 0, release: 0.03, isDrum: true, freq: 300 },
  121: { type: 'noise', attack: 0.001, decay: 0.04, sustain: 0, release: 0.04, isDrum: true, freq: 250 },
  122: { type: 'noise', attack: 0.001, decay: 0.05, sustain: 0, release: 0.05, isDrum: true, freq: 200 },
  123: { type: 'noise', attack: 0.001, decay: 0.06, sustain: 0, release: 0.06, isDrum: true, freq: 180 },
  124: { type: 'noise', attack: 0.001, decay: 0.07, sustain: 0, release: 0.07, isDrum: true, freq: 160 },
  125: { type: 'noise', attack: 0.001, decay: 0.08, sustain: 0, release: 0.08, isDrum: true, freq: 140 },
  126: { type: 'noise', attack: 0.001, decay: 0.09, sustain: 0, release: 0.09, isDrum: true, freq: 120 },
  127: { type: 'noise', attack: 0.001, decay: 0.1, sustain: 0, release: 0.1, isDrum: true, freq: 100 },
  
  default: { type: 'sine', attack: 0.01, decay: 0.2, sustain: 0.4, release: 0.4, harmonics: [1, 0.5, 0.25] }
};

export function getOscillatorPreset(program) {
  return oscillatorPresets[program] || oscillatorPresets.default;
}
