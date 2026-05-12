import { Team, Game } from '../types';

const TEAMS_KEY = 'hb_teams';
const GAMES_KEY = 'hb_games';

export const storageService = {
  getTeams: (): Team[] => {
    const data = localStorage.getItem(TEAMS_KEY);
    return data ? JSON.parse(data) : [];
  },

  saveTeam: (team: Team): void => {
    const teams = storageService.getTeams();
    const existingIndex = teams.findIndex(t => t.id === team.id);
    if (existingIndex >= 0) {
      teams[existingIndex] = team;
    } else {
      teams.push(team);
    }
    localStorage.setItem(TEAMS_KEY, JSON.stringify(teams));
  },

  deleteTeam: (id: string): void => {
    const teams = storageService.getTeams().filter(t => t.id !== id);
    localStorage.setItem(TEAMS_KEY, JSON.stringify(teams));
  },

  getGames: (): Game[] => {
    const data = localStorage.getItem(GAMES_KEY);
    return data ? JSON.parse(data) : [];
  },

  getGame: (id: string): Game | undefined => {
    return storageService.getGames().find(g => g.id === id);
  },

  saveGame: (game: Game): void => {
    const games = storageService.getGames();
    const existingIndex = games.findIndex(g => g.id === game.id);
    if (existingIndex >= 0) {
      games[existingIndex] = game;
    } else {
      games.push(game);
    }
    localStorage.setItem(GAMES_KEY, JSON.stringify(games));
  },

  deleteGame: (id: string): void => {
    const games = storageService.getGames().filter(g => g.id !== id);
    localStorage.setItem(GAMES_KEY, JSON.stringify(games));
  }
};
