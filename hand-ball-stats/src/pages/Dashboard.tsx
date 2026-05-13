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
        <h1 className="text-3xl font-bold text-gray-800">Andebol Stats</h1>
        <div className="flex gap-4">
          <button
            onClick={() => onNavigate('teams')}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            <Users size={20} />
            Gerir Equipas
          </button>
          <button
            onClick={() => onNavigate('new-game')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus size={20} />
            Novo Jogo
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 flex-1 overflow-auto">
        {games.map(game => {
          const teamA = storageService.getTeams().find(t => t.id === game.teamAId);
          const teamB = storageService.getTeams().find(t => t.id === game.teamBId);

          return (
            <div key={game.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-semibold text-lg text-gray-800">{game.name}</h3>
                <button onClick={() => handleDeleteGame(game.id)} className="text-red-500 hover:bg-red-50 p-1 rounded">
                  <Trash2 size={18} />
                </button>
              </div>
              <p className="text-sm text-gray-500 mb-4">{new Date(game.date).toLocaleDateString()}</p>
              <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg mb-6">
                <span className="font-medium truncate flex-1 text-center">{teamA?.name || 'Equipa A'}</span>
                <span className="text-gray-400 mx-2">vs</span>
                <span className="font-medium truncate flex-1 text-center">{teamB?.name || 'Equipa B'}</span>
              </div>
              <button
                onClick={() => onNavigate('analysis', { gameId: game.id })}
                className="w-full flex justify-center items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors"
              >
                <Play size={20} />
                Analisar Vídeo
              </button>
            </div>
          );
        })}
        {games.length === 0 && (
          <div className="col-span-full text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
            <p className="text-gray-500 mb-4">Ainda não existem jogos registados.</p>
            <button
              onClick={() => onNavigate('new-game')}
              className="text-blue-600 font-medium hover:underline"
            >
              Criar o primeiro jogo
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
