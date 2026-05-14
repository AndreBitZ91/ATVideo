export type PlayerPosition =
  | 'Guarda-Redes'
  | 'Ponta Esquerda'
  | 'Lateral Esquerdo'
  | 'Central'
  | 'Lateral Direito'
  | 'Ponta Direita'
  | 'Pivot';

export interface Player {
  id: string;
  name: string;
  number: string;
  position?: PlayerPosition;
  photoUrl?: string;
  height?: string;
  weight?: string;
  birthDate?: string;
  dominantHand?: 'Direita' | 'Esquerda';
}

export interface Team {
  id: string;
  name: string;
  logoUrl?: string;
  players: Player[];
}

export type ActionType =
  | 'Golo'
  | 'Remate Falhado'
  | 'Perda de Bola'
  | 'Falta'
  | 'Exclusão 2 Min'
  | 'Defesa';

export interface EventTag {
  id: string;
  timestamp: number; // in seconds
  endTime?: number;  // event end duration
  teamId: string;
  playerId: string;
  action: ActionType;
  fieldZone: number; // 1-8
  goalZone: number; // 1-9 (e.g., 3x3 grid)
  extended?: {
    posicao: string;
    resultado: string;
    turnOver: string;
    conquistas: string;
    fase: string;
    situacao: string;
  };
}

export interface Game {
  id: string;
  name: string;
  date: string;
  videoUrl?: string; // local file path
  teamAId: string;
  teamBId: string;
  events: EventTag[];
  playerTimeSeconds?: Record<string, number>; // playerId -> total seconds played
  firstHalfStart?: number;
  firstHalfEnd?: number;
  secondHalfStart?: number;
  secondHalfEnd?: number;
}
