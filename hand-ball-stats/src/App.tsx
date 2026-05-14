import { useState } from 'react';
import { Dashboard } from './pages/Dashboard';
import { TeamsSetup } from './pages/TeamsSetup';
import { NewGame } from './pages/NewGame';
import { VideoAnalysis } from './pages/VideoAnalysis';
import './index.css';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [pageParams, setPageParams] = useState<Record<string, unknown>>({});

  const navigate = (page: string, params?: Record<string, unknown>) => {
    setCurrentPage(page);
    setPageParams(params || {});
  };

  return (
    <div className="h-screen w-screen bg-gray-900 text-gray-100 font-sans overflow-hidden">
      {currentPage === 'dashboard' && <Dashboard onNavigate={navigate} />}
      {currentPage === 'teams' && <TeamsSetup onNavigate={navigate} />}
      {currentPage === 'new-game' && <NewGame onNavigate={navigate} />}
      {currentPage === 'analysis' && <VideoAnalysis gameId={pageParams.gameId as string} onNavigate={navigate} />}
    </div>
  );
}

export default App;
