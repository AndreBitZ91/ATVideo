import React from 'react';
import { Team } from '../types';

interface PlayerTrackerProps {
  teamA: Team;
  teamB: Team;
  onCourtPlayers: Set<string>;
  togglePlayerOnCourt: (playerId: string) => void;
}

export const PlayerTracker: React.FC<PlayerTrackerProps> = ({ teamA, teamB, onCourtPlayers, togglePlayerOnCourt }) => {
  const renderTeam = (team: Team, isTeamA: boolean) => (
    <div className="flex-1 min-w-[200px]">
      <h3 className={`font-bold mb-2 text-sm uppercase tracking-wider ${isTeamA ? 'text-blue-400' : 'text-red-400'}`}>
        {team.name} Em Campo
      </h3>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
        {team.players.map(player => {
          const isOnCourt = onCourtPlayers.has(player.id);
          return (
            <button
              key={player.id}
              onClick={() => togglePlayerOnCourt(player.id)}
              className={`p-2 rounded text-xs font-medium flex flex-col items-center justify-center transition-colors border ${
                isOnCourt
                  ? 'bg-green-600/20 border-green-500 text-green-400 shadow-[0_0_10px_rgba(34,197,94,0.3)]'
                  : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700 hover:border-gray-500'
              }`}
              title={`${player.position || 'Sem posição'} - Clique para ${isOnCourt ? 'remover' : 'adicionar'} ao campo`}
            >
              <span className="text-sm font-bold">{player.number}</span>
              <span className="truncate w-full text-center">{player.name.split(' ')[0]}</span>
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="bg-gray-900 border-t border-gray-700 p-4 flex gap-8 overflow-x-auto">
      {renderTeam(teamA, true)}
      {renderTeam(teamB, false)}
    </div>
  );
};
