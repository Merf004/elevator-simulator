import React, { useState, useRef, useEffect } from 'react';
import { ArrowUp, ArrowDown, Minus, Grid3x3 } from 'lucide-react';
import { FLOOR_LABELS, TIMING } from '../constants';

const DIR_ICON = { up: ArrowUp, down: ArrowDown, idle: Minus };

export default function ElevatorCar({ elevator, speed, floorHeight, onSelectDestination }) {
  const [showPanel, setShowPanel] = useState(false);

  // --- Correctif : les portes ne doivent s'animer QUE lorsque la cabine
  // a visuellement fini de glisser jusqu'à l'étage cible, et non dès que
  // l'état logique change. On attend la fin réelle de la transition CSS.
  const [doorsReady, setDoorsReady] = useState(true);
  const prevFloor = useRef(elevator.floor);

  useEffect(() => {
    if (elevator.floor !== prevFloor.current) {
      setDoorsReady(false);
      prevFloor.current = elevator.floor;
    }
  }, [elevator.floor]);

  const handleTransitionEnd = (e) => {
    if (e.propertyName === 'transform') setDoorsReady(true);
  };

  const travelDuration = TIMING.TRAVEL_PER_FLOOR / speed;
  const doorDuration = TIMING.DOOR_OPENING / speed;

  const visualDoorState = doorsReady ? elevator.doorState : 'closed';
  const isOpen = visualDoorState === 'open';
  const DirIcon = DIR_ICON[elevator.direction];

  return (
    <div
      className={`elevator-car dir-${elevator.direction}`}
      style={{
        transform: `translateY(-${elevator.floor * floorHeight}px)`,
        transition: `transform ${travelDuration}ms linear`,
      }}
      onTransitionEnd={handleTransitionEnd}
    >
      <div className="car-topbar">
        <span className="car-id-badge">A{elevator.id + 1}</span>
        <span className="car-floor-led">{FLOOR_LABELS[elevator.floor]}</span>
        <span className={`car-dir-icon dir-${elevator.direction}`}>
          <DirIcon size={12} />
        </span>
      </div>

      <div className="car-doors-frame">
        <div className="car-interior" />
        <div
          className={`door door-left ${visualDoorState}`}
          style={{ '--door-duration': `${doorDuration}ms` }}
        />
        <div
          className={`door door-right ${visualDoorState}`}
          style={{ '--door-duration': `${doorDuration}ms` }}
        />

        {isOpen && (
          <button
            className="cabin-panel-toggle"
            onClick={() => setShowPanel((s) => !s)}
            title="Sélectionner un étage"
          >
            <Grid3x3 size={11} />
          </button>
        )}
      </div>

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