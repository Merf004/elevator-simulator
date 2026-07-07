import { useState, useRef, useCallback, useEffect } from 'react';
import { createElevator, addTarget, tickElevator } from '../logic/elevatorEngine';
import { pickElevatorForCall } from '../logic/dispatcher';
import { DEFAULT_ELEVATOR_COUNT } from '../constants';

const TICK_MS = 50;
const MAX_HISTORY = 40;

export function useElevatorSystem() {
  const [elevatorCount, setElevatorCountState] = useState(DEFAULT_ELEVATOR_COUNT);
  const [elevators, setElevators] = useState(() =>
    Array.from({ length: DEFAULT_ELEVATOR_COUNT }, (_, i) => createElevator(i))
  );
  const [pendingCalls, setPendingCalls] = useState({}); // { [floor]: elevatorId }
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

  // Boucle de simulation principale
  useEffect(() => {
    const id = setInterval(() => {
      if (pausedRef.current) return;
      const dt = TICK_MS * speedRef.current;

      setElevators((prev) => {
        const next = [];
        const arrivedFloors = [];
        const events = [];

        for (const e of prev) {
          const [ne, evs] = tickElevator(e, dt);
          next.push(ne);
          evs.forEach((ev) => {
            events.push(ev);
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

        events.forEach((ev) => {
          if (ev.type === 'arrive') {
            pushHistory(`Ascenseur ${ev.elevatorId + 1} : arrivée à l'étage ${ev.floor === 0 ? 'RDC' : ev.floor}`);
          } else if (ev.type === 'depart') {
            pushHistory(`Ascenseur ${ev.elevatorId + 1} : reprise du trajet depuis l'étage ${ev.floor === 0 ? 'RDC' : ev.floor}`);
          }
        });

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
    pushHistory(`Appel à l'étage ${floor === 0 ? 'RDC' : floor} → assigné à l'ascenseur ${assignedId + 1}`);
  }, [pushHistory]);

  const selectDestination = useCallback((elevatorId, floor) => {
    setElevators((prev) => prev.map((e) => (e.id === elevatorId ? addTarget(e, floor) : e)));
    pushHistory(`Destination ${floor === 0 ? 'RDC' : floor} sélectionnée dans l'ascenseur ${elevatorId + 1}`);
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