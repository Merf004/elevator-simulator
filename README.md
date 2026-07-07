#  Simulateur d'ascenseur

Application web simulant le fonctionnement d'un ascenseur (ou de plusieurs) desservant un immeuble de 10 étages, réalisée dans le cadre du test technique **Temi Services**.

##  Installation et lancement

```bash
git clone <url-du-repo>
cd elevator-simulator
npm install
npm run dev
```

L'application est ensuite accessible sur `http://localhost:5173`.

Pour une build de production :
```bash
npm run build
npm run preview
```

##  Choix techniques

- **React 18 + Vite** : environnement de développement rapide, HMR instantané, pas de configuration superflue.
- **Aucune librairie de state management externe** : le state est géré via un hook custom (`useElevatorSystem`) combinant `useState`/`useRef`/`useEffect`. Le projet est suffisamment contenu pour ne pas justifier Redux/Zustand.
- **lucide-react** : bibliothèque d'icônes légère et cohérente, utilisée à la place d'émojis pour une interface plus professionnelle.
- **Moteur de simulation découplé de React** (`src/logic/`) : la logique métier (machine à états de l'ascenseur, algorithme de répartition des appels) est écrite en JavaScript pur, sans dépendance à React. Elle est donc testable unitairement de façon isolée et réutilisable.
- **CSS pur** (pas de framework CSS) : pour un contrôle fin des animations (portes, déplacement de cabine) et un design personnalisé.

##  Architecture du projet

src/
├── constants.js              # Constantes globales (étages, durées, vitesses)
├── logic/
│   ├── elevatorEngine.js     # Machine à états d'un ascenseur (pure, sans React)
│   ├── dispatcher.js         # Algorithme d'assignation d'un appel au meilleur ascenseur
│   └── statusLabels.js       # Traduction état interne -> libellé/icône affichés
├── hooks/
│   └── useElevatorSystem.js  # Hook orchestrant la simulation (tick, historique, pause, vitesse)
└── components/
├── Building.jsx          # Layout global : colonne d'étages + cages d'ascenseur
├── Floor.jsx              # Un étage avec son bouton d'appel
├── ElevatorShaft.jsx       # Une cage d'ascenseur (gaine + badge d'état + cabine)
├── ElevatorCar.jsx         # La cabine animée (portes, LED d'étage, panneau de sélection)
├── ElevatorStatusBadge.jsx # Badge affichant l'état courant de chaque ascenseur
├── ControlBar.jsx          # Pause/vitesse/nombre d'ascenseurs
└── HistoryPanel.jsx        # Historique des mouvements

### Séparation des responsabilités

- **`logic/`** : contient uniquement de la logique pure (fonctions sans effet de bord, sans JSX). C'est le cœur métier testable indépendamment de l'UI.
- **`hooks/useElevatorSystem.js`** : fait le pont entre la logique pure et React. Gère la boucle de simulation (un `setInterval` qui appelle `tickElevator` à chaque frame), la pause, la vitesse, et transforme les événements du moteur en entrées d'historique lisibles.
- **`components/`** : purement présentation, ne contiennent aucune règle métier (pas de décision "qui doit s'arrêter où" dans les composants).

##  Algorithme de déplacement (SCAN / LOOK)

Chaque ascenseur maintient une liste triée de `targets` (étages à desservir, qu'il s'agisse d'un appel palier ou d'une destination sélectionnée en cabine). À chaque tick :

1. Si l'ascenseur est **en mouvement**, il avance d'un étage dans sa direction courante.
2. S'il existe encore des demandes **dans la même direction**, il continue sans s'arrêter (comportement "ascenseur intelligent" qui évite les allers-retours inutiles).
3. S'il n'y a plus de demande dans le sens courant mais qu'il en existe dans l'autre sens, il change de direction.
4. S'il atteint un étage présent dans sa liste de cibles, il s'arrête, ouvre les portes (`opening` → `open` → `closing` → `closed`), puis repart si une nouvelle cible existe.
5. S'il n'a plus aucune cible, il repasse en état `idle`.

C'est l'algorithme **SCAN (ou "ascenseur")**, qui garantit un ordre de traitement logique et évite les changements de direction prématurés.

##  Algorithme de répartition des appels (dispatcher)

Quand un utilisateur appelle l'ascenseur depuis un étage, `dispatcher.js` choisit le meilleur ascenseur disponible selon un coût :

- Ascenseur **à l'arrêt** : coût = distance en étages.
- Ascenseur **déjà en mouvement et dont le trajet passe par cet étage** (même direction, étage sur le chemin) : coût = distance (il "récupère" l'appel au passage).
- Ascenseur en mouvement mais dans le mauvais sens : coût = distance + pénalité (il devra finir sa course puis faire demi-tour).

L'ascenseur au coût le plus faible est assigné à l'appel.

##  Fonctionnalités implémentées

- Immeuble de 10 étages (RDC → 9e).
- Appel de l'ascenseur depuis n'importe quel étage.
- Sélection de destination en cabine (panneau accessible quand les portes sont ouvertes).
- Gestion de plusieurs appels simultanés, avec algorithme SCAN.
- Ouverture/fermeture automatique des portes avant/après chaque arrêt.
- Animation fluide et **synchronisée** (les portes ne s'ouvrent qu'une fois la cabine réellement arrivée visuellement à l'étage cible, via écoute de la fin de transition CSS).
- Visualisation en temps réel : position, sens de déplacement, portes, appels en attente (avec indicateur d'attente animé).
- **Badge d'état** par ascenseur, mis à jour à chaque étape (à l'arrêt / en montée / en descente / ouverture des portes / portes ouvertes / fermeture des portes).
- **Historique détaillé** de tous les événements (appel, arrivée, ouverture/fermeture de portes, reprise de trajet, mise à l'arrêt).

### Bonus implémentés

- ⏸ Mise en pause et reprise de la simulation.
-  Réglage de la vitesse de simulation (x0.5, x1, x2, x4).
-  Historique des déplacements (60 dernières actions).
-  Gestion de plusieurs ascenseurs simultanés (1 à 3), avec dispatcher intelligent.
-  Algorithme d'optimisation des trajets (SCAN + choix du meilleur ascenseur par coût).

## Limites connues / pistes d'amélioration

- La répartition des appels (dispatcher) est basée sur un calcul de coût simple ; un algorithme plus avancé pourrait anticiper la charge de chaque ascenseur (nombre de cibles déjà en file) plutôt que la seule distance.
- Pas de tests automatisés (unitaires) sur `logic/elevatorEngine.js` et `logic/dispatcher.js` par manque de temps — ce sont pourtant les modules les plus faciles à tester vu qu'ils sont purs.
- Pas de persistance (l'état est perdu au rechargement de la page).
- L'algorithme ne gère pas de priorité "appel d'urgence" ou de capacité maximale de la cabine.
- Accessibilité clavier (navigation au clavier complète, ARIA) pourrait être renforcée.

##  Stack

- React 18 / Vite 5
- lucide-react (icônes)
- CSS natif (pas de framework)