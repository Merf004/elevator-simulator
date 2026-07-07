/**
 * Traduit l'état interne d'un ascenseur en un libellé + une "tonalité"
 * utilisée pour l'icône et la couleur dans l'UI.
 */
export function getStatusMeta(elevator) {
  if (elevator.status === 'idle') {
    return { label: "À l'arrêt", tone: 'idle' };
  }

  if (elevator.status === 'moving') {
    return elevator.direction === 'up'
      ? { label: 'En montée', tone: 'up' }
      : { label: 'En descente', tone: 'down' };
  }

  switch (elevator.doorState) {
    case 'opening':
      return { label: 'Ouverture des portes', tone: 'doors' };
    case 'open':
      return { label: 'Portes ouvertes', tone: 'doors' };
    case 'closing':
      return { label: 'Fermeture des portes', tone: 'doors' };
    default:
      return { label: "À l'arrêt", tone: 'idle' };
  }
}