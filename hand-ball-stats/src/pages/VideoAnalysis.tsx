import React, { useState, useRef } from 'react';
import { Game, Team, ActionType, EventTag } from '../types';
import { storageService } from '../services/storage';
import { ArrowLeft, Play, Save, X } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { FieldZone } from '../components/FieldZone';
import { GoalZone } from '../components/GoalZone';
import { Timeline } from '../components/Timeline';

interface VideoAnalysisProps {
  gameId: string;
  onNavigate: (page: string) => void;
}

const ACTIONS: ActionType[] = [
  'Golo', 'Remate Falhado', 'Perda de Bola', 'Falta', 'Exclusão 2 Min', 'Defesa'
];

export const VideoAnalysis: React.FC<VideoAnalysisProps> = ({ gameId, onNavigate }) => {
  const [game, setGame] = useState<Game | null>(() => storageService.getGame(gameId) || null);
  const [teamA] = useState<Team | null>(() => {
    const loadedGame = storageService.getGame(gameId);
    return loadedGame ? (storageService.getTeams().find(t => t.id === loadedGame.teamAId) || null) : null;
  });
  const [teamB] = useState<Team | null>(() => {
    const loadedGame = storageService.getGame(gameId);
    return loadedGame ? (storageService.getTeams().find(t => t.id === loadedGame.teamBId) || null) : null;
  });
  const [videoUrl, setVideoUrl] = useState<string | null>(() => {
    const loadedGame = storageService.getGame(gameId);
    return loadedGame?.videoUrl || null;
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Tagging State
  const [isTagging, setIsTagging] = useState(false);
  const [tagTime, setTagTime] = useState(0);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>('');
  const [selectedAction, setSelectedAction] = useState<ActionType | ''>('');
  const [selectedFieldZone, setSelectedFieldZone] = useState<number | null>(null);
  const [selectedGoalZone, setSelectedGoalZone] = useState<number | null>(null);



  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
      if (game) {
        const updatedGame = { ...game, videoUrl: url }; // In real electron app, we'd save file path
        storageService.saveGame(updatedGame);
        setGame(updatedGame);
      }
    }
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const startTagging = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
      setTagTime(videoRef.current.currentTime);
      setIsTagging(true);
    }
  };

  const cancelTagging = () => {
    setIsTagging(false);
    resetTagState();
  };

  const resetTagState = () => {
    setSelectedTeam(null);
    setSelectedPlayerId('');
    setSelectedAction('');
    setSelectedFieldZone(null);
    setSelectedGoalZone(null);
  };

  const saveTag = () => {
    if (!game || !selectedTeam || !selectedPlayerId || !selectedAction || !selectedFieldZone || !selectedGoalZone) {
      alert('Por favor, preencha todos os campos antes de guardar.');
      return;
    }

    const newTag: EventTag = {
      id: uuidv4(),
      timestamp: tagTime,
      teamId: selectedTeam.id,
      playerId: selectedPlayerId,
      action: selectedAction as ActionType,
      fieldZone: selectedFieldZone,
      goalZone: selectedGoalZone
    };

    const updatedGame = { ...game, events: [...game.events, newTag] };
    storageService.saveGame(updatedGame);
    setGame(updatedGame);

    setIsTagging(false);
    resetTagState();

    if (videoRef.current) {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleSeek = (timestamp: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = timestamp;
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  if (!game || !teamA || !teamB) return <div>A carregar...</div>;

  return (
    <div className="h-screen flex flex-col bg-gray-900 text-white">
      <header className="p-4 bg-gray-800 flex justify-between items-center shadow-md z-10">
        <div className="flex items-center gap-4">
          <button onClick={() => onNavigate('dashboard')} className="p-2 hover:bg-gray-700 rounded-full">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold truncate max-w-md">{game.name}</h1>
        </div>
        <div className="flex items-center gap-4 bg-gray-700 px-4 py-2 rounded-lg">
          <span className="font-semibold text-blue-400">{teamA.name}</span>
          <span className="text-gray-400 text-sm">vs</span>
          <span className="font-semibold text-red-400">{teamB.name}</span>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        {/* Left Side: Video Player */}
        <div className="flex-1 flex flex-col p-4 relative">
          {!videoUrl ? (
            <div className="flex-1 flex items-center justify-center border-2 border-dashed border-gray-700 rounded-xl bg-gray-800/50">
              <label className="flex flex-col items-center gap-4 cursor-pointer p-12 hover:bg-gray-800 rounded-xl transition-colors">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
                  <Play size={32} fill="white" />
                </div>
                <span className="text-xl font-medium">Carregar Vídeo do Jogo</span>
                <span className="text-gray-400 text-sm">Selecione um ficheiro de vídeo local</span>
                <input type="file" accept="video/*" className="hidden" onChange={handleVideoUpload} />
              </label>
            </div>
          ) : (
            <div className="relative flex-1 bg-black rounded-xl overflow-hidden shadow-2xl flex flex-col">
              <video
                ref={videoRef}
                src={videoUrl}
                className="w-full h-full object-contain"
                onClick={togglePlayPause}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                controls={!isTagging}
              />

              {!isTagging && (
                <>
                  <div className="absolute top-4 right-4">
                    <label className="cursor-pointer bg-gray-800/80 hover:bg-gray-700 text-white px-4 py-2 rounded-lg shadow text-sm font-medium transition-colors">
                      Mudar Vídeo
                      <input type="file" accept="video/*" className="hidden" onChange={handleVideoUpload} />
                    </label>
                  </div>
                  <div className="absolute bottom-16 right-4">
                    <button
                      onClick={startTagging}
                      className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-full font-bold shadow-lg transform hover:scale-105 transition-all"
                    >
                      <div className="w-4 h-4 bg-white rounded-full animate-pulse"></div>
                      Novo Evento
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Right Side: Timeline or Tagging Panel */}
        {!isTagging ? (
          <Timeline
            game={game}
            teamA={teamA}
            teamB={teamB}
            onSeek={handleSeek}
          />
        ) : (
          <div className="w-[450px] bg-gray-800 border-l border-gray-700 p-6 flex flex-col overflow-y-auto shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                Registar Evento
              </h2>
              <button onClick={cancelTagging} className="text-gray-400 hover:text-white">
                <X size={24} />
              </button>
            </div>

            <div className="text-sm text-gray-400 mb-6 bg-gray-900 p-3 rounded-lg border border-gray-700">
              Tempo: <span className="font-mono text-white ml-2">{new Date(tagTime * 1000).toISOString().substr(11, 8)}</span>
            </div>

            <div className="space-y-6">
              {/* 1. Equipa */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-3">1. Selecionar Equipa</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => { setSelectedTeam(teamA); setSelectedPlayerId(''); }}
                    className={`py-3 px-4 rounded-lg font-medium transition-colors ${selectedTeam?.id === teamA.id ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                  >
                    {teamA.name}
                  </button>
                  <button
                    onClick={() => { setSelectedTeam(teamB); setSelectedPlayerId(''); }}
                    className={`py-3 px-4 rounded-lg font-medium transition-colors ${selectedTeam?.id === teamB.id ? 'bg-red-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                  >
                    {teamB.name}
                  </button>
                </div>
              </div>

              {/* 2. Jogador */}
              {selectedTeam && (
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-3">2. Selecionar Jogador</label>
                  <div className="grid grid-cols-4 gap-2">
                    {selectedTeam.players.map(player => (
                      <button
                        key={player.id}
                        onClick={() => setSelectedPlayerId(player.id)}
                        className={`py-2 px-1 rounded text-sm font-medium transition-colors ${selectedPlayerId === player.id ? 'bg-white text-gray-900' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                        title={player.name}
                      >
                        {player.number}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 3. Ação */}
              {selectedPlayerId && (
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-3">3. Ação</label>
                  <div className="grid grid-cols-2 gap-2">
                    {ACTIONS.map(action => (
                      <button
                        key={action}
                        onClick={() => setSelectedAction(action)}
                        className={`py-2 px-3 rounded text-sm font-medium transition-colors ${selectedAction === action ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                      >
                        {action}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 4. Zonas */}
              {selectedAction && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-3 flex justify-between">
                      <span>4. Zona do Campo</span>
                      {selectedFieldZone && <span className="text-white font-bold bg-blue-600 px-2 rounded">Zona {selectedFieldZone}</span>}
                    </label>
                    <FieldZone selectedZone={selectedFieldZone} onSelectZone={setSelectedFieldZone} />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-3 flex justify-between">
                      <span>5. Zona da Baliza</span>
                      {selectedGoalZone && <span className="text-white font-bold bg-blue-600 px-2 rounded">Zona {selectedGoalZone}</span>}
                    </label>
                    <GoalZone selectedZone={selectedGoalZone} onSelectZone={setSelectedGoalZone} />
                  </div>
                </>
              )}
            </div>

            <div className="mt-8 pt-4 border-t border-gray-700">
              <button
                onClick={saveTag}
                disabled={!selectedTeam || !selectedPlayerId || !selectedAction || !selectedFieldZone || !selectedGoalZone}
                className="w-full py-4 bg-green-600 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-lg font-bold text-lg flex justify-center items-center gap-2 hover:bg-green-500 transition-colors"
              >
                <Save size={24} />
                Guardar Evento
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
