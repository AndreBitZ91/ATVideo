import React, { useState } from 'react';
import { EventTag } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { X, RotateCcw } from 'lucide-react';


interface ClassificarLanceProps {
  onSave: (tag: EventTag) => void;
  onCancel: () => void;
  teamName: string;
  teamId: string;
  timestamp: number;
  endTime: number | null;
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
  onSave, onCancel, teamName, teamId, timestamp, endTime
}) => {
  const [posicao, setPosicao] = useState('');
  const [resultado, setResultado] = useState('');
  const [turnOver, setTurnOver] = useState('');
  const [conquistas, setConquistas] = useState('');
  const [fase, setFase] = useState('');
  const [situacao, setSituacao] = useState('');
  const [zonaFinalizacao, setZonaFinalizacao] = useState<number | null>(null);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = (seconds % 60).toFixed(1);
    return `${m.toString().padStart(2, '0')}:${s.padStart(4, '0')}`;
  };

  const handleSave = () => {
    // Only blocking rule is having some minimal data, e.g. at least one category filled
    if (!posicao && !resultado && !turnOver) {
       alert('Selecione pelo menos uma Posição, Resultado ou Turn Over.');
       return;
    }

    const tag: EventTag = {
      id: uuidv4(),
      timestamp,
      endTime: endTime || undefined,
      teamId,
      playerId: '', // We won't strictly enforce individual player tagging in this specific UI per screenshot, or we can add it back if needed
      action: (resultado || turnOver || 'Ação') as EventTag['action'], // Legacy mapping
      fieldZone: zonaFinalizacao || 0,
      goalZone: 0,
      // Adding new custom properties dynamically is difficult with strict TypeScript unless we update EventTag,
      // but let's assume we map these to new properties.
      extended: {
        posicao,
        resultado,
        turnOver,
        conquistas,
        fase,
        situacao
      }
    };
    onSave(tag);
  };


  return (
    <div className="absolute inset-0 bg-[#0f172a] z-50 flex flex-col h-full overflow-hidden text-sm">
      {/* Header */}
      <header className="flex justify-between items-center px-6 py-4 border-b border-gray-800 bg-[#0b1120]">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold text-white">Classificar Lance</h2>
          <button className="flex items-center gap-2 px-3 py-1 rounded-md border border-blue-800 text-blue-400 text-xs font-semibold bg-blue-900/20">
            {teamName} <RotateCcw size={14} />
          </button>
        </div>
        <div className="flex items-center gap-6">
          <span className="text-gray-400 font-mono text-sm tracking-wider">
            {formatTime(timestamp)} - {endTime ? formatTime(endTime) : '--:--'}
          </span>
          <button onClick={onCancel} className="text-gray-400 hover:text-white p-2">
            <X size={24} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">

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

          <section className="bg-[#1e293b]/50 border border-[#334155] rounded-md p-3">
             <h4 className="text-[11px] font-bold text-fuchsia-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                Guarda-Redes Adversário
             </h4>
             <p className="text-xs text-gray-500 italic">Defina 'GR' nas Equipas</p>
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

          <section className="bg-[#1e293b]/50 border border-red-900/30 rounded-md p-3">
             <h4 className="text-[11px] font-bold text-red-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                ⚔ Jogadores Adversários
             </h4>
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
        <div className="w-1/2 p-6 bg-[#0b1120] border-l border-gray-800 flex flex-col">

          <h4 className="text-[11px] font-bold text-yellow-500 uppercase tracking-widest mb-4 flex items-center gap-2">
            ◎ Zona de Finalização
          </h4>

          <div className="w-full relative rounded-lg border border-gray-700 bg-[#1e293b] mb-6 shadow-inner aspect-[2/1] overflow-hidden">
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

          <div className="bg-[#1e293b]/50 border border-gray-800 rounded-md p-3 min-h-[100px] mb-8">
            <textarea
               placeholder="Notas..."
               className="w-full bg-transparent border-none text-gray-300 resize-none focus:ring-0 outline-none text-sm"
            ></textarea>
          </div>

          <div className="mt-auto">
             <button
                onClick={handleSave}
                className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold text-lg transition-colors"
             >
                Guardar Classificação
             </button>
          </div>
        </div>

      </div>
    </div>
  );
};
