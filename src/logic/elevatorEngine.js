import { TIMING } from '../constants';

export function createElevator(id) {
  return {
    id,
    floor: 0,
    direction: 'idle',
    status: 'idle',
    doorState: 'closed',
    targets: [],
    timer: 0,
  };
}

function sortedInsert(arr, val) {
  if (arr.includes(val)) return arr;
  return [...arr, val].sort((a, b) => a - b);
}

function hasTargetsInDirection(targets, floor, direction) {
  return direction === 'up'
    ? targets.some((t) => t > floor)
    : targets.some((t) => t < floor);
}

function nextDirection(targets, floor) {
  if (targets.some((t) => t > floor)) return 'up';
  if (targets.some((t) => t < floor)) return 'down';
  return 'idle';
}

export function addTarget(elevator, floor) {
  const targets = sortedInsert(elevator.targets, floor);
  let { direction, status, timer } = elevator;

  if (status === 'idle') {
    if (floor === elevator.floor) {
      status = 'doors';
      timer = TIMING.DOOR_OPENING;
      return {
        ...elevator,
        targets: targets.filter((t) => t !== floor),
        direction: 'idle',
        status,
        doorState: 'opening',
        timer,
      };
    }
    direction = floor > elevator.floor ? 'up' : 'down';
    status = 'moving';
    timer = TIMING.TRAVEL_PER_FLOOR;
  }

  return { ...elevator, targets, direction, status, timer };
}

/**
 * Fait avancer un ascenseur de dt millisecondes (déjà ajusté à la vitesse).
 * Algorithme SCAN/LOOK : continue dans sa direction tant qu'il existe des
 * demandes dans cette direction, ne change de sens qu'une fois toutes
 * les demandes de ce sens traitées.
 * Retourne [nouvelEtatAscenseur, evenements[]]
 */
export function tickElevator(elevator, dt) {
  const events = [];
  let e = { ...elevator };
  e.timer -= dt;
  if (e.timer > 0) return [e, events];

  if (e.status === 'moving') {
    e.floor = e.direction === 'up' ? e.floor + 1 : e.floor - 1;

    if (e.targets.includes(e.floor)) {
      e.targets = e.targets.filter((t) => t !== e.floor);
      e.status = 'doors';
      e.doorState = 'opening';
      e.timer = TIMING.DOOR_OPENING;
      events.push({ type: 'arrive', elevatorId: e.id, floor: e.floor });
    } else if (hasTargetsInDirection(e.targets, e.floor, e.direction)) {
      e.timer = TIMING.TRAVEL_PER_FLOOR;
    } else {
      const nd = nextDirection(e.targets, e.floor);
      if (nd === 'idle') {
        e.status = 'idle';
        e.direction = 'idle';
        e.timer = 0;
        events.push({ type: 'idle', elevatorId: e.id, floor: e.floor });
      } else {
        e.direction = nd;
        e.timer = TIMING.TRAVEL_PER_FLOOR;
      }
    }
  } else if (e.status === 'doors') {
    if (e.doorState === 'opening') {
      e.doorState = 'open';
      e.timer = TIMING.DOOR_STAY;
      events.push({ type: 'doors_open', elevatorId: e.id, floor: e.floor });
    } else if (e.doorState === 'open') {
      e.doorState = 'closing';
      e.timer = TIMING.DOOR_CLOSING;
      events.push({ type: 'doors_closing', elevatorId: e.id, floor: e.floor });
    } else if (e.doorState === 'closing') {
      e.doorState = 'closed';
      const nd = nextDirection(e.targets, e.floor);
      if (nd === 'idle') {
        e.status = 'idle';
        e.direction = 'idle';
        e.timer = 0;
        events.push({ type: 'idle', elevatorId: e.id, floor: e.floor });
      } else {
        e.direction = nd;
        e.status = 'moving';
        e.timer = TIMING.TRAVEL_PER_FLOOR;
        events.push({ type: 'depart', elevatorId: e.id, floor: e.floor, direction: nd });
      }
    }
  }

  return [e, events];
}