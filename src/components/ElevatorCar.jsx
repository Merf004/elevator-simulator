import React, { useState } from 'react';
import { FLOOR_LABELS, TIMING } from '../constants';

export default function ElevatorCar({ elevator, speed, floorHeight, onSelectDestination }) {
  const [showPanel, setShowPanel] = useState(false);
  const travelDuration = TIMING.TRAVEL_PER_FLOOR / speed;
  const doorDuration = TIMING.DOOR_OPENING / speed;
  const isOpen = elevator.doorState === 'open';

  return (
    <div
      className={`elevator-car dir-${elevator.direction}`}
      style={{
        transform: `translateY(-${elevator.floor * floorHeight}px)`,
        transition: `transform ${travelDuration}ms linear`,
      }}
    >
      <div className="car-header">
        <span className="car-id">A{elevator.id + 1}</span>
        <span className={`car-arrow ${elevator.direction}`}>
          {elevator.direction === 'up' ? '▲' : elevator.direction === 'down' ? '▼' : '•'}
        </span>
      </div>

      <div className="car-doors">
        <div className={`door door-left ${elevator.doorState}`} style={{ '--door-duration': `${doorDuration}ms` }} />
        <div className={`door door-right ${elevator.doorState}`} style={{ '--door-duration': `${doorDuration}ms` }} />
      </div>

      <div className="car-floor-display">{FLOOR_LABELS[elevator.floor]}</div>

      {isOpen && (
        <button className="cabin-panel-toggle" onClick={() => setShowPanel((s) => !s)}>
          🔢
        </button>
      )}

      {isOpen && showPanel && (
        <div className="cabin-panel">
          {FLOOR_LABELS.map((label, i) => (
            <button
              key={i}
              className="cabin-btn"
              disabled={i === elevator.floor}
              onClick={() => {
                onSelectDestination(elevator.id, i);
                setShowPanel(false);
              }}
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}