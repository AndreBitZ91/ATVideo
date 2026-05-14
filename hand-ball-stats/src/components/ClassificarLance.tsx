import React, { useState } from 'react';
import { EventTag, Team, Player } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { X, ArrowLeft, Users, UserPlus } from 'lucide-react';
import { GoalZone } from './GoalZone';

interface ClassificarLanceProps {
  onSave: (tag: EventTag) => void;
  onCancel: () => void;
  teamA: Team;
  teamB: Team;
  timestamp: number;
  endTime: number | null;
  onEditPlayers: () => void;
}

const OptionBtn = ({ label, group, setter }: { label: string, group: string, setter: (val: string) => void }) => {
  const isSelected = group === label;
  return (
    <button
      onClick={() => setter(isSelected ? '' : label)}
      className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
        isSelected
          ? 'bg-blue-600/20 border-blue-500 text-blue-400'
          : 'bg-[#1e293b] border-gray-700 text-gray-300 hover:border-gray-500'
      }`}
    >
      {label}
    </button>
  );
};

export const ClassificarLance: React.FC<ClassificarLanceProps> = ({
  onSave, onCancel, teamA, teamB, timestamp, endTime, onEditPlayers
}) => {
  // Step State
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  // Tagging State
  const [posicao, setPosicao] = useState('');
  const [resultado, setResultado] = useState('');
  const [turnOver, setTurnOver] = useState('');
  const [conquistas, setConquistas] = useState('');
  const [fase, setFase] = useState('');
  const [situacao, setSituacao] = useState('');
  const [zonaFinalizacao, setZonaFinalizacao] = useState<number | null>(null);
  const [goalZone, setGoalZone] = useState<number | null>(null);
  const [guardaRedesAdv, setGuardaRedesAdv] = useState('');
  const [jogadorAdv, setJogadorAdv] = useState('');

  const opposingTeam = selectedTeam?.id === teamA.id ? teamB : teamA;
  const opposingGoalies = opposingTeam.players.filter(p => p.position === 'Guarda-Redes');

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = (seconds % 60).toFixed(1);
    return `${m.toString().padStart(2, '0')}:${s.padStart(4, '0')}`;
  };

  const handleSave = () => {
    if (!selectedTeam || !selectedPlayer) return;

    // Only blocking rule is having some minimal data, e.g. at least one category filled
    if (!posicao && !resultado && !turnOver) {
       alert('Selecione pelo menos uma Posição, Resultado ou Turn Over.');
       return;
    }

    const tag: EventTag = {
      id: uuidv4(),
      timestamp,
      endTime: endTime || undefined,
      teamId: selectedTeam.id,
      playerId: selectedPlayer.id,
      action: (resultado || turnOver || 'Ação') as EventTag['action'], // Legacy mapping
      fieldZone: zonaFinalizacao || 0,
      goalZone: goalZone || 0,
      extended: {
        posicao,
        resultado,
        turnOver,
        conquistas,
        fase,
        situacao,
        guardaRedesAdv,
        jogadorAdv
      }
    };
    onSave(tag);
  };

  const proceedToTagging = (team: Team, player: Player) => {
    setSelectedTeam(team);
    setSelectedPlayer(player);

    // Pre-fill position based on player profile
    if (player.position) {
      setPosicao(player.position);
    }
    setStep(2);
  };

  const renderStep1 = () => (
    <div className="flex-1 flex flex-col p-8 overflow-y-auto bg-[#0f172a]">
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-2xl font-bold text-white flex items-center gap-2">
          <Users size={24} className="text-blue-500" />
          Selecione o Jogador
        </h3>
        <button
          onClick={onEditPlayers}
          className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-600 text-gray-200 rounded-lg transition-colors font-medium"
        >
          <UserPlus size={18} />
          Editar Jogadores
        </button>
      </div>

      <div className="grid grid-cols-2 gap-8">
        {/* Team A */}
        <div className="bg-[#1e293b]/50 p-6 rounded-xl border border-gray-800">
          <div className="flex items-center gap-3 mb-6 border-b border-gray-700 pb-4">
            {teamA.logoUrl && <img src={teamA.logoUrl} className="w-10 h-10 object-contain bg-white rounded-md p-1" />}
            <h4 className="text-xl font-bold text-blue-400 uppercase tracking-widest">{teamA.name}</h4>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {teamA.players.map(player => (
              <button
                key={player.id}
                onClick={() => proceedToTagging(teamA, player)}
                className="bg-gray-800 border border-gray-700 hover:border-blue-500 hover:shadow-[0_0_15px_rgba(59,130,246,0.3)] rounded-xl p-4 flex flex-col items-center gap-3 transition-all group"
              >
                <div className="w-16 h-16 rounded-full bg-gray-900 border-2 border-gray-700 overflow-hidden group-hover:border-blue-500 transition-colors flex shrink-0 items-center justify-center">
                  {player.photoUrl ? (
                    <img src={player.photoUrl} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-600 text-xl font-bold">
                      {player.number}
                    </div>
                  )}
                </div>
                <div className="text-center w-full">
                  <div className="text-white font-bold truncate">{player.name.split(' ')[0]}</div>
                  <div className="text-xs text-gray-400 font-mono mt-1">Nº {player.number}</div>
                  <div className="text-[10px] text-blue-400 mt-1 truncate">{player.position || 'Sem Posição'}</div>
                </div>
              </button>
            ))}
            {teamA.players.length === 0 && <div className="col-span-full text-gray-500 text-center py-4">Nenhum jogador configurado.</div>}
          </div>
        </div>

        {/* Team B */}
        <div className="bg-[#1e293b]/50 p-6 rounded-xl border border-gray-800">
          <div className="flex items-center gap-3 mb-6 border-b border-gray-700 pb-4">
            {teamB.logoUrl && <img src={teamB.logoUrl} className="w-10 h-10 object-contain bg-white rounded-md p-1" />}
            <h4 className="text-xl font-bold text-red-400 uppercase tracking-widest">{teamB.name}</h4>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {teamB.players.map(player => (
              <button
                key={player.id}
                onClick={() => proceedToTagging(teamB, player)}
                className="bg-gray-800 border border-gray-700 hover:border-red-500 hover:shadow-[0_0_15px_rgba(239,68,68,0.3)] rounded-xl p-4 flex flex-col items-center gap-3 transition-all group"
              >
                <div className="w-16 h-16 rounded-full bg-gray-900 border-2 border-gray-700 overflow-hidden group-hover:border-red-500 transition-colors flex shrink-0 items-center justify-center">
                  {player.photoUrl ? (
                    <img src={player.photoUrl} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-600 text-xl font-bold">
                      {player.number}
                    </div>
                  )}
                </div>
                <div className="text-center w-full">
                  <div className="text-white font-bold truncate">{player.name.split(' ')[0]}</div>
                  <div className="text-xs text-gray-400 font-mono mt-1">Nº {player.number}</div>
                  <div className="text-[10px] text-red-400 mt-1 truncate">{player.position || 'Sem Posição'}</div>
                </div>
              </button>
            ))}
            {teamB.players.length === 0 && <div className="col-span-full text-gray-500 text-center py-4">Nenhum jogador configurado.</div>}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="absolute inset-0 bg-[#0f172a] z-50 flex flex-col h-full overflow-hidden text-sm">
      {/* Header */}
      <header className="flex justify-between items-center px-6 py-4 border-b border-gray-800 bg-[#0b1120]">
        <div className="flex items-center gap-4">
          {step === 2 && (
            <button onClick={() => setStep(1)} className="text-gray-400 hover:text-white p-2 mr-2">
              <ArrowLeft size={20} />
            </button>
          )}
          <h2 className="text-xl font-bold text-white">Classificar Lance</h2>

          {step === 2 && selectedPlayer && (
            <div className="flex items-center gap-3 ml-4 bg-gray-800 px-3 py-1 rounded-full border border-gray-700">
              {selectedPlayer.photoUrl ? (
                <img src={selectedPlayer.photoUrl} className="w-6 h-6 rounded-full object-cover" />
              ) : (
                <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-[10px] font-bold text-gray-400">{selectedPlayer.number}</div>
              )}
              <span className="text-white font-bold text-sm">{selectedPlayer.name}</span>
              <span className="text-xs text-gray-500 border-l border-gray-600 pl-3 ml-1">{selectedTeam?.name}</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-6">
          <span className="text-gray-400 font-mono text-sm tracking-wider bg-gray-900 px-3 py-1 rounded-md border border-gray-800">
            {formatTime(timestamp)} {endTime ? ` - ${formatTime(endTime)}` : ''}
          </span>
          <button onClick={onCancel} className="text-gray-400 hover:text-white p-2 hover:bg-gray-800 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {step === 1 ? renderStep1() : (
          <>
            {/* Left Column: Categories */}
            <div className="w-1/2 p-6 overflow-y-auto space-y-6">

              <section>
                <h4 className="text-[11px] font-bold text-orange-500 uppercase tracking-widest mb-3">Posição</h4>
                <div className="flex flex-wrap gap-2">
                  <OptionBtn label="Guarda-Redes" group={posicao} setter={setPosicao} />
                  <OptionBtn label="Ponta Esquerda" group={posicao} setter={setPosicao} />
                  <OptionBtn label="Lateral Esquerda" group={posicao} setter={setPosicao} />
                  <OptionBtn label="Central" group={posicao} setter={setPosicao} />
                  <OptionBtn label="Lateral Direita" group={posicao} setter={setPosicao} />
                  <OptionBtn label="Ponta Direita" group={posicao} setter={setPosicao} />
                  <OptionBtn label="Pivot" group={posicao} setter={setPosicao} />
                </div>
              </section>

              <section>
                <h4 className="text-[11px] font-bold text-green-500 uppercase tracking-widest mb-3">Resultado</h4>
                <div className="flex flex-wrap gap-2">
                  <OptionBtn label="Golo" group={resultado} setter={setResultado} />
                  <OptionBtn label="Defesa" group={resultado} setter={setResultado} />
                  <OptionBtn label="Fora" group={resultado} setter={setResultado} />
                  <OptionBtn label="Falta" group={resultado} setter={setResultado} />
                  <OptionBtn label="7 Metros" group={resultado} setter={setResultado} />
                </div>
              </section>

              <section className="bg-[#1e293b]/50 border border-[#334155] rounded-md p-4">
                 <h4 className="text-[11px] font-bold text-fuchsia-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    Guarda-Redes Adversário
                 </h4>
                 {opposingGoalies.length > 0 ? (
                   <div className="flex flex-wrap gap-2">
                     {opposingGoalies.map(gr => (
                       <button
                         key={gr.id}
                         onClick={() => setGuardaRedesAdv(guardaRedesAdv === gr.id ? '' : gr.id)}
                         className={`px-3 py-1.5 rounded-full text-xs font-medium border flex items-center gap-2 transition-colors ${
                           guardaRedesAdv === gr.id
                             ? 'bg-fuchsia-600/20 border-fuchsia-500 text-fuchsia-300'
                             : 'bg-[#0f172a] border-gray-600 text-gray-400 hover:border-gray-400'
                         }`}
                       >
                         <span className="font-bold w-4 h-4 bg-gray-800 rounded-full flex items-center justify-center text-[9px]">{gr.number}</span>
                         {gr.name.split(' ')[0]}
                       </button>
                     ))}
                   </div>
                 ) : (
                   <p className="text-xs text-gray-500 italic">A equipa {opposingTeam.name} não tem Guarda-Redes registados.</p>
                 )}
              </section>

              <section>
                <h4 className="text-[11px] font-bold text-red-500 uppercase tracking-widest mb-3">Turn Over</h4>
                <div className="flex flex-wrap gap-2">
                  <OptionBtn label="Falha Técnica" group={turnOver} setter={setTurnOver} />
                  <OptionBtn label="Intercepção" group={turnOver} setter={setTurnOver} />
                </div>
              </section>

              <section>
                <h4 className="text-[11px] font-bold text-teal-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  🏆 Conquistas
                </h4>
                <div className="flex flex-wrap gap-2">
                  <OptionBtn label="2min" group={conquistas} setter={setConquistas} />
                  <OptionBtn label="7 metros" group={conquistas} setter={setConquistas} />
                  <OptionBtn label="2min + 7 metros" group={conquistas} setter={setConquistas} />
                </div>
              </section>

              <section className="bg-[#1e293b]/50 border border-red-900/30 rounded-md p-4">
                 <h4 className="text-[11px] font-bold text-red-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    ⚔ Jogadores Adversários
                 </h4>
                 {opposingTeam.players.length > 0 ? (
                   <div className="flex flex-wrap gap-2">
                     {opposingTeam.players.filter(p => p.position !== 'Guarda-Redes').map(jogador => (
                       <button
                         key={jogador.id}
                         onClick={() => setJogadorAdv(jogadorAdv === jogador.id ? '' : jogador.id)}
                         className={`px-3 py-1.5 rounded-full text-xs font-medium border flex items-center gap-2 transition-colors ${
                           jogadorAdv === jogador.id
                             ? 'bg-red-600/20 border-red-500 text-red-300'
                             : 'bg-[#0f172a] border-gray-600 text-gray-400 hover:border-gray-400'
                         }`}
                       >
                         <span className="font-bold w-4 h-4 bg-gray-800 rounded-full flex items-center justify-center text-[9px]">{jogador.number}</span>
                         {jogador.name.split(' ')[0]}
                       </button>
                     ))}
                   </div>
                 ) : (
                   <p className="text-xs text-gray-500 italic">Sem jogadores adversários de campo registados.</p>
                 )}
              </section>

              <section>
                <h4 className="text-[11px] font-bold text-blue-500 uppercase tracking-widest mb-3">Fase</h4>
                <div className="flex flex-wrap gap-2">
                  <OptionBtn label="Ofensiva" group={fase} setter={setFase} />
                  <OptionBtn label="Defensiva" group={fase} setter={setFase} />
                  <OptionBtn label="1ª Vaga" group={fase} setter={setFase} />
                  <OptionBtn label="2ª Vaga" group={fase} setter={setFase} />
                  <OptionBtn label="3ª Vaga" group={fase} setter={setFase} />
                  <OptionBtn label="7 metros " group={fase} setter={setFase} />
                </div>
              </section>

              <section>
                <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Situação</h4>
                <div className="flex flex-wrap gap-2">
                  <OptionBtn label="Igualdade" group={situacao} setter={setSituacao} />
                  <OptionBtn label="Superioridade" group={situacao} setter={setSituacao} />
                  <OptionBtn label="Inferioridade" group={situacao} setter={setSituacao} />
                  <OptionBtn label="Igualdade s/GR" group={situacao} setter={setSituacao} />
                  <OptionBtn label="7x6" group={situacao} setter={setSituacao} />
                  <OptionBtn label="Baliza Aberta" group={situacao} setter={setSituacao} />
                </div>
              </section>

            </div>

            {/* Right Column: Zone Map and Save */}
            <div className="w-1/2 p-6 bg-[#0b1120] border-l border-gray-800 flex flex-col overflow-y-auto">

              <h4 className="text-[11px] font-bold text-yellow-500 uppercase tracking-widest mb-4 flex items-center gap-2 shrink-0">
                ◎ Zona de Finalização
              </h4>

              <div className="w-full relative rounded-lg border border-gray-700 bg-[#1e293b] mb-6 shadow-inner aspect-[2/1] overflow-hidden shrink-0">
                 {/* D-Line Arc Background Mockup */}
                 <div className="absolute bottom-0 left-1/2 w-3/4 h-[150%] -translate-x-1/2 border border-gray-600 rounded-t-full opacity-50"></div>

                 {/* Simple Custom Grid matching the image Z1-Z8 */}
                 <div className="absolute inset-0 flex flex-col">
                    <div className="flex-1 border-b border-dashed border-gray-600 flex">
                       <button onClick={() => setZonaFinalizacao(8)} className={`flex-1 border-r border-gray-600 hover:bg-white/5 transition-colors ${zonaFinalizacao === 8 ? 'bg-blue-600/30 text-white' : 'text-gray-400'}`}><span className="font-bold">Z8</span></button>
                       <button onClick={() => setZonaFinalizacao(7)} className={`flex-[1.5] border-r border-gray-600 hover:bg-white/5 transition-colors ${zonaFinalizacao === 7 ? 'bg-blue-600/30 text-white' : 'text-gray-400'}`}><span className="font-bold">Z7</span></button>
                       <button onClick={() => setZonaFinalizacao(6)} className={`flex-1 hover:bg-white/5 transition-colors ${zonaFinalizacao === 6 ? 'bg-blue-600/30 text-white' : 'text-gray-400'}`}><span className="font-bold">Z6</span></button>
                    </div>
                    <div className="flex-1 flex relative">
                       {/* Center Goal Line Marker */}
                       <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-1.5 bg-red-500"></div>

                       <button onClick={() => setZonaFinalizacao(5)} className={`flex-[0.8] border-r border-gray-600 hover:bg-white/5 transition-colors ${zonaFinalizacao === 5 ? 'bg-blue-600/30 text-white' : 'text-gray-400'}`}><span className="font-bold">Z5</span></button>
                       <button onClick={() => setZonaFinalizacao(4)} className={`flex-1 border-r border-gray-600 hover:bg-white/5 transition-colors ${zonaFinalizacao === 4 ? 'bg-blue-600/30 text-white' : 'text-gray-400'}`}><span className="font-bold">Z4</span></button>
                       <button onClick={() => setZonaFinalizacao(3)} className={`flex-[1.5] border-r border-gray-600 hover:bg-white/5 transition-colors ${zonaFinalizacao === 3 ? 'bg-blue-600/30 text-white' : 'text-gray-400'}`}><span className="font-bold">Z3</span></button>
                       <button onClick={() => setZonaFinalizacao(2)} className={`flex-1 border-r border-gray-600 hover:bg-white/5 transition-colors ${zonaFinalizacao === 2 ? 'bg-blue-600/30 text-white' : 'text-gray-400'}`}><span className="font-bold">Z2</span></button>
                       <button onClick={() => setZonaFinalizacao(1)} className={`flex-[0.8] hover:bg-white/5 transition-colors relative ${zonaFinalizacao === 1 ? 'bg-blue-600/30 text-white' : 'text-gray-400'}`}>
                          <span className="font-bold">Z1</span>
                          <span className="absolute bottom-2 right-2 text-[10px] text-gray-500">Ataque ↓</span>
                       </button>
                    </div>
                 </div>
              </div>

              <h4 className="text-[11px] font-bold text-yellow-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                ◎ Zona da Baliza
              </h4>
              <div className="mb-6 shrink-0">
                 <GoalZone selectedZone={goalZone} onSelectZone={setGoalZone} />
              </div>

              <div className="bg-[#1e293b]/50 border border-gray-800 rounded-md p-3 min-h-[80px] mb-6 shrink-0">
                <textarea
                   placeholder="Notas..."
                   className="w-full bg-transparent border-none text-gray-300 resize-none focus:ring-0 outline-none text-sm"
                ></textarea>
              </div>

              <div className="mt-auto shrink-0">
                 <button
                    onClick={handleSave}
                    className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold text-lg transition-colors"
                 >
                    Guardar Classificação
                 </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
