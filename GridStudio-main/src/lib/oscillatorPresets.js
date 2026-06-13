// 离线振荡器音色预设，用于“默认振荡器”选项
// 每个预设包含波形类型和包络参数
export const oscillatorPresets = {
  0: { type: 'sine', attack: 0.01, decay: 0.2, sustain: 0.6, release: 0.5 },   // 钢琴
  1: { type: 'sine', attack: 0.01, decay: 0.2, sustain: 0.6, release: 0.5 },
  2: { type: 'sine', attack: 0.02, decay: 0.1, sustain: 0.7, release: 0.4 },
  3: { type: 'sine', attack: 0.02, decay: 0.1, sustain: 0.7, release: 0.4 },
  4: { type: 'sine', attack: 0.005, decay: 0.2, sustain: 0.5, release: 0.3 },
  5: { type: 'sine', attack: 0.005, decay: 0.2, sustain: 0.5, release: 0.3 },
  6: { type: 'square', attack: 0.002, decay: 0.1, sustain: 0.8, release: 0.2 },  // 风琴类
  7: { type: 'square', attack: 0.002, decay: 0.1, sustain: 0.8, release: 0.2 },
  8: { type: 'sawtooth', attack: 0.003, decay: 0.15, sustain: 0.4, release: 0.3 }, // 吉他类
  9: { type: 'sawtooth', attack: 0.003, decay: 0.15, sustain: 0.4, release: 0.3 },
  10: { type: 'triangle', attack: 0.005, decay: 0.1, sustain: 0.5, release: 0.2 },  // 贝司
  11: { type: 'triangle', attack: 0.005, decay: 0.1, sustain: 0.5, release: 0.2 },
  12: { type: 'sawtooth', attack: 0.05, decay: 0.2, sustain: 0.7, release: 0.8 },  // 弦乐
  13: { type: 'sawtooth', attack: 0.05, decay: 0.2, sustain: 0.7, release: 0.8 },
  14: { type: 'sawtooth', attack: 0.008, decay: 0.1, sustain: 0.6, release: 0.3 }, // 铜管
  15: { type: 'sawtooth', attack: 0.008, decay: 0.1, sustain: 0.6, release: 0.3 },
  // 其他程序号可以映射到默认预设
  default: { type: 'sine', attack: 0.003, decay: 0.1, sustain: 0.3, release: 0.3 }
};

export function getOscillatorPreset(program) {
  return oscillatorPresets[program] || oscillatorPresets.default;
}
