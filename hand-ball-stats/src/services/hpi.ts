import { EventTag, Player } from '../types';

// Points configuration based on HPI guidelines
// Using provided tables for actions and zones.

export const calculatePlayerHPI = (player: Player, events: EventTag[]): number => {
  let points = 100; // Starting baseline

  events.forEach(event => {
    if (event.playerId !== player.id) return;

    if (player.position === 'Guarda-Redes') {
      points += calculateGoaliePoints(event);
    } else {
      points += calculateFieldPlayerPoints(event);
    }
  });

  return points;
};

const calculateFieldPlayerPoints = (event: EventTag): number => {
  let delta = 0;

  switch (event.action) {
    case 'Golo':
      delta += getGoalPoints(event.fieldZone);
      break;
    case 'Remate Falhado':
      delta += getMissedShotPoints(event.fieldZone);
      break;
    case 'Perda de Bola':
      delta -= 3; // Generic
      break;
    case 'Falta':
      delta -= 1; // Generic
      break;
    case 'Exclusão 2 Min':
      delta -= 4; // Generic
      break;
    // Assist could be added later if action exists
  }

  return delta;
};

const calculateGoaliePoints = (event: EventTag): number => {
  let delta = 0;

  // Goalie points logic from provided table
  if (event.action === 'Defesa') {
    delta += getGoalieSavePoints(event.fieldZone);
  } else if (event.action === 'Golo') {
    // If the event action is "Golo" but assigned to the goalie, it implies they conceded it
    // However, usually goals are assigned to the attacker.
    // For local HPI calculation, if we want to penalize goalie for conceded goal:
    delta += getGoalieConcededPoints(event.fieldZone);
  }

  return delta;
};

/*
Zone Mapping based on the provided table:
Zona 1 - Ponta esquerda (Wing)
Zona 2 - Lado esquerdo 6m (6 metres left/right)
Zona 3 - Centro 6m (6 metre centre)
Zona 4 - Lado direito 6m (6 metres left/right)
Zona 5 - Ponta direita (Wing)
Zona 6 - Lado esquerdo 9m (9 metres left/right)
Zona 7 - Centro 9m (9 metres centre)
Zona 8 - Lado direito 9m (9 metres left/right)
*/

const getGoalPoints = (zone: number): number => {
  switch (zone) {
    case 3: return 6; // 6 metre centre
    case 2: case 4: return 7; // 6 metres left/right
    case 7: return 10; // 9 metres centre
    case 6: case 8: return 10; // 9 metres left/right
    case 1: case 5: return 6; // Wing
    default: return 5; // Unknown
  }
};

const getMissedShotPoints = (zone: number): number => {
  switch (zone) {
    case 3: return -7; // 6 metre centre
    case 2: case 4: return -6; // 6 metres left/right
    case 7: return -4; // 9 metres centre
    case 6: case 8: return -4; // 9 metres left/right
    case 1: case 5: return -7; // Wing
    default: return -8; // Unknown
  }
};

const getGoalieSavePoints = (zone: number): number => {
  switch (zone) {
    case 3: return 8; // 6 metre centre
    case 2: case 4: return 7; // 6 metres left/right
    case 7: return 7; // 9 metres centre
    case 6: case 8: return 7; // 9 metres left/right
    case 1: case 5: return 7; // Wing
    default: return 8; // Unknown
  }
};

const getGoalieConcededPoints = (zone: number): number => {
  switch (zone) {
    case 3: return -2; // 6 metre centre
    case 2: case 4: return -3; // 6 metres left/right
    case 7: return -3; // 9 metres centre
    case 6: case 8: return -3; // 9 metres left/right
    case 1: case 5: return -3; // Wing
    default: return -2; // Unknown
  }
};
