import React, { useState, useMemo } from 'react';
import { Game, Team } from '../types';
import { Download, Video, Scissors } from 'lucide-react';
import { calculatePlayerHPI } from '../services/hpi';

interface TimelineProps {
  game: Game;
  teamA: Team;
  teamB: Team;
  onSeek: (timestamp: number) => void;
}

export const Timeline: React.FC<TimelineProps> = ({ game, teamA, teamB, onSeek }) => {
  const [filterTeam, setFilterTeam] = useState<string>('');
  const [filterPlayer, setFilterPlayer] = useState<string>('');
  const [filterAction, setFilterAction] = useState<string>('');

  const getPlayerName = (teamId: string, playerId: string) => {
    const team = teamId === teamA.id ? teamA : teamB;
    return team?.players.find(p => p.id === playerId)?.name || 'Desconhecido';
  };

  const filteredEvents = useMemo(() => {
    return game.events.filter(event => {
      if (filterTeam && event.teamId !== filterTeam) return false;
      if (filterPlayer && event.playerId !== filterPlayer) return false;
      if (filterAction && event.action !== filterAction) return false;
      return true;
    }).sort((a, b) => b.timestamp - a.timestamp);
  }, [game.events, filterTeam, filterPlayer, filterAction]);

  const uniqueActions = useMemo(() => {
    const actions = new Set<string>();
    game.events.forEach(e => {
      if (e.action) actions.add(e.action);
    });
    return Array.from(actions);
  }, [game.events]);

  const getTeamColor = (teamId: string) => {
    return teamId === teamA.id ? 'border-blue-500' : 'border-red-500';
  };

  const [exporting, setExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState({ step: '', progress: 0 });

  const exportVideoClips = async (mode: 'single' | 'separate') => {
    if (filteredEvents.length === 0) return;
    if (!game.videoPath) {
      alert('É necessário voltar a selecionar o ficheiro original de vídeo em "Mudar Vídeo" para que o sistema consiga exportar.');
      return;
    }

    setExporting(true);
    setExportProgress({ step: 'A iniciar...', progress: 0 });

    try {
      // In electron with contextIsolation: false we can use require directly
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { ipcRenderer } = (window as any).require('electron');

      const listener = (_event: unknown, data: { step: string, progress: number }) => {
        setExportProgress(data);
      };

      ipcRenderer.on('export-progress', listener);

      const result = await ipcRenderer.invoke('export-videos', {
        videoPath: game.videoPath,
        events: filteredEvents,
        mode
      });

      ipcRenderer.removeListener('export-progress', listener);

      if (result.status === 'success') {
        alert(`Exportação concluída com sucesso para a pasta:\n${result.targetDir}`);
      }
    } catch (err: unknown) {
      alert(`Erro na exportação: ${String(err)}`);
    } finally {
      setExporting(false);
    }
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

    const headers = ['Início (s)', 'Fim (s)', 'Duração (s)', 'Equipa', 'Jogador', 'Ação', 'Zona Campo', 'Zona Baliza'];
    // Use filtered events for export so the user gets exactly what they searched for
    const eventsToExport = [...filteredEvents].sort((a, b) => a.timestamp - b.timestamp);
    const rows = eventsToExport.map(event => {
      const teamName = event.teamId === teamA.id ? teamA.name : teamB.name;
      const playerName = getPlayerName(event.teamId, event.playerId);
      const endTime = event.endTime !== undefined ? event.endTime.toFixed(2) : '';
      const duration = event.endTime !== undefined ? (event.endTime - event.timestamp).toFixed(2) : '';

      return [
        event.timestamp.toFixed(2),
        endTime,
        duration,
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
      // If filtering by team, skip the other team in the summary
      if (filterTeam && team.id !== filterTeam) return;

      team.players.forEach(player => {
        // If filtering by player, skip others
        if (filterPlayer && player.id !== filterPlayer) return;

        const secondsPlayed = game.playerTimeSeconds?.[player.id] || 0;
        const playerHPI = calculatePlayerHPI(player, game.events);

        if (secondsPlayed > 0 || eventsToExport.some(e => e.playerId === player.id)) {
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
      <div className="p-4 border-b border-gray-700 flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-white">Eventos Registados <span className="text-xs text-gray-500 font-normal ml-2">({filteredEvents.length})</span></h3>
          <div className="flex gap-2">
            <button
              onClick={exportCSV}
              className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors border border-transparent hover:border-gray-600"
              title="Exportar Tabela para CSV"
            >
              <Download size={18} />
            </button>
            <button
              onClick={() => exportVideoClips('single')}
              className="p-1.5 text-blue-400 hover:text-blue-300 hover:bg-blue-900/30 rounded-lg transition-colors border border-transparent hover:border-blue-800/50"
              title="Exportar Vídeos (Único Vídeo)"
              disabled={filteredEvents.length === 0 || exporting}
            >
              <Video size={18} />
            </button>
            <button
              onClick={() => exportVideoClips('separate')}
              className="p-1.5 text-fuchsia-400 hover:text-fuchsia-300 hover:bg-fuchsia-900/30 rounded-lg transition-colors border border-transparent hover:border-fuchsia-800/50"
              title="Exportar Vídeos Separados"
              disabled={filteredEvents.length === 0 || exporting}
            >
              <Scissors size={18} />
            </button>
          </div>
        </div>

        {/* Filters */}
        {exporting && (
          <div className="w-full bg-blue-900/30 border border-blue-500/50 p-3 rounded-lg text-white mb-2 text-xs flex flex-col gap-2">
             <div className="flex justify-between font-bold">
                <span>{exportProgress.step}</span>
                <span>{Math.round(exportProgress.progress)}%</span>
             </div>
             <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
                <div className="bg-blue-500 h-full transition-all duration-300" style={{ width: `${exportProgress.progress}%` }}></div>
             </div>
          </div>
        )}

        <div className="flex gap-2 text-xs">
          <select
            value={filterTeam}
            onChange={e => { setFilterTeam(e.target.value); setFilterPlayer(''); }}
            className="flex-1 bg-gray-800 border border-gray-700 text-gray-200 rounded p-1"
          >
            <option value="">Todas as Equipas</option>
            <option value={teamA.id}>{teamA.name}</option>
            <option value={teamB.id}>{teamB.name}</option>
          </select>
          <select
            value={filterPlayer}
            onChange={e => setFilterPlayer(e.target.value)}
            disabled={!filterTeam}
            className="flex-1 bg-gray-800 border border-gray-700 text-gray-200 rounded p-1 disabled:opacity-50"
          >
            <option value="">Todos os Jogadores</option>
            {filterTeam === teamA.id && teamA.players.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            {filterTeam === teamB.id && teamB.players.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <select
            value={filterAction}
            onChange={e => setFilterAction(e.target.value)}
            className="flex-1 bg-gray-800 border border-gray-700 text-gray-200 rounded p-1"
          >
            <option value="">Todas as Ações</option>
            {uniqueActions.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {filteredEvents.map(event => (
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

        {game.events.length === 0 ? (
          <div className="text-center p-6 text-gray-500 text-sm">
            Nenhum evento registado. Pressione 'Z' e 'X' para começar.
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center p-6 text-gray-500 text-sm">
            Nenhum evento corresponde aos filtros.
          </div>
        ) : null}
      </div>
    </div>
  );
};
