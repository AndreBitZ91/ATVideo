import React, { useState, useEffect } from 'react';
import { Game } from '../types';
import { storageService } from '../services/storage';
import { Play, Plus, Users, Trash2 } from 'lucide-react';

interface DashboardProps {
  onNavigate: (page: string, params?: Record<string, unknown>) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const [games, setGames] = useState<Game[]>([]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setGames(storageService.getGames());
  }, []);

  const handleDeleteGame = (id: string) => {
    if (confirm('Tem a certeza que pretende apagar este jogo?')) {
      storageService.deleteGame(id);
      setGames(storageService.getGames());
    }
  };

  return (
    <div className="p-8 w-full max-w-7xl mx-auto h-full flex flex-col">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Andebol Stats</h1>
        <div className="flex gap-4">
          <button
            onClick={() => onNavigate('teams')}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-gray-200 border border-gray-700 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Users size={20} />
            Gerir Equipas
          </button>
          <button
            onClick={() => onNavigate('new-game')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors"
          >
            <Plus size={20} />
            Novo Jogo
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 flex-1 overflow-auto pb-8">
        {games.map(game => {
          const teamA = storageService.getTeams().find(t => t.id === game.teamAId);
          const teamB = storageService.getTeams().find(t => t.id === game.teamBId);

          return (
            <div key={game.id} className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700 flex flex-col h-full">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-semibold text-xl text-white line-clamp-2" title={game.name}>{game.name}</h3>
                <button onClick={() => handleDeleteGame(game.id)} className="text-red-400 hover:bg-red-500/20 p-1.5 rounded transition-colors shrink-0">
                  <Trash2 size={20} />
                </button>
              </div>
              <p className="text-sm text-gray-400 mb-6">{new Date(game.date).toLocaleDateString()}</p>

              <div className="flex justify-between items-center bg-gray-900 border border-gray-700 p-4 rounded-lg mb-6 flex-1">
                <div className="flex flex-col items-center flex-1 gap-2">
                  {teamA?.logoUrl ? <img src={teamA.logoUrl} className="h-10 w-10 object-contain" /> : <div className="h-10 w-10 bg-gray-800 rounded-full flex items-center justify-center text-xs text-gray-500">Logo</div>}
                  <span className="font-medium truncate w-full text-center text-gray-300 text-sm">{teamA?.name || 'Equipa A'}</span>
                </div>
                <span className="text-gray-500 font-bold mx-2 text-sm">VS</span>
                <div className="flex flex-col items-center flex-1 gap-2">
                  {teamB?.logoUrl ? <img src={teamB.logoUrl} className="h-10 w-10 object-contain" /> : <div className="h-10 w-10 bg-gray-800 rounded-full flex items-center justify-center text-xs text-gray-500">Logo</div>}
                  <span className="font-medium truncate w-full text-center text-gray-300 text-sm">{teamB?.name || 'Equipa B'}</span>
                </div>
              </div>

              <button
                onClick={() => onNavigate('analysis', { gameId: game.id })}
                className="w-full flex justify-center items-center gap-2 px-4 py-3 bg-blue-600/10 border border-blue-600/30 text-blue-400 font-bold rounded-lg hover:bg-blue-600 hover:text-white transition-all mt-auto"
              >
                <Play size={20} fill="currentColor" />
                Analisar Vídeo
              </button>
            </div>
          );
        })}
        {games.length === 0 && (
          <div className="col-span-full h-64 flex flex-col items-center justify-center bg-gray-800/50 rounded-xl border-2 border-dashed border-gray-700">
            <p className="text-gray-400 mb-4 text-lg">Ainda não existem jogos registados.</p>
            <button
              onClick={() => onNavigate('new-game')}
              className="text-blue-400 font-bold hover:underline"
            >
              Criar o primeiro jogo
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
