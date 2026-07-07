import React from 'react';
import { FLOOR_LABELS, FLOOR_COUNT } from '../constants';
import Floor from './Floor';
import ElevatorShaft from './ElevatorShaft';

export default function Building({ elevators, pendingCalls, onCall, onSelectDestination, speed }) {
  const floorsTopDown = Array.from({ length: FLOOR_COUNT }, (_, i) => FLOOR_COUNT - 1 - i);

  return (
    <div className="building">
      <div className="floors-column">
        {floorsTopDown.map((floorIndex) => (
          <Floor
            key={floorIndex}
            label={FLOOR_LABELS[floorIndex]}
            floorIndex={floorIndex}
            isPending={pendingCalls[floorIndex] !== undefined}
            onCall={onCall}
          />
        ))}
      </div>

      <div className="shafts-container">
        {elevators.map((elevator) => (
          <ElevatorShaft
            key={elevator.id}
            elevator={elevator}
            speed={speed}
            onSelectDestination={onSelectDestination}
          />
        ))}
      </div>
    </div>
  );
}