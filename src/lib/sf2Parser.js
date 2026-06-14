// SF2 (SoundFont2) 音色库文件解析器
// 解析SF2文件的RIFF结构，提取预设和样本数据

export function parseSF2(arrayBuffer) {
  const view = new DataView(arrayBuffer);
  const reader = new RiffReader(view, arrayBuffer);
  
  // 读取RIFF头
  const riffId = reader.readString(4);
  if (riffId !== 'RIFF') throw new Error('Not a valid RIFF file');
  
  const fileSize = reader.readUint32();
  const formType = reader.readString(4);
  if (formType !== 'sfbk') throw new Error('Not a valid SF2 file');
  
  // SF2包含三个主要块: INFO, sdta, pdta
  let infoData = {};
  let sampleDataRaw = null;
  let sampleDataRaw24 = null;
  let presetHeaders = [];
  let presetBags = [];
  let presetMods = [];
  let presetGens = [];
  let instHeaders = [];
  let instBags = [];
  let instMods = [];
  let instGens = [];
  let sampleHeaders = [];
  
  // 读取顶层LIST块
  while (reader.pos < view.byteLength) {
    const chunkId = reader.readString(4);
    const chunkSize = reader.readUint32();
    const chunkStart = reader.pos;
    
    if (chunkId === 'LIST') {
      const listType = reader.readString(4);
      
      if (listType === 'INFO') {
        infoData = parseInfoBlock(reader, chunkStart + chunkSize);
      } else if (listType === 'sdta') {
        // 样本数据
        while (reader.pos < chunkStart + chunkSize) {
          const subId = reader.readString(4);
          const subSize = reader.readUint32();
          const subStart = reader.pos;
          
          if (subId === 'smpl') {
            sampleDataRaw = new Int16Array(arrayBuffer, subStart, Math.floor(subSize / 2));
          } else if (subId === 'sm24') {
            sampleDataRaw24 = new Uint8Array(arrayBuffer, subStart, subSize);
          }
          reader.pos = subStart + subSize;
          if (subSize % 2 !== 0) reader.pos++;
        }
      } else if (listType === 'pdta') {
        parsePdtaBlock(reader, chunkStart + chunkSize, {
          presetHeaders, presetBags, presetMods, presetGens,
          instHeaders, instBags, instMods, instGens,
          sampleHeaders
        });
      }
    }
    
    reader.pos = chunkStart + chunkSize;
    if (chunkSize % 2 !== 0) reader.pos++;
  }
  
  // 构建预设
  const presets = buildPresets(
    presetHeaders, presetBags, presetGens,
    instHeaders, instBags, instGens,
    sampleHeaders, sampleDataRaw
  );
  
  return {
    name: infoData.name || 'Unknown',
    presets
  };
}

function parseInfoBlock(reader, endPos) {
  const info = {};
  while (reader.pos < endPos) {
    const id = reader.readString(4);
    const size = reader.readUint32();
    const start = reader.pos;
    
    if (id === 'ifil') {
      info.version = { major: reader.readUint16(), minor: reader.readUint16() };
    } else if (id === 'INAM') {
      info.name = reader.readString(size).replace(/\0/g, '');
    } else if (id === 'ieng') {
      info.engineer = reader.readString(size).replace(/\0/g, '');
    } else if (id === 'iprd') {
      info.product = reader.readString(size).replace(/\0/g, '');
    } else {
      reader.pos = start + size;
    }
    
    if (reader.pos < start + size) reader.pos = start + size;
    if (size % 2 !== 0) reader.pos++;
  }
  return info;
}

function parsePdtaBlock(reader, endPos, data) {
  while (reader.pos < endPos) {
    const id = reader.readString(4);
    const size = reader.readUint32();
    const start = reader.pos;
    
    switch (id) {
      case 'phdr':
        data.presetHeaders = readPresetHeaders(reader, size);
        break;
      case 'pbag':
        data.presetBags = readBags(reader, size);
        break;
      case 'pmod':
        data.presetMods = readMods(reader, size);
        break;
      case 'pgen':
        data.presetGens = readGens(reader, size);
        break;
      case 'inst':
        data.instHeaders = readInstHeaders(reader, size);
        break;
      case 'ibag':
        data.instBags = readBags(reader, size);
        break;
      case 'imod':
        data.instMods = readMods(reader, size);
        break;
      case 'igen':
        data.instGens = readGens(reader, size);
        break;
      case 'shdr':
        data.sampleHeaders = readSampleHeaders(reader, size);
        break;
      default:
        break;
    }
    
    reader.pos = start + size;
    if (size % 2 !== 0) reader.pos++;
  }
}

function readPresetHeaders(reader, size) {
  const count = Math.floor(size / 38);
  const headers = [];
  for (let i = 0; i < count; i++) {
    headers.push({
      name: reader.readString(20).replace(/\0/g, ''),
      preset: reader.readUint16(),
      bank: reader.readUint16(),
      bagNdx: reader.readUint16(),
      library: reader.readUint32(),
      genre: reader.readUint32(),
      morphology: reader.readUint32(),
    });
  }
  return headers;
}

function readInstHeaders(reader, size) {
  const count = Math.floor(size / 22);
  const headers = [];
  for (let i = 0; i < count; i++) {
    headers.push({
      name: reader.readString(20).replace(/\0/g, ''),
      bagNdx: reader.readUint16(),
    });
  }
  return headers;
}

function readBags(reader, size) {
  const count = Math.floor(size / 4);
  const bags = [];
  for (let i = 0; i < count; i++) {
    bags.push({
      genNdx: reader.readUint16(),
      modNdx: reader.readUint16(),
    });
  }
  return bags;
}

function readMods(reader, size) {
  const count = Math.floor(size / 10);
  const mods = [];
  for (let i = 0; i < count; i++) {
    mods.push({
      srcOper: reader.readUint16(),
      dstOper: reader.readUint16(),
      amount: reader.readInt16(),
      amtSrcOper: reader.readUint16(),
      transOper: reader.readUint16(),
    });
  }
  return mods;
}

function readGens(reader, size) {
  const endPos = reader.pos + size;
  const gens = [];
  while (reader.pos < endPos) {
    const genOper = reader.readUint16();
    // SF2规范: generator amount 是有符号16位整数
    const amount = reader.readInt16();
    gens.push({ genOper, amount });
  }
  return gens;
}

function readSampleHeaders(reader, size) {
  const count = Math.floor(size / 46);
  const headers = [];
  for (let i = 0; i < count; i++) {
    headers.push({
      name: reader.readString(20).replace(/\0/g, ''),
      start: reader.readUint32(),
      end: reader.readUint32(),
      startLoop: reader.readUint32(),
      endLoop: reader.readUint32(),
      sampleRate: reader.readUint32(),
      originalPitch: reader.readUint8(),
      pitchCorrection: reader.readInt8(),
      sampleLink: reader.readUint16(),
      sampleType: reader.readUint16(),
    });
  }
  return headers;
}

// Generator操作码
const GEN_KEYRANGE = 43;
const GEN_VELRANGE = 44;
const GEN_SAMPLEID = 53;

function buildPresets(presetHeaders, presetBags, presetGens, instHeaders, instBags, instGens, sampleHeaders, sampleDataRaw) {
  const presets = [];
  
  for (let pi = 0; pi < presetHeaders.length - 1; pi++) {
    const ph = presetHeaders[pi];
    const preset = {
      name: ph.name,
      program: ph.preset,
      bank: ph.bank,
      zones: [],
      samples: [],
    };
    
    const bagStart = ph.bagNdx;
    const bagEnd = presetHeaders[pi + 1].bagNdx;
    
    if (bagStart >= bagEnd) continue;
    
    // 检查是否有 global zone (第一个 bag 没有 GEN_INST)
    let globalZone = null;
    let firstBagHasInst = false;
    const firstBag = presetBags[bagStart];
    const nextBagForFirst = (bagStart + 1 < presetBags.length) ? presetBags[bagStart + 1] : null;
    const firstGenEnd = nextBagForFirst ? nextBagForFirst.genNdx : presetGens.length;
    
    for (let gi = firstBag.genNdx; gi < firstGenEnd; gi++) {
      const gen = presetGens[gi];
      if (gen && gen.genOper === 41) { // GEN_INST
        firstBagHasInst = true;
        break;
      }
    }
    
    let actualBagStart = bagStart;
    if (!firstBagHasInst) {
      // 第一个 bag 是 global zone
      globalZone = parsePresetZone(firstBag, firstGenEnd, presetGens);
      actualBagStart = bagStart + 1;
    }
    
    for (let bi = actualBagStart; bi < bagEnd; bi++) {
      const bag = presetBags[bi];
      const nextBag = (bi + 1 < presetBags.length) ? presetBags[bi + 1] : null;
      const genEnd = nextBag ? nextBag.genNdx : presetGens.length;
      
      const zone = parsePresetZone(bag, genEnd, presetGens);
      
      // 继承 global zone 的设置
      const instIdx = zone.instIdx >= 0 ? zone.instIdx : (globalZone ? globalZone.instIdx : -1);
      const keyRange = zone.keyRange || (globalZone ? globalZone.keyRange : null);
      const velRange = zone.velRange || (globalZone ? globalZone.velRange : null);
      
      if (instIdx >= 0 && instIdx < instHeaders.length - 1) {
        const inst = instHeaders[instIdx];
        const instBagStart = inst.bagNdx;
        const instBagEnd = instHeaders[instIdx + 1].bagNdx;
        
        if (instBagStart >= instBagEnd) continue;
        
        // 检查 instrument global zone
        let instGlobalZone = null;
        let firstInstBagHasSample = false;
        const firstInstBag = instBags[instBagStart];
        const nextInstBagForFirst = (instBagStart + 1 < instBags.length) ? instBags[instBagStart + 1] : null;
        const firstInstGenEnd = nextInstBagForFirst ? nextInstBagForFirst.genNdx : instGens.length;
        
        for (let gi = firstInstBag.genNdx; gi < firstInstGenEnd; gi++) {
          const gen = instGens[gi];
          if (gen && gen.genOper === GEN_SAMPLEID) {
            firstInstBagHasSample = true;
            break;
          }
        }
        
        let actualInstBagStart = instBagStart;
        if (!firstInstBagHasSample) {
          instGlobalZone = parseInstZone(firstInstBag, firstInstGenEnd, instGens);
          actualInstBagStart = instBagStart + 1;
        }
        
        for (let ibi = actualInstBagStart; ibi < instBagEnd; ibi++) {
          const instBag = instBags[ibi];
          const nextInstBag = (ibi + 1 < instBags.length) ? instBags[ibi + 1] : null;
          const instGenEnd = nextInstBag ? nextInstBag.genNdx : instGens.length;
          
          const instZone = parseInstZone(instBag, instGenEnd, instGens);
          
          // 继承 instrument global zone
          const sampleId = instZone.sampleId >= 0 ? instZone.sampleId : (instGlobalZone ? instGlobalZone.sampleId : -1);
          const iKeyRange = instZone.keyRange || (instGlobalZone ? instGlobalZone.keyRange : keyRange);
          const iVelRange = instZone.velRange || (instGlobalZone ? instGlobalZone.velRange : velRange);
          
          if (sampleId >= 0 && sampleId < sampleHeaders.length) {
            const sh = sampleHeaders[sampleId];
            const sample = extractSample(sh, sampleDataRaw, iKeyRange);
            if (sample) {
              preset.samples.push(sample);
            }
          }
        }
      }
    }
    
    if (preset.samples.length > 0) {
      presets.push(preset);
    }
  }
  
  return presets;
}

function parsePresetZone(bag, genEnd, presetGens) {
  let instIdx = -1;
  let keyRange = null;
  let velRange = null;
  
  for (let gi = bag.genNdx; gi < genEnd; gi++) {
    const gen = presetGens[gi];
    if (!gen) continue;
    if (gen.genOper === 41) { // GEN_INST
      instIdx = gen.amount;
    } else if (gen.genOper === GEN_KEYRANGE) {
      keyRange = { low: gen.amount & 0xFF, high: (gen.amount >> 8) & 0xFF };
    } else if (gen.genOper === GEN_VELRANGE) {
      velRange = { low: gen.amount & 0xFF, high: (gen.amount >> 8) & 0xFF };
    }
  }
  
  return { instIdx, keyRange, velRange };
}

function parseInstZone(bag, genEnd, instGens) {
  let sampleId = -1;
  let keyRange = null;
  let velRange = null;
  
  for (let gi = bag.genNdx; gi < genEnd; gi++) {
    const gen = instGens[gi];
    if (!gen) continue;
    if (gen.genOper === GEN_SAMPLEID) {
      sampleId = gen.amount;
    } else if (gen.genOper === GEN_KEYRANGE) {
      keyRange = { low: gen.amount & 0xFF, high: (gen.amount >> 8) & 0xFF };
    } else if (gen.genOper === GEN_VELRANGE) {
      velRange = { low: gen.amount & 0xFF, high: (gen.amount >> 8) & 0xFF };
    }
  }
  
  return { sampleId, keyRange, velRange };
}

function extractSample(sh, sampleDataRaw, keyRange) {
  if (!sampleDataRaw) return null;
  
  const start = sh.start;
  const end = sh.end;
  const length = end - start;
  
  if (length <= 0 || length > 10000000) return null;
  
  const sampleRate = sh.sampleRate;
  
  // 直接提取 PCM 数据，避免创建 WAV 中间格式
  const pcmData = new Float32Array(length);
  for (let i = 0; i < length; i++) {
    pcmData[i] = sampleDataRaw[start + i] / 32768;
  }
  
  return {
    name: sh.name,
    rootKey: sh.originalPitch,
    pitchCorrection: sh.pitchCorrection,
    sampleRate,
    keyRange,
    pcmData, // 直接返回 Float32 PCM 数据
    buffer: null, // 稍后由 AudioContext 创建
  };
}

// RIFF读取辅助类
class RiffReader {
  constructor(view, buffer) {
    this.view = view;
    this.buffer = buffer;
    this.pos = 0;
  }
  
  readString(length) {
    let str = '';
    for (let i = 0; i < length; i++) {
      const ch = this.view.getUint8(this.pos + i);
      if (ch > 0) str += String.fromCharCode(ch);
    }
    this.pos += length;
    return str;
  }
  
  readUint16() {
    const val = this.view.getUint16(this.pos, true);
    this.pos += 2;
    return val;
  }
  
  readInt16() {
    const val = this.view.getInt16(this.pos, true);
    this.pos += 2;
    return val;
  }
  
  readUint32() {
    const val = this.view.getUint32(this.pos, true);
    this.pos += 4;
    return val;
  }
  
  readInt32() {
    const val = this.view.getInt32(this.pos, true);
    this.pos += 4;
    return val;
  }
  
  readUint8() {
    const val = this.view.getUint8(this.pos);
    this.pos += 1;
    return val;
  }
  
  readInt8() {
    const val = this.view.getInt8(this.pos);
    this.pos += 1;
    return val;
  }
}
