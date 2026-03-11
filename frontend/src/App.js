const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import InputPage from './pages/InputPage';
import RecommendationsPage from './pages/RecommendationsPage';
import ResultsPage from './pages/ResultsPage';
import HistoryPage from './pages/HistoryPage';
import Loader from './components/Loader';
import './styles/theme.css';

function App() {
  const [page, setPage] = useState('landing');
  const [user, setUser] = useState(null);
  const [blueprintData, setBlueprintData] = useState(null);
  const [inputData, setInputData] = useState(null);
  const [historyBlueprint, setHistoryBlueprint] = useState(null);

  // ── On mount: restore session from localStorage ──
  useEffect(() => {
    const token = localStorage.getItem('d2p_token');
    const savedUser = localStorage.getItem('d2p_user');
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('d2p_token');
        localStorage.removeItem('d2p_user');
      }
    }
  }, []);

  // ── Auth ──
  const handleAuthSuccess = (userData) => {
    setUser(userData);
    setPage('landing');
  };

  const handleLogout = () => {
    setUser(null);
    setBlueprintData(null);
    setInputData(null);
    setPage('landing');
  };

  // ── Navigation ──
  const goHome = () => {
    setBlueprintData(null);
    setInputData(null);
    setHistoryBlueprint(null);
    setPage('landing');
  };

  const goToInput = () => {
    setHistoryBlueprint(null);
    setPage('input');
  };

  const goToAuth = () => setPage('auth');
  const goToHistory = () => setPage('history');

  // ── Input → Recommendations ──
  const handleInputSubmit = (formData) => {
    setInputData(formData);
    setPage('recommendations');
  };

  // ── Recommendations → Generate Blueprint ──
  const handleGenerateFromRecommendation = async (formDataWithDomain) => {
    setPage('loading');
    try {
      const token = localStorage.getItem('d2p_token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      fetch(`${API_URL}/api/generate`, {
        method: 'POST',
        headers,
        body: JSON.stringify(formDataWithDomain),
      });
      const result = await response.json();
      if (result.status === 'success') {
        setBlueprintData(result);
        setPage('results');
      } else {
        alert('Error: ' + (result.message || 'Something went wrong'));
        setPage('recommendations');
      }
    } catch {
      alert('Could not connect to server. Make sure backend is running.');
      setPage('recommendations');
    }
  };

  // ── History: view a saved blueprint ──
  const handleViewHistoryBlueprint = (bp) => {
    // Convert history blueprint format to ResultsPage format
    const formatted = {
      status: 'success',
      blueprint: bp.blueprint,
      input_summary: {
        domain: bp.domain,
        investment: bp.investment,
        risk: bp.risk,
      }
    };
    setBlueprintData(formatted);
    setHistoryBlueprint(bp);
    setPage('results');
  };

  return (
    <div>
      <Navbar
        onHome={goHome}
        currentPage={page}
        user={user}
        onLogout={handleLogout}
        onHistory={goToHistory}
      />

      {page === 'landing'         && <LandingPage onGetStarted={() => user ? goToInput() : goToAuth()} user={user} />}
      {page === 'auth'            && <AuthPage onAuthSuccess={handleAuthSuccess} />}
      {page === 'input'           && <InputPage onSubmit={handleInputSubmit} />}
      {page === 'recommendations' && (
        <RecommendationsPage
          inputData={inputData}
          onGenerate={handleGenerateFromRecommendation}
          onBack={() => setPage('input')}
        />
      )}
      {page === 'loading'         && <Loader />}
      {page === 'results'         && (
        <ResultsPage
          data={blueprintData}
          onBack={() => historyBlueprint ? setPage('history') : setPage('recommendations')}
        />
      )}
      {page === 'history'         && (
        <HistoryPage
          user={user}
          onViewBlueprint={handleViewHistoryBlueprint}
          onNewBlueprint={goToInput}
        />
      )}
    </div>
  );
}

export default App;