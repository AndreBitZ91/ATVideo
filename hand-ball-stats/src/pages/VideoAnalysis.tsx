import React, { useState, useRef, useEffect } from 'react';
import { Game, Team, ActionType, EventTag } from '../types';
import { storageService } from '../services/storage';
import { ArrowLeft, Play, Save, X } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { FieldZone } from '../components/FieldZone';
import { GoalZone } from '../components/GoalZone';
import { Timeline } from '../components/Timeline';
import { PlayerTracker } from '../components/PlayerTracker';
import { GameSegmentsSetup } from '../components/GameSegmentsSetup';

interface VideoAnalysisProps {
  gameId: string;
  onNavigate: (page: string) => void;
}

const ACTIONS: ActionType[] = [
  'Golo', 'Remate Falhado', 'Perda de Bola', 'Falta', 'Exclusão 2 Min', 'Defesa'
];

export const VideoAnalysis: React.FC<VideoAnalysisProps> = ({ gameId, onNavigate }) => {
  const [game, setGame] = useState<Game | null>(null);
  const [teamA, setTeamA] = useState<Team | null>(null);
  const [teamB, setTeamB] = useState<Team | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Time Tracking State
  const [onCourtPlayers, setOnCourtPlayers] = useState<Set<string>>(new Set());
  const [lastTimeUpdate, setLastTimeUpdate] = useState<number>(0);
  const [showSegmentsSetup, setShowSegmentsSetup] = useState(false);

  // Tagging State
  const [isTagging, setIsTagging] = useState(false);
  const [pendingEventStart, setPendingEventStart] = useState<number | null>(null);
  const [tagTime, setTagTime] = useState(0);
  const [tagEndTime, setTagEndTime] = useState<number | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>('');
  const [selectedAction, setSelectedAction] = useState<ActionType | ''>('');
  const [selectedFieldZone, setSelectedFieldZone] = useState<number | null>(null);
  const [selectedGoalZone, setSelectedGoalZone] = useState<number | null>(null);

  useEffect(() => {
    const loadedGame = storageService.getGame(gameId);
    if (loadedGame) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setGame(loadedGame);
      setTeamA(storageService.getTeams().find(t => t.id === loadedGame.teamAId) || null);
      setTeamB(storageService.getTeams().find(t => t.id === loadedGame.teamBId) || null);
      if (loadedGame.videoUrl) {
        setVideoUrl(loadedGame.videoUrl);
        // Show segment setup if any are missing
        if (loadedGame.firstHalfStart === undefined || loadedGame.firstHalfEnd === undefined) {
          setShowSegmentsSetup(true);
        }
      }
    }
  }, [gameId]);

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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.code === 'Space' && !isTagging) {
        e.preventDefault(); // Prevent page scroll
        togglePlayPause();
      }

      if (e.key === 'z' || e.key === 'Z') {
        if (!isTagging && videoRef.current) {
          setPendingEventStart(videoRef.current.currentTime);
          // Optional: give user visual feedback that event started
        }
      }

      if (e.key === 'x' || e.key === 'X') {
        if (!isTagging && videoRef.current && pendingEventStart !== null) {
          const end = videoRef.current.currentTime;
          setTagTime(pendingEventStart);
          setTagEndTime(end);
          setPendingEventStart(null);

          // Pause and open tagging dialog
          videoRef.current.pause();
          setIsPlaying(false);
          setIsTagging(true);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying, isTagging, pendingEventStart]);

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
      if (game) {
        const updatedGame = { ...game, videoUrl: url }; // In real electron app, we'd save file path
        storageService.saveGame(updatedGame);
        setGame(updatedGame);
        setShowSegmentsSetup(true);
      }
    }
  };

  const togglePlayerOnCourt = (playerId: string) => {
    const newSet = new Set(onCourtPlayers);
    if (newSet.has(playerId)) {
      newSet.delete(playerId);
    } else {
      newSet.add(playerId);
    }
    setOnCourtPlayers(newSet);
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current || !game || !isPlaying) return;

    const currentTime = videoRef.current.currentTime;
    const delta = currentTime - lastTimeUpdate;

    // Only update if moving forward and delta is reasonable (e.g. not a seek jump)
    if (delta > 0 && delta < 2) {
      // Check if current time is within active game halves (if they are set)
      const inFirstHalf = game.firstHalfStart !== undefined && game.firstHalfEnd !== undefined
        ? (currentTime >= game.firstHalfStart && currentTime <= game.firstHalfEnd)
        : true; // Default to true if not set

      const inSecondHalf = game.secondHalfStart !== undefined && game.secondHalfEnd !== undefined
        ? (currentTime >= game.secondHalfStart && currentTime <= game.secondHalfEnd)
        : true; // Default to true if not set

      const isGameActive = (game.firstHalfStart !== undefined ? inFirstHalf : true) || (game.secondHalfStart !== undefined ? inSecondHalf : false);

      // Only count time if we are in an active half
      if (game.firstHalfStart === undefined || isGameActive) {
        const currentTimes = { ...(game.playerTimeSeconds || {}) };
        let updated = false;

        onCourtPlayers.forEach(playerId => {
          currentTimes[playerId] = (currentTimes[playerId] || 0) + delta;
          updated = true;
        });

        if (updated) {
          // Save without triggering a full re-render on every frame to avoid lag
          const updatedGame = { ...game, playerTimeSeconds: currentTimes };
          setGame(updatedGame);
        }
      }
    }

    setLastTimeUpdate(currentTime);
  };

  const persistToStorage = () => {
    if (game) {
      storageService.saveGame(game);
    }
  };

  const startTagging = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
      setTagTime(videoRef.current.currentTime);
      setTagEndTime(null);
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
    setTagEndTime(null);
  };

  const saveTag = () => {
    if (!game || !selectedTeam || !selectedPlayerId || !selectedAction || !selectedFieldZone || !selectedGoalZone) {
      alert('Por favor, preencha todos os campos antes de guardar.');
      return;
    }

    const newTag: EventTag = {
      id: uuidv4(),
      timestamp: tagTime,
      endTime: tagEndTime || undefined,
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
          <button onClick={() => {
            persistToStorage();
            onNavigate('dashboard');
          }} className="p-2 hover:bg-gray-700 rounded-full">
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
                onPlay={() => {
                  setIsPlaying(true);
                  if (videoRef.current) setLastTimeUpdate(videoRef.current.currentTime);
                }}
                onPause={() => {
                  setIsPlaying(false);
                  persistToStorage();
                }}
                onTimeUpdate={handleTimeUpdate}
                controls={!isTagging}
              />

              {!isTagging && (
                <>
                  {pendingEventStart !== null && (
                    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-red-600 px-4 py-2 rounded-full font-bold text-white flex items-center gap-2 animate-pulse shadow-lg">
                      <div className="w-3 h-3 bg-white rounded-full"></div>
                      Gravando Evento... Pressione "X" para terminar
                    </div>
                  )}

                  <div className="absolute top-4 right-4">
                    <button onClick={() => setShowSegmentsSetup(true)} className="mr-2 bg-gray-800/80 hover:bg-gray-700 text-white px-4 py-2 rounded-lg shadow text-sm font-medium transition-colors">
                      Definir Tempos
                    </button>
                    <label className="cursor-pointer bg-gray-800/80 hover:bg-gray-700 text-white px-4 py-2 rounded-lg shadow text-sm font-medium transition-colors">
                      Mudar Vídeo
                      <input type="file" accept="video/*" className="hidden" onChange={handleVideoUpload} />
                    </label>
                  </div>
                  <div className="absolute bottom-16 right-4 flex flex-col items-end gap-2">
                    <div className="text-sm bg-black/50 px-3 py-1 rounded text-gray-300">
                      Z: Início | X: Fim Evento | Espaço: Play/Pausa
                    </div>
                    <button
                      onClick={startTagging}
                      className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-full font-bold shadow-lg transform hover:scale-105 transition-all"
                    >
                      <div className="w-4 h-4 bg-white rounded-full animate-pulse"></div>
                      Novo Evento Rápido
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
          {showSegmentsSetup && videoUrl && (
            <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50">
              <GameSegmentsSetup
                game={game}
                currentTime={lastTimeUpdate}
                onComplete={(updatedGame) => {
                  setGame(updatedGame);
                  setShowSegmentsSetup(false);
                }}
              />
            </div>
          )}
        </div>

        {/* Right Side: Timeline or Tagging Panel */}
        {!isTagging ? (
          <div className="w-[450px] flex flex-col border-l border-gray-700 bg-gray-900">
            <div className="flex-1 overflow-hidden">
              <Timeline
                game={game}
                teamA={teamA}
                teamB={teamB}
                onSeek={handleSeek}
              />
            </div>
            <PlayerTracker
              teamA={teamA}
              teamB={teamB}
              onCourtPlayers={onCourtPlayers}
              togglePlayerOnCourt={togglePlayerOnCourt}
            />
          </div>
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
