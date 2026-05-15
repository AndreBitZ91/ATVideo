import React, { useState, useRef, useEffect } from 'react';
import { Game, Team, EventTag } from '../types';
import { storageService } from '../services/storage';
import { ArrowLeft, Play } from 'lucide-react';
import { Timeline } from '../components/Timeline';
import { PlayerTracker } from '../components/PlayerTracker';
import { GameSegmentsSetup } from '../components/GameSegmentsSetup';
import { ClassificarLance } from '../components/ClassificarLance';

interface VideoAnalysisProps {
  gameId: string;
  onNavigate: (page: string) => void;
}

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

  // We need a ref to the latest game state so event listeners (like onPause)
  // don't save a stale version of the game that accidentally erases the videoPath.
  const gameRef = useRef<Game | null>(null);

  useEffect(() => {
    gameRef.current = game;
  }, [game]);

  useEffect(() => {
    const loadedGame = storageService.getGame(gameId);
    if (loadedGame) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setGame(loadedGame);
      setTeamA(storageService.getTeams().find(t => t.id === loadedGame.teamAId) || null);
      setTeamB(storageService.getTeams().find(t => t.id === loadedGame.teamBId) || null);
      // If there's a system path we prioritize it for restarts because blob URLs expire
      // using the local file path since webSecurity is false in Electron
      if (loadedGame.videoPath) {
        const fileUrl = `file://${loadedGame.videoPath}`;
        setVideoUrl(fileUrl);
        loadedGame.videoUrl = fileUrl; // temporary hydrate
      } else if (loadedGame.videoUrl) {
        setVideoUrl(loadedGame.videoUrl);
      }

      // Show segment setup if any are missing
      if (loadedGame.videoUrl || loadedGame.videoPath) {
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

      if (e.code === 'ArrowLeft' && !isTagging && videoRef.current && !e.repeat) {
        e.preventDefault();
        videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 3);
      }

      if (e.code === 'ArrowRight' && !isTagging && videoRef.current && !e.repeat) {
        e.preventDefault();
        videoRef.current.currentTime = Math.min(videoRef.current.duration, videoRef.current.currentTime + 3);
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
        // file.path is available in Electron to get the absolute system path
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const videoPath = (file as any).path;
        const updatedGame = { ...game, videoUrl: url, videoPath };
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
    const currentGame = gameRef.current;
    if (!videoRef.current || !currentGame || !isPlaying) return;

    const currentTime = videoRef.current.currentTime;
    const delta = currentTime - lastTimeUpdate;

    // Only update if moving forward and delta is reasonable (e.g. not a seek jump)
    if (delta > 0 && delta < 2) {
      // Check if current time is within active game halves (if they are set)
      const inFirstHalf = currentGame.firstHalfStart !== undefined && currentGame.firstHalfEnd !== undefined
        ? (currentTime >= currentGame.firstHalfStart && currentTime <= currentGame.firstHalfEnd)
        : true; // Default to true if not set

      const inSecondHalf = currentGame.secondHalfStart !== undefined && currentGame.secondHalfEnd !== undefined
        ? (currentTime >= currentGame.secondHalfStart && currentTime <= currentGame.secondHalfEnd)
        : true; // Default to true if not set

      const isGameActive = (currentGame.firstHalfStart !== undefined ? inFirstHalf : true) || (currentGame.secondHalfStart !== undefined ? inSecondHalf : false);

      // Only count time if we are in an active half
      if (currentGame.firstHalfStart === undefined || isGameActive) {
        const currentTimes = { ...(currentGame.playerTimeSeconds || {}) };
        let updated = false;

        onCourtPlayers.forEach(playerId => {
          currentTimes[playerId] = (currentTimes[playerId] || 0) + delta;
          updated = true;
        });

        if (updated) {
          // Save without triggering a full re-render on every frame to avoid lag
          const updatedGame = { ...currentGame, playerTimeSeconds: currentTimes };
          setGame(updatedGame);
        }
      }
    }

    setLastTimeUpdate(currentTime);
  };

  const persistToStorage = () => {
    if (gameRef.current) {
      storageService.saveGame(gameRef.current);
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
    setTagEndTime(null);
  };

  const saveTag = (newTag: EventTag) => {
    if (!game) return;
    const updatedGame = { ...game, events: [...game.events, newTag] };
    storageService.saveGame(updatedGame);
    setGame(updatedGame);

    setIsTagging(false);
    setTagEndTime(null);

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

              {isTagging && (
                <ClassificarLance
                  teamA={teamA}
                  teamB={teamB}
                  timestamp={tagTime}
                  endTime={tagEndTime}
                  onSave={saveTag}
                  onCancel={cancelTagging}
                  onEditPlayers={() => onNavigate('teams')}
                />
              )}

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
                currentTime={lastTimeUpdate} // Updated via handleTimeUpdate, avoids ref reading during render
                onComplete={(updatedGame) => {
                  setGame(updatedGame);
                  // Ensure local storage has these immediately
                  storageService.saveGame(updatedGame);
                  setShowSegmentsSetup(false);
                }}
              />
            </div>
          )}
        </div>

        {/* Right Side: Timeline Panel */}
        <div className="w-1/3 lg:w-[450px] xl:w-[500px] flex flex-col border-l border-gray-700 bg-gray-900 shrink-0 relative z-40">
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
      </main>
    </div>
  );
};
