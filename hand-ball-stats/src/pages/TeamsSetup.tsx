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
  const [viewingTeam, setViewingTeam] = useState<Team | null>(null);

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
    <div className="p-8 max-w-4xl mx-auto h-full flex flex-col overflow-auto">
      <button onClick={() => onNavigate('dashboard')} className="flex items-center gap-2 text-gray-400 hover:text-white mb-6">
        <ArrowLeft size={20} /> Voltar ao Dashboard
      </button>

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Gestão de Equipas</h1>
        {!editingTeam && !viewingTeam && (
          <button onClick={handleCreateTeam} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors">
            <Plus size={20} /> Nova Equipa
          </button>
        )}
      </div>

      {viewingTeam && !editingTeam && (
        <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700">
          <div className="flex justify-between items-start mb-8 border-b border-gray-700 pb-6">
            <div className="flex items-center gap-4">
              {viewingTeam.logoUrl && <img src={viewingTeam.logoUrl} className="w-16 h-16 bg-white rounded object-contain" />}
              <div>
                <h2 className="text-2xl font-bold text-white">{viewingTeam.name}</h2>
                <p className="text-gray-400">{viewingTeam.players.length} jogadores no plantel</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setEditingTeam(viewingTeam)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors font-medium text-sm border border-gray-600"
              >
                Editar Equipa
              </button>
            </div>
          </div>

          <div className="flex justify-between items-center mb-6">
             <h3 className="text-xl font-bold text-white">Plantel</h3>
             <button onClick={() => setEditingTeam(viewingTeam)} className="text-blue-400 hover:bg-gray-700 px-4 py-2 rounded-md text-sm font-medium transition-colors border border-gray-700">
               + Adicionar / Editar Jogadores
             </button>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {viewingTeam.players.map(player => (
              <div key={player.id} className="bg-gray-900 border border-gray-700 rounded-xl p-4 flex flex-col items-center gap-3 relative">
                <div className="w-20 h-20 rounded-full bg-gray-800 border-2 border-gray-600 overflow-hidden flex items-center justify-center">
                  {player.photoUrl ? (
                    <img src={player.photoUrl} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-gray-500 font-bold text-2xl">{player.number}</span>
                  )}
                </div>
                <div className="text-center w-full">
                  <div className="text-white font-bold text-lg truncate">{player.name}</div>
                  <div className="text-blue-400 text-xs font-bold mt-1 uppercase tracking-wider">{player.position || 'Sem Posição'}</div>

                  <div className="mt-3 grid grid-cols-2 gap-1 text-[10px] text-gray-400 bg-gray-800 p-2 rounded-md">
                     <div className="text-left">Altura: <span className="text-gray-200">{player.height || '-'}</span></div>
                     <div className="text-right">Peso: <span className="text-gray-200">{player.weight || '-'}</span></div>
                     <div className="text-left">Mão: <span className="text-gray-200">{player.dominantHand || '-'}</span></div>
                     <div className="text-right">Nº: <span className="text-gray-200">{player.number}</span></div>
                  </div>
                </div>
              </div>
            ))}
            {viewingTeam.players.length === 0 && (
              <div className="col-span-full py-8 text-center text-gray-500 bg-gray-900/50 rounded-xl border border-gray-800">
                Nenhum jogador registado neste plantel.
              </div>
            )}
          </div>
          <div className="mt-8 flex justify-end">
             <button onClick={() => setViewingTeam(null)} className="px-6 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors">
               Fechar Plantel
             </button>
          </div>
        </div>
      )}

      {editingTeam ? (
        <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700">
          <div className="mb-6 flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-400 mb-1">Nome da Equipa</label>
              <input
                type="text"
                value={editingTeam.name}
                onChange={e => setEditingTeam({...editingTeam, name: e.target.value})}
                className="w-full p-2 bg-gray-900 border border-gray-700 rounded-md focus:ring-blue-500 focus:border-blue-500 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Logotipo</label>
              <div className="flex items-center gap-2">
                {editingTeam.logoUrl && <img src={editingTeam.logoUrl} alt="Logo" className="w-10 h-10 object-contain bg-white rounded" />}
                <label className="cursor-pointer bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded-md text-sm font-medium text-white border border-gray-600 transition-colors">
                  {editingTeam.logoUrl ? 'Alterar Logo' : 'Adicionar Logo'}
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, (url) => setEditingTeam({...editingTeam, logoUrl: url}))} />
                </label>
              </div>
            </div>
          </div>

          <div className="mb-4 flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-200">Jogadores</h3>
            <button onClick={addPlayer} className="text-blue-400 hover:bg-gray-700 px-3 py-1 rounded-md text-sm font-medium transition-colors">
              + Adicionar Jogador
            </button>
          </div>

          <div className="space-y-6 mb-8">
            {editingTeam.players.map((player, index) => (
              <div key={player.id} className="bg-gray-900/50 p-4 rounded-lg border border-gray-700 relative">
                <button onClick={() => removePlayer(index)} className="absolute top-2 right-2 text-red-500 hover:bg-red-500/20 p-1 rounded-md transition-colors">
                  <Trash2 size={18} />
                </button>
                <div className="flex gap-4 items-start">
                  <div className="flex flex-col items-center gap-2 w-20">
                    <div className="w-16 h-16 bg-gray-800 rounded-full overflow-hidden flex items-center justify-center border-2 border-gray-600 shadow-sm">
                      {player.photoUrl ? (
                        <img src={player.photoUrl} alt="Foto" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-gray-500 text-xs">Sem Foto</span>
                      )}
                    </div>
                    <label className="cursor-pointer text-[10px] text-blue-400 font-medium hover:text-blue-300 text-center w-full transition-colors">
                      Carregar Foto
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, (url) => updatePlayer(index, 'photoUrl', url))} />
                    </label>
                  </div>

                  <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Nº</label>
                      <input type="text" value={player.number} onChange={e => updatePlayer(index, 'number', e.target.value)} className="w-full p-1.5 bg-gray-800 border border-gray-700 text-white rounded-md text-sm focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Nome do Jogador</label>
                      <input type="text" value={player.name} onChange={e => updatePlayer(index, 'name', e.target.value)} className="w-full p-1.5 bg-gray-800 border border-gray-700 text-white rounded-md text-sm focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Posição</label>
                      <select value={player.position || 'Central'} onChange={e => updatePlayer(index, 'position', e.target.value)} className="w-full p-1.5 bg-gray-800 border border-gray-700 text-white rounded-md text-sm focus:ring-blue-500 focus:border-blue-500">
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
                      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Altura (m)</label>
                      <input type="text" placeholder="Ex: 1.85" value={player.height || ''} onChange={e => updatePlayer(index, 'height', e.target.value)} className="w-full p-1.5 bg-gray-800 border border-gray-700 text-white rounded-md text-sm focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Peso (kg)</label>
                      <input type="text" placeholder="Ex: 85" value={player.weight || ''} onChange={e => updatePlayer(index, 'weight', e.target.value)} className="w-full p-1.5 bg-gray-800 border border-gray-700 text-white rounded-md text-sm focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Data Nasc.</label>
                      <input type="date" value={player.birthDate || ''} onChange={e => updatePlayer(index, 'birthDate', e.target.value)} className="w-full p-1.5 bg-gray-800 border border-gray-700 text-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Mão Dominante</label>
                      <select value={player.dominantHand || ''} onChange={e => updatePlayer(index, 'dominantHand', e.target.value as 'Direita'|'Esquerda')} className="w-full p-1.5 bg-gray-800 border border-gray-700 text-white rounded-md text-sm focus:ring-blue-500 focus:border-blue-500">
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
              <p className="text-gray-500 text-sm text-center py-4 bg-gray-900/50 rounded-md border border-gray-800">Nenhum jogador adicionado.</p>
            )}
          </div>

          <div className="flex justify-end gap-3 border-t border-gray-700 pt-4">
            <button onClick={() => {
              setEditingTeam(null);
              // if we came from viewing team, stay on viewing team
            }} className="px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors">
              Cancelar
            </button>
            <button onClick={() => {
              handleSaveTeam();
              if (viewingTeam) setViewingTeam(editingTeam);
            }} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500 transition-colors">
              <Save size={20} /> Guardar Equipa
            </button>
          </div>
        </div>
      ) : !viewingTeam && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {teams.map(team => (
            <div key={team.id} className="bg-gray-800 p-5 rounded-xl shadow-lg border border-gray-700 flex justify-between items-center">
              <div className="flex items-center gap-4">
                {team.logoUrl && <img src={team.logoUrl} className="w-12 h-12 bg-white rounded object-contain" />}
                <div>
                  <h3 className="font-semibold text-lg text-white">{team.name}</h3>
                  <p className="text-sm text-gray-400">{team.players.length} jogadores</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setViewingTeam(team)} className="text-blue-400 border border-blue-400/30 hover:bg-blue-900/30 px-3 py-1.5 rounded transition-colors font-medium text-sm">Ver Plantel</button>
                <button onClick={() => setEditingTeam(team)} className="text-gray-300 hover:bg-gray-700 px-3 py-1.5 rounded transition-colors text-sm border border-gray-600">Editar</button>
                <button onClick={() => handleDeleteTeam(team.id)} className="text-red-400 hover:bg-red-500/20 p-2 rounded transition-colors border border-transparent hover:border-red-900/50"><Trash2 size={18} /></button>
              </div>
            </div>
          ))}
          {teams.length === 0 && (
            <div className="col-span-full h-64 flex flex-col items-center justify-center bg-gray-800/50 rounded-xl border-2 border-dashed border-gray-700">
              <p className="text-gray-400 text-lg">Ainda não existem equipas registadas.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
