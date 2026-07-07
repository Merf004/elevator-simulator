import React from 'react';
import { Building2 } from 'lucide-react';
import { useElevatorSystem } from './hooks/useElevatorSystem';
import Building from './components/Building';
import ControlBar from './components/ControlBar';
import HistoryPanel from './components/HistoryPanel';
import './App.css';

export default function App() {
  const sys = useElevatorSystem();

  return (
    <div className="app">
      <header className="app-header">
        <h1><Building2 size={26} /> Simulateur d'ascenseur</h1>
        <p>Immeuble de 10 niveaux — Test technique Temi Services</p>
      </header>

      <ControlBar
        isPaused={sys.isPaused}
        onTogglePause={sys.togglePause}
        speed={sys.speed}
        onSpeedChange={sys.setSpeed}
        elevatorCount={sys.elevatorCount}
        onElevatorCountChange={sys.setElevatorCount}
      />

      <main className="main-content">
        <Building
          elevators={sys.elevators}
          pendingCalls={sys.pendingCalls}
          onCall={sys.callElevator}
          onSelectDestination={sys.selectDestination}
          speed={sys.speed}
        />
        <HistoryPanel history={sys.history} />
      </main>
    </div>
  );
}