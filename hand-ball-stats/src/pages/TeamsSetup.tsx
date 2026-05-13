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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, callback: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          callback(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
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
          <div className="mb-6 flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Equipa</label>
              <input
                type="text"
                value={editingTeam.name}
                onChange={e => setEditingTeam({...editingTeam, name: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Logotipo</label>
              <div className="flex items-center gap-2">
                {editingTeam.logoUrl && <img src={editingTeam.logoUrl} alt="Logo" className="w-10 h-10 object-contain" />}
                <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-md text-sm font-medium text-gray-700 border border-gray-300">
                  {editingTeam.logoUrl ? 'Alterar Logo' : 'Adicionar Logo'}
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, (url) => setEditingTeam({...editingTeam, logoUrl: url}))} />
                </label>
              </div>
            </div>
          </div>

          <div className="mb-4 flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-800">Jogadores</h3>
            <button onClick={addPlayer} className="text-blue-600 hover:bg-blue-50 px-3 py-1 rounded-md text-sm font-medium">
              + Adicionar Jogador
            </button>
          </div>

          <div className="space-y-6 mb-8">
            {editingTeam.players.map((player, index) => (
              <div key={player.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200 relative">
                <button onClick={() => removePlayer(index)} className="absolute top-2 right-2 text-red-500 hover:bg-red-50 p-1 rounded-md">
                  <Trash2 size={18} />
                </button>
                <div className="flex gap-4 items-start">
                  <div className="flex flex-col items-center gap-2 w-20">
                    <div className="w-16 h-16 bg-gray-200 rounded-full overflow-hidden flex items-center justify-center border-2 border-white shadow-sm">
                      {player.photoUrl ? (
                        <img src={player.photoUrl} alt="Foto" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-gray-400 text-xs">Sem Foto</span>
                      )}
                    </div>
                    <label className="cursor-pointer text-[10px] text-blue-600 font-medium hover:underline text-center w-full">
                      Carregar Foto
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, (url) => updatePlayer(index, 'photoUrl', url))} />
                    </label>
                  </div>

                  <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase">Nº</label>
                      <input type="text" value={player.number} onChange={e => updatePlayer(index, 'number', e.target.value)} className="w-full p-1.5 border border-gray-300 rounded-md text-sm" />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-[10px] font-bold text-gray-500 uppercase">Nome do Jogador</label>
                      <input type="text" value={player.name} onChange={e => updatePlayer(index, 'name', e.target.value)} className="w-full p-1.5 border border-gray-300 rounded-md text-sm" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase">Posição</label>
                      <select value={player.position || 'Central'} onChange={e => updatePlayer(index, 'position', e.target.value)} className="w-full p-1.5 border border-gray-300 rounded-md text-sm">
                        <option value="Guarda-Redes">Guarda-Redes</option>
                        <option value="Ponta Esquerda">Ponta Esquerda</option>
                        <option value="Lateral Esquerdo">Lateral Esquerdo</option>
                        <option value="Central">Central</option>
                        <option value="Lateral Direito">Lateral Direito</option>
                        <option value="Ponta Direita">Ponta Direita</option>
                        <option value="Pivot">Pivot</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase">Altura (m)</label>
                      <input type="text" placeholder="Ex: 1.85" value={player.height || ''} onChange={e => updatePlayer(index, 'height', e.target.value)} className="w-full p-1.5 border border-gray-300 rounded-md text-sm" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase">Peso (kg)</label>
                      <input type="text" placeholder="Ex: 85" value={player.weight || ''} onChange={e => updatePlayer(index, 'weight', e.target.value)} className="w-full p-1.5 border border-gray-300 rounded-md text-sm" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase">Data Nasc.</label>
                      <input type="date" value={player.birthDate || ''} onChange={e => updatePlayer(index, 'birthDate', e.target.value)} className="w-full p-1.5 border border-gray-300 rounded-md text-sm" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase">Mão Dominante</label>
                      <select value={player.dominantHand || ''} onChange={e => updatePlayer(index, 'dominantHand', e.target.value as 'Direita'|'Esquerda')} className="w-full p-1.5 border border-gray-300 rounded-md text-sm">
                        <option value="">Selecione...</option>
                        <option value="Direita">Direita</option>
                        <option value="Esquerda">Esquerda</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {editingTeam.players.length === 0 && (
              <p className="text-gray-500 text-sm text-center py-4 bg-gray-50 rounded-md border border-gray-200">Nenhum jogador adicionado.</p>
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
