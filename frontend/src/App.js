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

const API_URL =
  process.env.REACT_APP_API_URL ||
  'https://saikrishna471032-dream2plan-backend.hf.space';

function App() {
  const [page, setPage] = useState('landing');
  const [user, setUser] = useState(null);
  const [blueprintData, setBlueprintData] = useState(null);
  const [inputData, setInputData] = useState(null);
  const [historyBlueprint, setHistoryBlueprint] = useState(null);

  // ── On mount: restore session ──
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

  // ── Generate Blueprint ──
  const handleGenerateFromRecommendation = async (formDataWithDomain) => {
  setPage('loading');

  try {
    // 🔹 Get token
    const token = localStorage.getItem('d2p_token');

    // ❗ If no token → force login
    if (!token) {
      alert("Session expired. Please login again.");
      setPage('auth');
      return;
    }

    // 🔹 API call with token
    const response = await fetch(`${API_URL}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(formDataWithDomain),
    });

    // 🔹 Handle response
    const result = await response.json();

    if (response.status === 401) {
      alert("Unauthorized. Please login again.");
      localStorage.removeItem('d2p_token');
      localStorage.removeItem('d2p_user');
      setUser(null);
      setPage('auth');
      return;
    }

    if (result.status === 'success') {
      setBlueprintData(result);
      setPage('results');
    } else {
      alert('Error: ' + (result.message || 'Something went wrong'));
      setPage('recommendations');
    }

  } catch (err) {
    console.error("Generate Error:", err);
    alert('Could not connect to server');
    setPage('recommendations');
  }
};  

  // ── History view ──
  const handleViewHistoryBlueprint = (bp) => {
    const formatted = {
      status: 'success',
      blueprint: bp.blueprint,
      input_summary: {
        domain: bp.domain,
        investment: bp.investment,
        risk: bp.risk,
      },
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

      {page === 'landing' && (
        <LandingPage
          onGetStarted={() => (user ? goToInput() : goToAuth())}
          user={user}
        />
      )}

      {page === 'auth' && (
        <AuthPage onAuthSuccess={handleAuthSuccess} />
      )}

      {page === 'input' && (
        <InputPage onSubmit={handleInputSubmit} />
      )}

      {page === 'recommendations' && (
        <RecommendationsPage
          inputData={inputData}
          onGenerate={handleGenerateFromRecommendation}
          onBack={() => setPage('input')}
        />
      )}

      {page === 'loading' && <Loader />}

      {page === 'results' && (
        <ResultsPage
          data={blueprintData}
          onBack={() =>
            historyBlueprint
              ? setPage('history')
              : setPage('recommendations')
          }
        />
      )}

      {page === 'history' && (
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
