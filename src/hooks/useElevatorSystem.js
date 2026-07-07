import { useState, useRef, useCallback, useEffect } from 'react';
import { createElevator, addTarget, tickElevator } from '../logic/elevatorEngine';
import { pickElevatorForCall } from '../logic/dispatcher';
import { DEFAULT_ELEVATOR_COUNT, FLOOR_LABELS } from '../constants';

const TICK_MS = 50;
const MAX_HISTORY = 60;

function eventToText(ev) {
  const floorLabel = FLOOR_LABELS[ev.floor];
  const carLabel = `Ascenseur ${ev.elevatorId + 1}`;

  switch (ev.type) {
    case 'call':
      return `Appel à l'étage ${floorLabel} → assigné à l'ascenseur ${ev.assignedId + 1}`;
    case 'destination':
      return `${carLabel} : destination ${floorLabel} enregistrée`;
    case 'arrive':
      return `${carLabel} : arrivée à l'étage ${floorLabel}`;
    case 'doors_open':
      return `${carLabel} : portes ouvertes (étage ${floorLabel})`;
    case 'doors_closing':
      return `${carLabel} : fermeture des portes (étage ${floorLabel})`;
    case 'depart':
      return `${carLabel} : reprise du trajet vers le ${ev.direction === 'up' ? 'haut' : 'bas'} depuis ${floorLabel}`;
    case 'idle':
      return `${carLabel} : à l'arrêt à l'étage ${floorLabel}`;
    default:
      return `${carLabel} : ${ev.type}`;
  }
}

export function useElevatorSystem() {
  const [elevatorCount, setElevatorCountState] = useState(DEFAULT_ELEVATOR_COUNT);
  const [elevators, setElevators] = useState(() =>
    Array.from({ length: DEFAULT_ELEVATOR_COUNT }, (_, i) => createElevator(i))
  );
  const [pendingCalls, setPendingCalls] = useState({});
  const [history, setHistory] = useState([]);
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState(1);

  const speedRef = useRef(speed);
  const pausedRef = useRef(isPaused);
  const elevatorsRef = useRef(elevators);
  const pendingCallsRef = useRef(pendingCalls);

  useEffect(() => { speedRef.current = speed; }, [speed]);
  useEffect(() => { pausedRef.current = isPaused; }, [isPaused]);
  useEffect(() => { elevatorsRef.current = elevators; }, [elevators]);
  useEffect(() => { pendingCallsRef.current = pendingCalls; }, [pendingCalls]);

  const pushHistory = useCallback((text) => {
    setHistory((h) => [{ text, time: new Date() }, ...h].slice(0, MAX_HISTORY));
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      if (pausedRef.current) return;
      const dt = TICK_MS * speedRef.current;

      setElevators((prev) => {
        const next = [];
        const arrivedFloors = [];
        const allEvents = [];

        for (const e of prev) {
          const [ne, evs] = tickElevator(e, dt);
          next.push(ne);
          evs.forEach((ev) => {
            allEvents.push(ev);
            if (ev.type === 'arrive') arrivedFloors.push(ev.floor);
          });
        }

        if (arrivedFloors.length) {
          setPendingCalls((pc) => {
            const copy = { ...pc };
            arrivedFloors.forEach((f) => delete copy[f]);
            return copy;
          });
        }

        allEvents.forEach((ev) => pushHistory(eventToText(ev)));

        return next;
      });
    }, TICK_MS);

    return () => clearInterval(id);
  }, [pushHistory]);

  const callElevator = useCallback((floor) => {
    if (pendingCallsRef.current[floor] !== undefined) return;
    const assignedId = pickElevatorForCall(elevatorsRef.current, floor);
    setElevators((prev) => prev.map((e) => (e.id === assignedId ? addTarget(e, floor) : e)));
    setPendingCalls((pc) => ({ ...pc, [floor]: assignedId }));
    pushHistory(eventToText({ type: 'call', floor, assignedId, elevatorId: assignedId }));
  }, [pushHistory]);

  const selectDestination = useCallback((elevatorId, floor) => {
    setElevators((prev) => prev.map((e) => (e.id === elevatorId ? addTarget(e, floor) : e)));
    pushHistory(eventToText({ type: 'destination', floor, elevatorId }));
  }, [pushHistory]);

  const setElevatorCount = useCallback((count) => {
    const fresh = Array.from({ length: count }, (_, i) => createElevator(i));
    setElevatorCountState(count);
    setElevators(fresh);
    elevatorsRef.current = fresh;
    setPendingCalls({});
    pendingCallsRef.current = {};
    setHistory([]);
  }, []);

  const togglePause = useCallback(() => setIsPaused((p) => !p), []);

  return {
    elevators,
    pendingCalls,
    history,
    isPaused,
    speed,
    elevatorCount,
    callElevator,
    selectDestination,
    togglePause,
    setSpeed,
    setElevatorCount,
  };
}