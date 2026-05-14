import { EventTag, Player } from '../types';

// Points configuration based on HPI guidelines
// Using provided tables for actions and zones.

export const calculatePlayerHPI = (player: Player, events: EventTag[]): number => {
  let points = 100; // Starting baseline

  events.forEach(event => {
    // Check old schema first for backwards compatibility
    const action = event.extended?.resultado || event.extended?.turnOver || event.action;
    const isGoalie = player.position === 'Guarda-Redes' || event.extended?.posicao === 'Guarda-Redes';

    // In the new schema, we might not always have player IDs directly mapped to every action
    // If we have team level stats we can't easily attribute to an individual unless mapped.

    // First, check if this event was directed AT this player acting as the opposing goalie.
    // (e.g. A shot was taken, and this player was the defending goalkeeper)
    if (event.extended?.guardaRedesAdv === player.id) {
      points += calculateGoaliePoints(action, event.fieldZone);
      return; // Handled as defending goalie
    }

    // Otherwise, check if the event was performed BY this player.
    if (event.playerId !== player.id) return;

    // If performed by the player, calculate as the offensive/primary action
    if (isGoalie) {
      points += calculateGoaliePoints(action, event.fieldZone);
    } else {
      points += calculateFieldPlayerPoints(action, event.fieldZone, event.extended?.conquistas);
    }
  });

  return points;
};

const calculateFieldPlayerPoints = (action: string, zone: number, conquistas?: string): number => {
  let delta = 0;

  switch (action) {
    case 'Golo':
      delta += getGoalPoints(zone);
      break;
    case 'Remate Falhado':
    case 'Fora':
    case 'Defesa': // Se o remate foi defendido, conta como falhado para o jogador de campo
      delta += getMissedShotPoints(zone);
      break;
    case 'Perda de Bola':
    case 'Falha Técnica':
    case 'Intercepção':
      delta -= 3; // Generic Turnover penalty
      break;
    case 'Falta':
      delta -= 1; // Generic
      break;
  }

  if (conquistas) {
    if (conquistas.includes('2min')) delta -= 4;
    if (conquistas.includes('7 metros')) delta -= 2;
  }

  return delta;
};

const calculateGoaliePoints = (action: string, zone: number): number => {
  let delta = 0;

  // Goalie points logic from provided table
  if (action === 'Defesa') {
    delta += getGoalieSavePoints(zone);
  } else if (action === 'Golo') {
    delta += getGoalieConcededPoints(zone);
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
