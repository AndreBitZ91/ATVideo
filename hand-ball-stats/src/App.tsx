import { useState } from 'react';
import { Dashboard } from './pages/Dashboard';
import { TeamsSetup } from './pages/TeamsSetup';
import { NewGame } from './pages/NewGame';
import './index.css';

// Placeholder for Video Analysis Page
const VideoAnalysis = ({ gameId, onNavigate }: { gameId: string, onNavigate: (page: string, params?: Record<string, unknown>) => void }) => (
  <div className="p-8">
    <button onClick={() => onNavigate('dashboard')} className="mb-4 text-blue-600">Voltar</button>
    <h1>Video Analysis for game: {gameId}</h1>
  </div>
);

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [pageParams, setPageParams] = useState<Record<string, unknown>>({});

  const navigate = (page: string, params?: Record<string, unknown>) => {
    setCurrentPage(page);
    setPageParams(params || {});
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans w-full">
      {currentPage === 'dashboard' && <Dashboard onNavigate={navigate} />}
      {currentPage === 'teams' && <TeamsSetup onNavigate={navigate} />}
      {currentPage === 'new-game' && <NewGame onNavigate={navigate} />}
      {currentPage === 'analysis' && <VideoAnalysis gameId={pageParams.gameId as string} onNavigate={navigate} />}
    </div>
  );
}

export default App;
