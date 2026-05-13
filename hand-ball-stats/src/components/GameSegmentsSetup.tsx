import React, { useState } from 'react';
import { Game } from '../types';
import { storageService } from '../services/storage';

interface GameSegmentsSetupProps {
  game: Game;
  onComplete: (updatedGame: Game) => void;
  currentTime: number;
}

export const GameSegmentsSetup: React.FC<GameSegmentsSetupProps> = ({ game, onComplete, currentTime }) => {
  const [segments, setSegments] = useState({
    firstHalfStart: game.firstHalfStart,
    firstHalfEnd: game.firstHalfEnd,
    secondHalfStart: game.secondHalfStart,
    secondHalfEnd: game.secondHalfEnd
  });

  const handleCapture = (field: keyof typeof segments) => {
    setSegments(prev => ({ ...prev, [field]: currentTime }));
  };

  const handleSave = () => {
    const updatedGame = { ...game, ...segments };
    storageService.saveGame(updatedGame);
    onComplete(updatedGame);
  };

  const formatTime = (seconds?: number) => {
    if (seconds === undefined) return '--:--';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-xl w-full max-w-lg mt-4">
      <h3 className="text-xl font-bold text-white mb-4">Configurar Tempos de Jogo</h3>
      <p className="text-sm text-gray-400 mb-6">Use o vídeo para capturar os momentos de início e fim de cada parte. Isso garante que o tempo dos jogadores apenas conta quando a bola está em jogo.</p>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
            <div className="text-xs font-bold text-gray-500 uppercase mb-2">1ª Parte - Início</div>
            <div className="flex justify-between items-center">
              <span className="font-mono text-lg">{formatTime(segments.firstHalfStart)}</span>
              <button onClick={() => handleCapture('firstHalfStart')} className="text-xs bg-blue-600 hover:bg-blue-500 px-2 py-1 rounded">Capturar Tempo Atual</button>
            </div>
          </div>
          <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
            <div className="text-xs font-bold text-gray-500 uppercase mb-2">1ª Parte - Fim</div>
            <div className="flex justify-between items-center">
              <span className="font-mono text-lg">{formatTime(segments.firstHalfEnd)}</span>
              <button onClick={() => handleCapture('firstHalfEnd')} className="text-xs bg-blue-600 hover:bg-blue-500 px-2 py-1 rounded">Capturar Tempo Atual</button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
            <div className="text-xs font-bold text-gray-500 uppercase mb-2">2ª Parte - Início</div>
            <div className="flex justify-between items-center">
              <span className="font-mono text-lg">{formatTime(segments.secondHalfStart)}</span>
              <button onClick={() => handleCapture('secondHalfStart')} className="text-xs bg-blue-600 hover:bg-blue-500 px-2 py-1 rounded">Capturar Tempo Atual</button>
            </div>
          </div>
          <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
            <div className="text-xs font-bold text-gray-500 uppercase mb-2">2ª Parte - Fim</div>
            <div className="flex justify-between items-center">
              <span className="font-mono text-lg">{formatTime(segments.secondHalfEnd)}</span>
              <button onClick={() => handleCapture('secondHalfEnd')} className="text-xs bg-blue-600 hover:bg-blue-500 px-2 py-1 rounded">Capturar Tempo Atual</button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <button onClick={() => onComplete(game)} className="px-4 py-2 text-gray-400 hover:text-white">Ignorar / Mais Tarde</button>
        <button onClick={handleSave} className="bg-green-600 hover:bg-green-500 text-white px-6 py-2 rounded-lg font-bold">Guardar Definições</button>
      </div>
    </div>
  );
};
