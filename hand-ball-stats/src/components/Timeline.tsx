import React from 'react';
import { Game, Team } from '../types';
import { Download } from 'lucide-react';
import { calculatePlayerHPI } from '../services/hpi';

interface TimelineProps {
  game: Game;
  teamA: Team;
  teamB: Team;
  onSeek: (timestamp: number) => void;
}

export const Timeline: React.FC<TimelineProps> = ({ game, teamA, teamB, onSeek }) => {
  const getPlayerName = (teamId: string, playerId: string) => {
    const team = teamId === teamA.id ? teamA : teamB;
    return team?.players.find(p => p.id === playerId)?.name || 'Desconhecido';
  };

  const getTeamColor = (teamId: string) => {
    return teamId === teamA.id ? 'border-blue-500' : 'border-red-500';
  };

  const exportCSV = () => {
    if (game.events.length === 0 && (!game.playerTimeSeconds || Object.keys(game.playerTimeSeconds).length === 0)) {
      alert('Não há dados para exportar.');
      return;
    }

    // Helper to calculate basic HPI to show in the events export or a separate summary
    const formatTime = (seconds: number) => {
      const m = Math.floor(seconds / 60);
      const s = Math.floor(seconds % 60);
      return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const headers = ['Tempo (s)', 'Equipa', 'Jogador', 'Ação', 'Zona Campo', 'Zona Baliza'];
    const rows = game.events.sort((a, b) => a.timestamp - b.timestamp).map(event => {
      const teamName = event.teamId === teamA.id ? teamA.name : teamB.name;
      const playerName = getPlayerName(event.teamId, event.playerId);
      return [
        event.timestamp.toFixed(2),
        `"${teamName}"`,
        `"${playerName}"`,
        `"${event.action}"`,
        event.fieldZone,
        event.goalZone
      ].join(',');
    });

    // Also export a Players Summary with Time and HPI
    const summaryHeaders = ['Equipa', 'Jogador', 'Posição', 'Tempo em Campo', 'Segundos', 'HPI'];
    const summaryRows: string[] = [];

    [teamA, teamB].forEach(team => {
      team.players.forEach(player => {
        const secondsPlayed = game.playerTimeSeconds?.[player.id] || 0;
        const playerHPI = calculatePlayerHPI(player, game.events);

        if (secondsPlayed > 0 || game.events.some(e => e.playerId === player.id)) {
          summaryRows.push([
            `"${team.name}"`,
            `"${player.name}"`,
            `"${player.position || 'N/A'}"`,
            `"${formatTime(secondsPlayed)}"`,
            Math.floor(secondsPlayed),
            playerHPI
          ].join(','));
        }
      });
    });

    const csvContent =
      "--- EVENTOS ---\n" +
      [headers.join(','), ...rows].join('\n') +
      "\n\n--- RESUMO JOGADORES (TEMPO E HPI) ---\n" +
      [summaryHeaders.join(','), ...summaryRows].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `estatisticas_${game.name.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full bg-gray-900 border-l border-gray-700 flex flex-col h-full">
      <div className="p-4 border-b border-gray-700 flex justify-between items-center">
        <h3 className="font-bold text-white">Eventos Registados</h3>
        <button
          onClick={exportCSV}
          className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
          title="Exportar para CSV"
        >
          <Download size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {game.events.sort((a, b) => b.timestamp - a.timestamp).map(event => (
          <div
            key={event.id}
            onClick={() => onSeek(event.timestamp)}
            className={`bg-gray-800 p-3 rounded-lg border-l-4 ${getTeamColor(event.teamId)} cursor-pointer hover:bg-gray-700 transition-colors group`}
          >
            <div className="flex justify-between items-start mb-1">
              <span className="text-xs font-mono text-gray-400 bg-gray-900 px-2 py-0.5 rounded">
                {new Date(event.timestamp * 1000).toISOString().substr(14, 5)}
              </span>
              <span className="text-xs font-bold text-white">{event.action}</span>
            </div>
            <div className="text-sm text-gray-300 font-medium truncate">
              {getPlayerName(event.teamId, event.playerId)}
            </div>
            <div className="text-xs text-gray-500 mt-1 flex gap-2">
              <span>Campo: Z{event.fieldZone}</span>
              <span>Baliza: Z{event.goalZone}</span>
            </div>
          </div>
        ))}

        {game.events.length === 0 && (
          <div className="text-center p-6 text-gray-500 text-sm">
            Nenhum evento registado. Use o botão "Novo Evento" para começar.
          </div>
        )}
      </div>
    </div>
  );
};
