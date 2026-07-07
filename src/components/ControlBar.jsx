import React from 'react';
import { SPEED_OPTIONS, MAX_ELEVATORS } from '../constants';

export default function ControlBar({
  isPaused, onTogglePause,
  speed, onSpeedChange,
  elevatorCount, onElevatorCountChange,
}) {
  return (
    <div className="control-bar">
      <button className={`pause-btn ${isPaused ? 'paused' : ''}`} onClick={onTogglePause}>
        {isPaused ? '▶ Reprendre' : '⏸ Pause'}
      </button>

      <div className="control-group">
        <label>Vitesse</label>
        <div className="btn-group">
          {SPEED_OPTIONS.map((s) => (
            <button
              key={s}
              className={`chip-btn ${speed === s ? 'active' : ''}`}
              onClick={() => onSpeedChange(s)}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>

      <div className="control-group">
        <label>Ascenseurs</label>
        <div className="btn-group">
          {Array.from({ length: MAX_ELEVATORS }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              className={`chip-btn ${elevatorCount === n ? 'active' : ''}`}
              onClick={() => onElevatorCountChange(n)}
            >
              {n}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}