import React from 'react';
import { ArrowUp, ArrowDown, DoorOpen, CircleDot } from 'lucide-react';
import { getStatusMeta } from '../logic/statusLabels';
import { FLOOR_LABELS } from '../constants';

const TONE_ICON = { up: ArrowUp, down: ArrowDown, doors: DoorOpen, idle: CircleDot };

export default function ElevatorStatusBadge({ elevator }) {
  const meta = getStatusMeta(elevator);
  const Icon = TONE_ICON[meta.tone];

  return (
    <div className={`status-badge tone-${meta.tone}`}>
      <Icon size={13} />
      <span className="status-badge-text">
        A{elevator.id + 1} · {FLOOR_LABELS[elevator.floor]} · {meta.label}
      </span>
    </div>
  );
}