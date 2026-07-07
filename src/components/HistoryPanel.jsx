import React from 'react';
import { History } from 'lucide-react';

export default function HistoryPanel({ history }) {
  return (
    <aside className="history-panel">
      <h2><History size={16} /> Historique</h2>
      <ul>
        {history.length === 0 && <li className="empty">Aucun mouvement pour l'instant</li>}
        {history.map((entry, i) => (
          <li key={i}>
            <span className="history-time">
              {entry.time.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
            <span className="history-text">{entry.text}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}