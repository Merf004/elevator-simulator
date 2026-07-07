/**
 * Choisit le meilleur ascenseur pour desservir un appel palier.
 * Coût faible = ascenseur idle proche, ou ascenseur déjà en route
 * dans la bonne direction et qui passera par cet étage.
 * Coût élevé (pénalité) = ascenseur qui devra finir sa course puis faire demi-tour.
 */
export function pickElevatorForCall(elevators, floor) {
  let best = null;
  let bestCost = Infinity;

  for (const e of elevators) {
    let cost;
    if (e.status === 'idle') {
      cost = Math.abs(e.floor - floor);
    } else if (
      (e.direction === 'up' && floor >= e.floor) ||
      (e.direction === 'down' && floor <= e.floor)
    ) {
      cost = Math.abs(e.floor - floor); // sur le chemin
    } else {
      cost = Math.abs(e.floor - floor) + 10; // pénalité
    }

    if (cost < bestCost) {
      bestCost = cost;
      best = e;
    }
  }

  return best ? best.id : elevators[0].id;
}