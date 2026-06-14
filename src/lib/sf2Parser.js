// SF2 (SoundFont2) 音色库文件解析器 - 极致性能优化版
// 优化策略：
// 1. 存储原始 Int16 PCM 数据（不预创建 AudioBuffer），延迟到播放时按需创建
// 2. 预建 Array(128) MIDI 索引，O(1) 查找
// 3. 解析后立即释放 soundfont2 内部对象
// 4. 不存储 samples 数组（只保留 sampleIndex），减少内存

import { SoundFont2 } from 'soundfont2';

const OVERRIDING_ROOT_KEY = 58;

export function parseSF2(arrayBuffer, audioContext = null) {
  const buffer = new Uint8Array(arrayBuffer);
  const sf2 = new SoundFont2(buffer);
  
  // 先读取 name，再释放 sf2 对象
  const sf2Name = sf2.metaData?.name || 'Unknown';
  
  const presets = [];
  
  for (const preset of sf2.presets) {
    const presetHeader = preset.header;
    
    // 预建 MIDI 音符到样本的索引映射 (128个音符)
    const sampleIndex = new Array(128).fill(null);
    
    const presetObj = {
      name: presetHeader.name,
      program: presetHeader.preset,
      bank: presetHeader.bank,
      sampleIndex: sampleIndex,
    };
    
    for (const zone of preset.zones || []) {
      const instrument = zone.instrument;
      if (!instrument) continue;
      
      let presetKeyRange = null;
      if (zone.keyRange) {
        presetKeyRange = { low: zone.keyRange.lo, high: zone.keyRange.hi };
      }
      
      for (const instZone of instrument.zones || []) {
        const sample = instZone.sample;
        if (!sample || !sample.header) continue;
        
        const header = sample.header;
        const start = header.start;
        const end = header.end;
        const length = end - start;
        
        if (length <= 0 || length > 10000000) continue;
        
        const sampleRate = header.sampleRate || 44100;
        
        // 获取 rootKey
        let rootKey = header.originalPitch;
        if (instZone.generators && instZone.generators[OVERRIDING_ROOT_KEY]) {
          const overrideGen = instZone.generators[OVERRIDING_ROOT_KEY];
          if (overrideGen.value !== undefined && overrideGen.value !== -1) {
            rootKey = overrideGen.value;
          }
        }
        
        // 获取音高范围
        let keyRange = null;
        if (instZone.keyRange) {
          keyRange = { low: instZone.keyRange.lo, high: instZone.keyRange.hi };
        } else if (presetKeyRange) {
          keyRange = presetKeyRange;
        }
        
        // 存储原始 Int16 PCM 数据（不预创建 AudioBuffer）
        // 这样内存占用减半：Int16 (2 bytes/sample) vs Float32 (4 bytes/sample)
        const sampleData = sample.data;
        const pcmData = new Int16Array(length);
        for (let i = 0; i < length; i++) {
          pcmData[i] = sampleData[i];
        }
        
        // 轻量样本对象 - 存储原始 PCM 数据，延迟创建 AudioBuffer
        const sampleObj = {
          rootKey: rootKey,
          pitchCorrection: header.pitchCorrection || 0,
          pcmData: pcmData, // 原始 Int16 数据
          sampleRate: sampleRate,
          audioBuffer: null, // 延迟创建的 AudioBuffer 缓存
        };
        
        // 预建索引：为 keyRange 内的每个 MIDI 音符建立映射
        if (keyRange) {
          const low = Math.max(0, keyRange.low);
          const high = Math.min(127, keyRange.high);
          for (let midi = low; midi <= high; midi++) {
            const existing = sampleIndex[midi];
            if (!existing) {
              sampleIndex[midi] = sampleObj;
            } else {
              const existingDist = Math.abs(existing.rootKey - midi);
              const currentDist = Math.abs(rootKey - midi);
              if (currentDist < existingDist) {
                sampleIndex[midi] = sampleObj;
              }
            }
          }
        }
      }
    }
    
    // 只有有有效样本索引的预设才加入
    const hasSamples = sampleIndex.some(s => s !== null);
    if (hasSamples) {
      presets.push(presetObj);
    }
  }
  
  // 立即释放 soundfont2 对象，让 GC 回收所有原始 PCM 数据
  sf2.presets = null;
  sf2.sampleData = null;
  sf2.metaData = null;
  
  return {
    name: sf2Name,
    presets,
  };
}
