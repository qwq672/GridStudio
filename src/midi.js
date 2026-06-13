// 完整的 MIDI 解析和生成，支持 Type 0/1，音符、轨道、BPM、元数据
export function midiToNote(midi) {
  const notes = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];
  return notes[midi % 12] + (Math.floor(midi / 12) - 1);
}

export function noteToMidi(pitch) {
  const m = pitch.match(/^([A-G][#b]?)(\d+)$/);
  if (!m) return 60;
  const map = { 'C':0,'C#':1,'Db':1,'D':2,'D#':3,'Eb':3,'E':4,'F':5,'F#':6,'Gb':6,'G':7,'G#':8,'Ab':8,'A':9,'A#':10,'Bb':10,'B':11 };
  return (parseInt(m[2])+1)*12 + map[m[1]];
}

// 解析 MIDI 文件
export async function parseMidiFile(arrayBuffer) {
  const data = new Uint8Array(arrayBuffer);
  let pos = 0;
  // 读头
  if (data[pos] !== 0x4D || data[pos+1] !== 0x54 || data[pos+2] !== 0x68 || data[pos+3] !== 0x64)
    throw new Error("Invalid MIDI header");
  pos += 4;
  const headerLen = (data[pos]<<24)|(data[pos+1]<<16)|(data[pos+2]<<8)|data[pos+3]; pos+=4;
  const format = (data[pos]<<8)|data[pos+1]; pos+=2;
  const numTracks = (data[pos]<<8)|data[pos+1]; pos+=2;
  const division = (data[pos]<<8)|data[pos+1]; pos+=2;
  const ticksPerBeat = division & 0x7FFF;
  if (ticksPerBeat <= 0) throw new Error("Invalid division");
  let tempo = 120; // 默认
  const tracksData = [];
  let globalTitle = "", globalCopyright = "";

  for (let t = 0; t < numTracks; t++) {
    if (data[pos] !== 0x4D || data[pos+1] !== 0x54 || data[pos+2] !== 0x72 || data[pos+3] !== 0x6B)
      throw new Error("Invalid track chunk");
    pos += 4;
    const trackLen = (data[pos]<<24)|(data[pos+1]<<16)|(data[pos+2]<<8)|data[pos+3]; pos+=4;
    const end = pos + trackLen;
    let currentTick = 0;
    let notes = [];
    let prog = 0;
    let channel = 0;
    let trackName = "";
    let noteOnMap = new Map();
    let runningStatus = null;

    while (pos < end) {
      let delta = 0, b;
      do { b = data[pos++]; delta = (delta << 7) | (b & 0x7F); } while (b & 0x80);
      currentTick += delta;
      let event = data[pos++];
      if (event < 0x80) {
        if (runningStatus === null) throw new Error("Running status error");
        event = runningStatus;
        pos--;
      } else runningStatus = event;
      const type = event & 0xF0;
      const chan = event & 0x0F;

      if (event === 0xFF) { // Meta event
        const metaType = data[pos++];
        const len = data[pos++];
        if (metaType === 0x51 && len === 3) { // Tempo
          const tt = (data[pos]<<16)|(data[pos+1]<<8)|data[pos+2];
          tempo = 60000000 / tt;
          pos += 3;
        } else if (metaType === 0x03 && len > 0) { // Track name
          trackName = new TextDecoder().decode(data.slice(pos, pos+len));
          pos += len;
          if (t === 0 && !globalTitle) globalTitle = trackName;
        } else if (metaType === 0x02 && len > 0) { // Copyright
          globalCopyright = new TextDecoder().decode(data.slice(pos, pos+len));
          pos += len;
        } else {
          pos += len;
        }
      } else if (type === 0x80) { // Note Off
        const pitch = data[pos++];
        const vel = data[pos++];
        const key = `${chan}_${pitch}`;
        if (noteOnMap.has(key)) {
          const on = noteOnMap.get(key);
          const startSec = on.tick / ticksPerBeat / (tempo / 60);
          const durSec = (currentTick - on.tick) / ticksPerBeat / (tempo / 60);
          if (durSec > 0) notes.push({ pitch: midiToNote(pitch), startSec, durationSec: durSec, velocity: on.velocity });
          noteOnMap.delete(key);
        }
      } else if (type === 0x90) { // Note On
        const pitch = data[pos++];
        const vel = data[pos++];
        if (vel > 0) {
          noteOnMap.set(`${chan}_${pitch}`, { tick: currentTick, velocity: vel });
        } else {
          const key = `${chan}_${pitch}`;
          if (noteOnMap.has(key)) {
            const on = noteOnMap.get(key);
            const startSec = on.tick / ticksPerBeat / (tempo / 60);
            const durSec = (currentTick - on.tick) / ticksPerBeat / (tempo / 60);
            if (durSec > 0) notes.push({ pitch: midiToNote(pitch), startSec, durationSec: durSec, velocity: on.velocity });
            noteOnMap.delete(key);
          }
        }
      } else if (type === 0xC0) { // Program Change
        prog = data[pos++];
      } else if (type === 0xB0) { // Controller
        pos += 2;
      } else {
        // 跳过其他事件
        if (type === 0xA0 || type === 0xD0) pos += 1;
        else if (type === 0xE0) pos += 2;
        else if (event === 0xF0 || event === 0xF7) {
          let l = 0, lb;
          do { lb = data[pos++]; l = (l << 7) | (lb & 0x7F); } while (lb & 0x80);
          pos += l;
        }
      }
    }
    if (notes.length) {
      tracksData.push({ name: trackName || `Track ${tracksData.length+1}`, program: prog, notes });
    }
  }
  if (tracksData.length === 0) throw new Error("No notes found");
  return { bpm: tempo, tracks: tracksData, title: globalTitle, copyright: globalCopyright };
}

// 生成 MIDI 文件（Type 1）
export function generateMidiFile(tracks, bpm, meta) {
  const ticksPerBeat = 480;
  let events = [];
  events.push({ tick: 0, type: 'tempo', tempo: 60000000 / bpm });
  if (meta.title) events.push({ tick: 0, type: 'meta', metaType: 0x03, data: new TextEncoder().encode(meta.title) });
  if (meta.copyright) events.push({ tick: 0, type: 'meta', metaType: 0x02, data: new TextEncoder().encode(meta.copyright) });

  tracks.forEach((track, idx) => {
    const chan = idx % 16;
    events.push({ tick: 0, type: 'program', channel: chan, program: track.program });
    if (track.name) events.push({ tick: 0, type: 'meta', metaType: 0x03, data: new TextEncoder().encode(track.name) });
    track.notes.forEach(n => {
      const startTick = Math.round(n.startSec * (bpm / 60) * ticksPerBeat);
      const durTick = Math.round(n.durationSec * (bpm / 60) * ticksPerBeat);
      const pitch = noteToMidi(n.pitch);
      events.push({ tick: startTick, type: 'noteOn', channel: chan, pitch, velocity: n.velocity });
      events.push({ tick: startTick + durTick, type: 'noteOff', channel: chan, pitch, velocity: 0 });
    });
  });
  events.sort((a,b) => a.tick - b.tick);
  let maxTick = events.length ? events[events.length-1].tick : 0;
  events.push({ tick: maxTick, type: 'end' });

  function writeVarLen(val) {
    let buf = [];
    buf.push(val & 0x7F);
    val >>= 7;
    while (val > 0) {
      buf.push((val & 0x7F) | 0x80);
      val >>= 7;
    }
    return buf.reverse();
  }

  // 按轨道分离事件（简单按 channel 分组）
  const trackMap = new Map();
  for (let ev of events) {
    let tid = 0;
    if (ev.type === 'program' || ev.type === 'noteOn' || ev.type === 'noteOff') tid = ev.channel;
    else if (ev.type === 'meta') tid = 0;
    if (!trackMap.has(tid)) trackMap.set(tid, []);
    trackMap.get(tid).push(ev);
  }
  const trackBuffers = [];
  for (let [tid, evs] of trackMap) {
    evs.sort((a,b) => a.tick - b.tick);
    let lastTick = 0;
    let buf = [];
    for (let ev of evs) {
      let delta = ev.tick - lastTick;
      if (delta < 0) delta = 0;
      lastTick = ev.tick;
      buf.push(...writeVarLen(delta));
      if (ev.type === 'tempo') {
        buf.push(0xFF, 0x51, 0x03);
        let t = ev.tempo;
        buf.push((t>>16)&0xFF, (t>>8)&0xFF, t&0xFF);
      } else if (ev.type === 'meta') {
        buf.push(0xFF, ev.metaType, ev.data.length, ...ev.data);
      } else if (ev.type === 'program') {
        buf.push(0xC0 | ev.channel, ev.program);
      } else if (ev.type === 'noteOn') {
        buf.push(0x90 | ev.channel, ev.pitch, ev.velocity);
      } else if (ev.type === 'noteOff') {
        buf.push(0x80 | ev.channel, ev.pitch, 0);
      }
    }
    buf.push(0xFF, 0x2F, 0x00);
    trackBuffers.push(new Uint8Array(buf));
  }

  let totalSize = 14;
  for (let buf of trackBuffers) totalSize += 8 + buf.length;
  let file = new ArrayBuffer(totalSize);
  let view = new DataView(file);
  let pos = 0;
  view.setUint32(pos, 0x4D546864); pos+=4;
  view.setUint32(pos, 6); pos+=4;
  view.setUint16(pos, 1); pos+=2;      // Type 1
  view.setUint16(pos, trackBuffers.length); pos+=2;
  view.setUint16(pos, ticksPerBeat); pos+=2;
  for (let buf of trackBuffers) {
    view.setUint32(pos, 0x4D54726B); pos+=4;
    view.setUint32(pos, buf.length); pos+=4;
    for (let i=0; i<buf.length; i++) view.setUint8(pos++, buf[i]);
  }
  return file;
}
