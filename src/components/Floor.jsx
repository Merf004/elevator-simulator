import React from 'react';

export default function Floor({ label, floorIndex, isPending, onCall }) {
  return (
    <div className="floor-row">
      <span className="floor-label">{label}</span>
      <button
        className={`call-btn ${isPending ? 'pending' : ''}`}
        onClick={() => onCall(floorIndex)}
        disabled={isPending}
        title={isPending ? 'Appel en cours' : "Appeler l'ascenseur"}
      >
        {isPending ? '⏳' : '🔔'}
      </button>
    </div>
  );
}