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
    const amount = reader.readUint16();
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
    
    for (let bi = bagStart; bi < bagEnd; bi++) {
      const bag = presetBags[bi];
      const nextBag = (bi + 1 < presetBags.length) ? presetBags[bi + 1] : null;
      const genEnd = nextBag ? nextBag.genNdx : (bi + 1 < presetBags.length ? presetBags[bi + 1].genNdx : presetGens.length);
      
      // 读取preset zone的generator
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
      
      if (instIdx >= 0 && instIdx < instHeaders.length - 1) {
        const inst = instHeaders[instIdx];
        const instBagStart = inst.bagNdx;
        const instBagEnd = instHeaders[instIdx + 1].bagNdx;
        
        for (let ibi = instBagStart; ibi < instBagEnd; ibi++) {
          const instBag = instBags[ibi];
          const nextInstBag = (ibi + 1 < instBags.length) ? instBags[ibi + 1] : null;
          const instGenEnd = nextInstBag ? nextInstBag.genNdx : instGens.length;
          
          let sampleId = -1;
          let iKeyRange = keyRange;
          let iVelRange = velRange;
          
          for (let gi = instBag.genNdx; gi < instGenEnd; gi++) {
            const gen = instGens[gi];
            if (!gen) continue;
            if (gen.genOper === GEN_SAMPLEID) {
              sampleId = gen.amount;
            } else if (gen.genOper === GEN_KEYRANGE) {
              iKeyRange = { low: gen.amount & 0xFF, high: (gen.amount >> 8) & 0xFF };
            } else if (gen.genOper === GEN_VELRANGE) {
              iVelRange = { low: gen.amount & 0xFF, high: (gen.amount >> 8) & 0xFF };
            }
          }
          
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

function extractSample(sh, sampleDataRaw, keyRange) {
  if (!sampleDataRaw) return null;
  
  const start = sh.start;
  const end = sh.end;
  const length = end - start;
  
  if (length <= 0 || length > 10000000) return null;
  
  // 提取16位PCM样本数据并转换为WAV格式的ArrayBuffer
  const sampleRate = sh.sampleRate;
  const numSamples = length;
  
  // 创建WAV文件
  const wavBuffer = createWavBuffer(sampleDataRaw, start, end, sampleRate);
  
  return {
    name: sh.name,
    rootKey: sh.originalPitch,
    pitchCorrection: sh.pitchCorrection,
    sampleRate,
    keyRange,
    audioData: wavBuffer,
    buffer: null, // 稍后由AudioContext解码
  };
}

function createWavBuffer(pcmData, start, end, sampleRate) {
  const numSamples = end - start;
  const bytesPerSample = 2;
  const dataSize = numSamples * bytesPerSample;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);
  
  // RIFF头
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(view, 8, 'WAVE');
  
  // fmt子块
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // chunk size
  view.setUint16(20, 1, true); // PCM format
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * bytesPerSample, true); // byte rate
  view.setUint16(32, bytesPerSample, true); // block align
  view.setUint16(34, 16, true); // bits per sample
  
  // data子块
  writeString(view, 36, 'data');
  view.setUint32(40, dataSize, true);
  
  // 写入样本数据
  for (let i = 0; i < numSamples; i++) {
    view.setInt16(44 + i * 2, pcmData[start + i], true);
  }
  
  return buffer;
}

function writeString(view, offset, str) {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
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
