import React from 'react';
import { FLOOR_COUNT } from '../constants';
import ElevatorCar from './ElevatorCar';

const FLOOR_HEIGHT = 70;

export default function ElevatorShaft({ elevator, speed, onSelectDestination }) {
  return (
    <div className="elevator-shaft" style={{ height: FLOOR_COUNT * FLOOR_HEIGHT }}>
      {Array.from({ length: FLOOR_COUNT }).map((_, i) => (
        <div key={i} className="shaft-floor-line" style={{ bottom: i * FLOOR_HEIGHT }} />
      ))}
      <ElevatorCar
        elevator={elevator}
        speed={speed}
        floorHeight={FLOOR_HEIGHT}
        onSelectDestination={onSelectDestination}
      />
    </div>
  );
}