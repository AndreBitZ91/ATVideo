import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Team, Player } from '../types';
import { storageService } from '../services/storage';
import { ArrowLeft, Plus, Trash2, Save } from 'lucide-react';

interface TeamsSetupProps {
  onNavigate: (page: string) => void;
}

export const TeamsSetup: React.FC<TeamsSetupProps> = ({ onNavigate }) => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTeams(storageService.getTeams());
  }, []);

  const handleCreateTeam = () => {
    const newTeam: Team = { id: uuidv4(), name: 'Nova Equipa', players: [] };
    setEditingTeam(newTeam);
  };

  const handleSaveTeam = () => {
    if (editingTeam) {
      storageService.saveTeam(editingTeam);
      setTeams(storageService.getTeams());
      setEditingTeam(null);
    }
  };

  const handleDeleteTeam = (id: string) => {
    if (confirm('Apagar equipa?')) {
      storageService.deleteTeam(id);
      setTeams(storageService.getTeams());
    }
  };

  const addPlayer = () => {
    if (editingTeam) {
      setEditingTeam({
        ...editingTeam,
        players: [...editingTeam.players, { id: uuidv4(), name: '', number: '', position: 'Central' }]
      });
    }
  };

  const updatePlayer = (index: number, field: keyof Player, value: string) => {
    if (editingTeam) {
      const newPlayers = [...editingTeam.players];
      newPlayers[index] = { ...newPlayers[index], [field]: value };
      setEditingTeam({ ...editingTeam, players: newPlayers });
    }
  };

  const removePlayer = (index: number) => {
    if (editingTeam) {
      const newPlayers = [...editingTeam.players];
      newPlayers.splice(index, 1);
      setEditingTeam({ ...editingTeam, players: newPlayers });
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <button onClick={() => onNavigate('dashboard')} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6">
        <ArrowLeft size={20} /> Voltar ao Dashboard
      </button>

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Gestão de Equipas</h1>
        {!editingTeam && (
          <button onClick={handleCreateTeam} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Plus size={20} /> Nova Equipa
          </button>
        )}
      </div>

      {editingTeam ? (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Equipa</label>
            <input
              type="text"
              value={editingTeam.name}
              onChange={e => setEditingTeam({...editingTeam, name: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="mb-4 flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-800">Jogadores</h3>
            <button onClick={addPlayer} className="text-blue-600 hover:bg-blue-50 px-3 py-1 rounded-md text-sm font-medium">
              + Adicionar Jogador
            </button>
          </div>

          <div className="space-y-3 mb-8">
            {editingTeam.players.map((player, index) => (
              <div key={player.id} className="flex gap-4 items-center">
                <input
                  type="text"
                  placeholder="Nº"
                  value={player.number}
                  onChange={e => updatePlayer(index, 'number', e.target.value)}
                  className="w-20 p-2 border border-gray-300 rounded-md"
                />
                <input
                  type="text"
                  placeholder="Nome do Jogador"
                  value={player.name}
                  onChange={e => updatePlayer(index, 'name', e.target.value)}
                  className="flex-1 p-2 border border-gray-300 rounded-md"
                />
                <select
                  value={player.position || 'Central'}
                  onChange={e => updatePlayer(index, 'position', e.target.value)}
                  className="p-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="Guarda-Redes">Guarda-Redes</option>
                  <option value="Ponta Esquerda">Ponta Esquerda</option>
                  <option value="Lateral Esquerdo">Lateral Esquerdo</option>
                  <option value="Central">Central</option>
                  <option value="Lateral Direito">Lateral Direito</option>
                  <option value="Ponta Direita">Ponta Direita</option>
                  <option value="Pivot">Pivot</option>
                </select>
                <button onClick={() => removePlayer(index)} className="text-red-500 hover:bg-red-50 p-2 rounded-md">
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
            {editingTeam.players.length === 0 && (
              <p className="text-gray-500 text-sm text-center py-4 bg-gray-50 rounded-md">Nenhum jogador adicionado.</p>
            )}
          </div>

          <div className="flex justify-end gap-3 border-t pt-4">
            <button onClick={() => setEditingTeam(null)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
              Cancelar
            </button>
            <button onClick={handleSaveTeam} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
              <Save size={20} /> Guardar Equipa
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {teams.map(team => (
            <div key={team.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-lg">{team.name}</h3>
                <p className="text-sm text-gray-500">{team.players.length} jogadores</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setEditingTeam(team)} className="text-blue-600 hover:bg-blue-50 px-3 py-1 rounded">Editar</button>
                <button onClick={() => handleDeleteTeam(team.id)} className="text-red-500 hover:bg-red-50 p-2 rounded"><Trash2 size={18} /></button>
              </div>
            </div>
          ))}
          {teams.length === 0 && (
            <div className="col-span-full text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
              <p className="text-gray-500">Ainda não existem equipas registadas.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
