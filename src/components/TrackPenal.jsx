import React from 'react';

export default function TrackPanel({ tracks, currentTrackId, onSelectTrack, onAddTrack, onDeleteTrack, onVolumeChange, onPanChange, onMuteToggle, onProgramChange }) {
  return (
    <div style={{ background: '#2a2a3a', borderRadius: 8, width: 260, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ padding: 8, fontWeight: 'bold', borderBottom: '1px solid #3a3a4e', display: 'flex', justifyContent: 'space-between' }}>
        <span>Tracks</span>
        <button onClick={onAddTrack} style={{ padding: '2px 8px' }}>+</button>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: 6, display: 'flex', flexDirection: 'column', gap: 6 }}>
        {tracks.map(track => (
          <div
            key={track.id}
            style={{
              background: track.id === currentTrackId ? '#5a6eff' : '#3a3a4e',
              padding: 6,
              borderRadius: 6,
              cursor: 'pointer',
            }}
            onClick={() => onSelectTrack(track.id)}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span>{track.name} ({track.program})</span>
              <span>{track.notes.length}</span>
            </div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap', fontSize: '0.65rem' }}>
              <span>Vol</span>
              <input
                type="range" min="0" max="100" value={track.volume}
                onChange={e => onVolumeChange(track.id, parseInt(e.target.value))}
                style={{ width: 60 }}
              />
              <span>{track.volume}%</span>
              <span>Pan</span>
              <input
                type="range" min="0" max="127" value={track.pan}
                onChange={e => onPanChange(track.id, parseInt(e.target.value))}
                style={{ width: 60 }}
              />
              <span>{track.pan}</span>
              <button onClick={() => onMuteToggle(track.id)} style={{ padding: '2px 6px' }}>
                {track.mute ? '🔇' : '🔊'}
              </button>
              <button onClick={() => onDeleteTrack(track.id)} style={{ padding: '2px 6px' }}>🗑</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
