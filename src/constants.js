export const FLOOR_COUNT = 10; // RDC (0) à 9e étage

export const FLOOR_LABELS = Array.from({ length: FLOOR_COUNT }, (_, i) =>
  i === 0 ? 'RDC' : i === 1 ? '1er' : `${i}e`
);

export const TIMING = {
  TRAVEL_PER_FLOOR: 900, // ms pour franchir un étage à vitesse x1
  DOOR_OPENING: 450,
  DOOR_STAY: 1600,
  DOOR_CLOSING: 450,
};

export const SPEED_OPTIONS = [0.5, 1, 2, 4];

export const DEFAULT_ELEVATOR_COUNT = 2;
export const MAX_ELEVATORS = 3;