// src/components/TrackPanel.jsx
import React, { useState } from 'react';
import { Icons } from './Icons';

// 完整的 GM 音色列表（0-127，中英文）
const GM_INSTRUMENTS = [
  { id: 0, zh: "大钢琴", en: "Acoustic Grand Piano" },
  { id: 1, zh: "亮音钢琴", en: "Bright Acoustic Piano" },
  { id: 2, zh: "电钢琴", en: "Electric Grand Piano" },
  { id: 3, zh: "酒吧钢琴", en: "Honky-tonk Piano" },
  { id: 4, zh: "电钢琴1", en: "Electric Piano 1" },
  { id: 5, zh: "电钢琴2", en: "Electric Piano 2" },
  { id: 6, zh: "羽管键琴", en: "Harpsichord" },
  { id: 7, zh: "击弦古钢琴", en: "Clavinet" },
  { id: 8, zh: "钢片琴", en: "Celesta" },
  { id: 9, zh: "钟琴", en: "Glockenspiel" },
  { id: 10, zh: "八音盒", en: "Music Box" },
  { id: 11, zh: "颤音琴", en: "Vibraphone" },
  { id: 12, zh: "马林巴", en: "Marimba" },
  { id: 13, zh: "木琴", en: "Xylophone" },
  { id: 14, zh: "管钟", en: "Tubular Bells" },
  { id: 15, zh: "大扬琴", en: "Dulcimer" },
  { id: 16, zh: "拉杆风琴", en: "Drawbar Organ" },
  { id: 17, zh: "敲击风琴", en: "Percussive Organ" },
  { id: 18, zh: "摇滚风琴", en: "Rock Organ" },
  { id: 19, zh: "教堂风琴", en: "Church Organ" },
  { id: 20, zh: "簧风琴", en: "Reed Organ" },
  { id: 21, zh: "手风琴", en: "Accordion" },
  { id: 22, zh: "口琴", en: "Harmonica" },
  { id: 23, zh: "探戈手风琴", en: "Tango Accordion" },
  { id: 24, zh: "尼龙弦吉他", en: "Acoustic Guitar (nylon)" },
  { id: 25, zh: "钢弦吉他", en: "Acoustic Guitar (steel)" },
  { id: 26, zh: "爵士电吉他", en: "Electric Guitar (jazz)" },
  { id: 27, zh: "清音电吉他", en: "Electric Guitar (clean)" },
  { id: 28, zh: "闷音电吉他", en: "Electric Guitar (muted)" },
  { id: 29, zh: "过载吉他", en: "Overdriven Guitar" },
  { id: 30, zh: "失真吉他", en: "Distortion Guitar" },
  { id: 31, zh: "吉他泛音", en: "Guitar Harmonics" },
  { id: 32, zh: "原声贝司", en: "Acoustic Bass" },
  { id: 33, zh: "指弹电贝司", en: "Electric Bass (finger)" },
  { id: 34, zh: "拨片电贝司", en: "Electric Bass (pick)" },
  { id: 35, zh: "无品贝司", en: "Fretless Bass" },
  { id: 36, zh: "掌击贝司1", en: "Slap Bass 1" },
  { id: 37, zh: "掌击贝司2", en: "Slap Bass 2" },
  { id: 38, zh: "合成贝司1", en: "Synth Bass 1" },
  { id: 39, zh: "合成贝司2", en: "Synth Bass 2" },
  { id: 40, zh: "小提琴", en: "Violin" },
  { id: 41, zh: "中提琴", en: "Viola" },
  { id: 42, zh: "大提琴", en: "Cello" },
  { id: 43, zh: "低音提琴", en: "Contrabass" },
  { id: 44, zh: "颤音弦乐", en: "Tremolo Strings" },
  { id: 45, zh: "拨奏弦乐", en: "Pizzicato Strings" },
  { id: 46, zh: "竖琴", en: "Orchestral Harp" },
  { id: 47, zh: "定音鼓", en: "Timpani" },
  { id: 48, zh: "弦乐合奏1", en: "String Ensemble 1" },
  { id: 49, zh: "弦乐合奏2", en: "String Ensemble 2" },
  { id: 50, zh: "合成弦乐1", en: "Synth Strings 1" },
  { id: 51, zh: "合成弦乐2", en: "Synth Strings 2" },
  { id: 52, zh: "唱诗班和声", en: "Choir Aahs" },
  { id: 53, zh: "嘟嘟声", en: "Voice Oohs" },
  { id: 54, zh: "合成人声", en: "Synth Voice" },
  { id: 55, zh: "管弦乐齐奏", en: "Orchestra Hit" },
  { id: 56, zh: "小号", en: "Trumpet" },
  { id: 57, zh: "长号", en: "Trombone" },
  { id: 58, zh: "大号", en: "Tuba" },
  { id: 59, zh: "闷音小号", en: "Muted Trumpet" },
  { id: 60, zh: "圆号", en: "French Horn" },
  { id: 61, zh: "铜管组", en: "Brass Section" },
  { id: 62, zh: "合成铜管1", en: "Synth Brass 1" },
  { id: 63, zh: "合成铜管2", en: "Synth Brass 2" },
  { id: 64, zh: "高音萨克斯", en: "Soprano Sax" },
  { id: 65, zh: "中音萨克斯", en: "Alto Sax" },
  { id: 66, zh: "次中音萨克斯", en: "Tenor Sax" },
  { id: 67, zh: "上低音萨克斯", en: "Baritone Sax" },
  { id: 68, zh: "双簧管", en: "Oboe" },
  { id: 69, zh: "英国管", en: "English Horn" },
  { id: 70, zh: "巴松", en: "Bassoon" },
  { id: 71, zh: "单簧管", en: "Clarinet" },
  { id: 72, zh: "短笛", en: "Piccolo" },
  { id: 73, zh: "长笛", en: "Flute" },
  { id: 74, zh: "竖笛", en: "Recorder" },
  { id: 75, zh: "排笛", en: "Pan Flute" },
  { id: 76, zh: "瓶笛", en: "Blown Bottle" },
  { id: 77, zh: "尺八", en: "Shakuhachi" },
  { id: 78, zh: "口哨", en: "Whistle" },
  { id: 79, zh: "陶笛", en: "Ocarina" },
  { id: 80, zh: "合成主音1 (方波)", en: "Lead 1 (square)" },
  { id: 81, zh: "合成主音2 (锯齿波)", en: "Lead 2 (sawtooth)" },
  { id: 82, zh: "合成主音3 (汽笛)", en: "Lead 3 (calliope)" },
  { id: 83, zh: "合成主音4 (纯音)", en: "Lead 4 (chiff)" },
  { id: 84, zh: "合成主音5 (电吉他)", en: "Lead 5 (charang)" },
  { id: 85, zh: "合成主音6 (人声)", en: "Lead 6 (voice)" },
  { id: 86, zh: "合成主音7 (五度)", en: "Lead 7 (fifths)" },
  { id: 87, zh: "合成主音8 (贝司加主音)", en: "Lead 8 (bass + lead)" },
  { id: 88, zh: "合成音垫1 (新世纪)", en: "Pad 1 (new age)" },
  { id: 89, zh: "合成音垫2 (温暖)", en: "Pad 2 (warm)" },
  { id: 90, zh: "合成音垫3 (复音)", en: "Pad 3 (polysynth)" },
  { id: 91, zh: "合成音垫4 (合唱)", en: "Pad 4 (choir)" },
  { id: 92, zh: "合成音垫5 (弓弦)", en: "Pad 5 (bowed)" },
  { id: 93, zh: "合成音垫6 (金属)", en: "Pad 6 (metallic)" },
  { id: 94, zh: "合成音垫7 (光环)", en: "Pad 7 (halo)" },
  { id: 95, zh: "合成音垫8 (扫频)", en: "Pad 8 (sweep)" },
  { id: 96, zh: "合成效果1 (雨)", en: "FX 1 (rain)" },
  { id: 97, zh: "合成效果2 (音轨)", en: "FX 2 (soundtrack)" },
  { id: 98, zh: "合成效果3 (水晶)", en: "FX 3 (crystal)" },
  { id: 99, zh: "合成效果4 (大气)", en: "FX 4 (atmosphere)" },
  { id: 100, zh: "合成效果5 (明亮)", en: "FX 5 (brightness)" },
  { id: 101, zh: "合成效果6 (小精灵)", en: "FX 6 (goblins)" },
  { id: 102, zh: "合成效果7 (回声)", en: "FX 7 (echoes)" },
  { id: 103, zh: "合成效果8 (科幻)", en: "FX 8 (sci-fi)" },
  { id: 104, zh: "西塔琴", en: "Sitar" },
  { id: 105, zh: "班卓琴", en: "Banjo" },
  { id: 106, zh: "三味线", en: "Shamisen" },
  { id: 107, zh: "琴", en: "Koto" },
  { id: 108, zh: "卡林巴", en: "Kalimba" },
  { id: 109, zh: "风笛", en: "Bagpipe" },
  { id: 110, zh: "提琴", en: "Fiddle" },
  { id: 111, zh: "山奈", en: "Shanai" },
  { id: 112, zh: "铃铛", en: "Tinkle Bell" },
  { id: 113, zh: "阿果果", en: "Agogo" },
  { id: 114, zh: "钢鼓", en: "Steel Drums" },
  { id: 115, zh: "木鱼", en: "Woodblock" },
  { id: 116, zh: "太鼓", en: "Taiko Drum" },
  { id: 117, zh: "旋律鼓", en: "Melodic Tom" },
  { id: 118, zh: "合成鼓", en: "Synth Drum" },
  { id: 119, zh: "镲片反转", en: "Reverse Cymbal" },
  { id: 120, zh: "吉他噪音", en: "Guitar Fret Noise" },
  { id: 121, zh: "呼吸声", en: "Breath Noise" },
  { id: 122, zh: "海浪", en: "Seashore" },
  { id: 123, zh: "鸟鸣", en: "Bird Tweet" },
  { id: 124, zh: "电话铃", en: "Telephone Ring" },
  { id: 125, zh: "直升机", en: "Helicopter" },
  { id: 126, zh: "掌声", en: "Applause" },
  { id: 127, zh: "枪声", en: "Gunshot" }
];

// 乐器选择面板（侧边栏，支持搜索和试听）
const InstrumentSelector = ({ currentProgram, onSelect, onPreview }) => {
  const [search, setSearch] = useState('');
  const filtered = GM_INSTRUMENTS.filter(inst =>
    inst.zh.includes(search) || inst.en.toLowerCase().includes(search.toLowerCase())
  );
  return (
    <div style={{ marginTop: 8, borderTop: '1px solid var(--border)', paddingTop: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 8 }}>
        <Icons.Search />
        <input
          type="text"
          placeholder="搜索乐器"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, fontSize: '0.7rem' }}
        />
      </div>
      <div style={{ maxHeight: 200, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {filtered.map(inst => (
          <div
            key={inst.id}
            onClick={() => onSelect(inst.id)}
            style={{
              padding: '4px 8px',
              background: currentProgram === inst.id ? 'var(--accent)' : 'var(--button-bg)',
              borderRadius: '20px',
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '0.7rem',
            }}
          >
            <span>{inst.id}: {inst.zh} / {inst.en}</span>
            <button
              onClick={(e) => { e.stopPropagation(); onPreview(inst.id); }}
              style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}
            >
              <Icons.Play />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function TrackPanel({
  tracks,
  currentTrackId,
  onSelectTrack,
  onAddTrack,
  onDeleteTrack,
  onUpdateTrack,
  soundSource,
  setSoundSource,
  playNote,
}) {
  const currentTrack = tracks.find(t => t.id === currentTrackId);
  const [showInstrumentPanel, setShowInstrumentPanel] = useState(false);

  const handleProgramChange = (newProgram) => {
    if (currentTrack) {
      onUpdateTrack(currentTrackId, { program: newProgram });
      setShowInstrumentPanel(false);
      // 试听新音色（播放C大调音阶）
      const notes = ['C4','D4','E4','F4','G4','A4','B4','C5'];
      notes.forEach((note, i) => {
        setTimeout(() => playNote(note, 0.3, 80), i * 200);
      });
    }
  };

  const handlePreviewInstrument = (program) => {
    const notes = ['C4','D4','E4','F4','G4','A4','B4','C5'];
    notes.forEach((note, i) => {
      setTimeout(() => playNote(note, 0.3, 80), i * 200);
    });
  };

  return (
    <div className="track-panel">
      <div className="track-header">
        <span>轨道</span>
        <button onClick={onAddTrack}><Icons.Plus /></button>
      </div>
      <div className="track-list">
        {tracks.map(track => (
          <div
            key={track.id}
            className={`track-card ${track.id === currentTrackId ? 'selected' : ''}`}
            onClick={() => onSelectTrack(track.id)}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>{track.name} (P{track.program})</span>
              {track.id !== 1 && (
                <button onClick={(e) => { e.stopPropagation(); onDeleteTrack(track.id); }} style={{ padding: '2px 6px' }}>
                  <Icons.Trash />
                </button>
              )}
            </div>
            <div className="controls-row">
              <Icons.Volume />
              <input
                type="range"
                min="0"
                max="100"
                value={track.volume}
                onChange={e => onUpdateTrack(track.id, { volume: parseInt(e.target.value) })}
                style={{ width: '60px' }}
              />
              <span>{track.volume}%</span>
              <Icons.Pan />
              <input
                type="range"
                min="0"
                max="127"
                value={track.pan}
                onChange={e => onUpdateTrack(track.id, { pan: parseInt(e.target.value) })}
                style={{ width: '60px' }}
              />
              <button onClick={(e) => { e.stopPropagation(); onUpdateTrack(track.id, { mute: !track.mute }); }}>
                {track.mute ? <Icons.Mute /> : <Icons.Unmute />}
              </button>
              <button onClick={(e) => { e.stopPropagation(); setShowInstrumentPanel(!showInstrumentPanel); }}>
                <Icons.Settings />
              </button>
            </div>
            {track.id === currentTrackId && showInstrumentPanel && (
              <InstrumentSelector
                currentProgram={currentTrack.program}
                onSelect={handleProgramChange}
                onPreview={handlePreviewInstrument}
              />
            )}
          </div>
        ))}
      </div>
      <div style={{ padding: 8, borderTop: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span>音色源</span>
          <select value={soundSource} onChange={e => setSoundSource(e.target.value)} style={{ width: '120px' }}>
            <option value="default">默认振荡器</option>
            <option value="network">网络音色库</option>
          </select>
        </div>
      </div>
    </div>
  );
}
