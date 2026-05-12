import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Team, Game } from '../types';
import { storageService } from '../services/storage';
import { ArrowLeft } from 'lucide-react';

interface NewGameProps {
  onNavigate: (page: string, params?: Record<string, unknown>) => void;
}

export const NewGame: React.FC<NewGameProps> = ({ onNavigate }) => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [name, setName] = useState('');
  const [teamAId, setTeamAId] = useState('');
  const [teamBId, setTeamBId] = useState('');

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTeams(storageService.getTeams());
  }, []);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !teamAId || !teamBId) return;
    if (teamAId === teamBId) {
      alert('Por favor, selecione equipas diferentes.');
      return;
    }

    const newGame: Game = {
      id: uuidv4(),
      name,
      date: new Date().toISOString(),
      teamAId,
      teamBId,
      events: []
    };

    storageService.saveGame(newGame);
    onNavigate('analysis', { gameId: newGame.id });
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <button onClick={() => onNavigate('dashboard')} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6">
        <ArrowLeft size={20} /> Voltar ao Dashboard
      </button>

      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Criar Novo Jogo</h1>

        {teams.length < 2 ? (
          <div className="p-4 bg-amber-50 text-amber-800 rounded-lg">
            Precisa de ter pelo menos 2 equipas registadas para criar um jogo.
            <button onClick={() => onNavigate('teams')} className="ml-2 font-bold underline">Ir para Equipas</button>
          </div>
        ) : (
          <form onSubmit={handleCreate} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome/Descrição do Jogo</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Ex: Final Torneio Nacional"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Equipa A (Visitada)</label>
                <select
                  required
                  value={teamAId}
                  onChange={e => setTeamAId(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">Selecione...</option>
                  {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Equipa B (Visitante)</label>
                <select
                  required
                  value={teamBId}
                  onChange={e => setTeamBId(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">Selecione...</option>
                  {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-lg"
              >
                Criar Jogo e Iniciar Análise
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
