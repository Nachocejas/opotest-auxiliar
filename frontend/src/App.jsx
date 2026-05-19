import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Sparkles, History, PlusCircle, Brain, TrendingUp, Upload } from 'lucide-react';
import Dashboard from './components/Dashboard';
import QuizEngine from './components/QuizEngine';
import UploadZone from './components/UploadZone';
import StatsView from './components/StatsView';
import LoginScreen from './components/LoginScreen';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function App() {
  const [view, setView] = useState('dashboard'); // dashboard, quiz, upload
  const [topics, setTopics] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [activeSubject, setActiveSubject] = useState(null);
  const [activeTopic, setActiveTopic] = useState(null);
  const [activeQuestions, setActiveQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(sessionStorage.getItem('isQuizAuth') === 'true');
  const [password, setPassword] = useState('');
  const [passError, setPassError] = useState(false);

  useEffect(() => {
    fetchData();
  }, [isAuthenticated]);

  const fetchData = async () => {
    try {
      const [topicsRes, subjectsRes] = await Promise.all([
        axios.get(`${API_BASE}/topics`),
        axios.get(`${API_BASE}/subjects`)
      ]);
      setTopics(topicsRes.data);
      setSubjects(subjectsRes.data);
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

  const handleSelectTopic = async (topic) => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_BASE}/questions/${topic.id}`);
      setActiveTopic(topic);
      setActiveQuestions(response.data);
      setView('quiz');
    } catch (err) {
      console.error('Error fetching questions:', err);
      alert('Error al cargar las preguntas del tema.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadSuccess = (data) => {
    fetchData();
  };

  const handleNavToDashboard = () => {
    fetchData();
    setView('dashboard');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_BASE}/verify-password`, { password });
      if (response.data.status === 'ok') {
        setIsAuthenticated(true);
        sessionStorage.setItem('isQuizAuth', 'true');
        setPassError(false);
        fetchData();
      }
    } catch (err) {
      setPassError(true);
      console.error('Auth error:', err);
    }
  };

  if (!isAuthenticated) {
    return (
      <LoginScreen
        password={password}
        setPassword={setPassword}
        passError={passError}
        onLogin={handleLogin}
      />
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div className="flex items-center gap-4">
          <div className="bg-indigo-600 p-3 rounded-2xl shadow-lg shadow-indigo-500/30">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              OpoTest Auxiliar
            </h1>
            <p className="text-slate-500 font-medium">Preparación para Auxiliar Administrativo</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleNavToDashboard}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${view === 'dashboard' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
          >
            <History className="w-4 h-4" /> Mis Exámenes
          </button>
          <button
            onClick={() => setView('stats')}
            className={`px-6 py-2.5 rounded-xl font-medium transition-all flex items-center gap-2 ${
              view === 'stats'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                : 'text-slate-300 hover:bg-white/10'
            }`}
          >
            <TrendingUp className="w-4 h-4" /> Mi Progreso
          </button>
          <button
            onClick={() => setView('upload')}
            className={`px-6 py-2.5 rounded-xl font-medium transition-all flex items-center gap-2 ${
              view === 'upload'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                : 'text-slate-300 hover:bg-white/10'
            }`}
          >
            <Upload className="w-4 h-4" /> Nuevo PDF
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main>
        {isLoading ? (
          <div className="py-20 text-center animate-pulse">
            <div className="w-12 h-12 bg-indigo-600/20 rounded-full mx-auto mb-4" />
            <p className="text-slate-400 text-lg">Cargando contenido...</p>
          </div>
        ) : (
          <>
            {view === 'dashboard' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-2 mb-8 text-slate-300">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  <h2 className="text-xl font-bold">Mis Temas Disponibles</h2>
                </div>
                <Dashboard
                  topics={topics}
                  subjects={subjects}
                  onSelectTopic={handleSelectTopic}
                  onDeleteSuccess={fetchData}
                  apiBase={API_BASE}
                />
              </div>
            )}

            {view === 'upload' && (
              <div className="max-w-xl mx-auto py-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold mb-2">Subir Nuevo PDF</h2>
                  <p className="text-slate-400">El sistema extraerá automáticamente las preguntas y respuestas.</p>
                </div>
                <UploadZone 
                  onUploadSuccess={handleUploadSuccess} 
                  subjects={subjects}
                  onSubjectCreated={fetchData}
                  apiBase={API_BASE}
                />
                <div className="mt-8 p-6 glass-card bg-indigo-500/5 border-indigo-500/10">
                  <h4 className="font-bold text-indigo-300 mb-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" /> Tip de Estudio
                  </h4>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    Asegúrate de que el PDF tenga las soluciones al final con el formato "1-A, 2-B" o similar para que el sistema las detecte automáticamente.
                  </p>
                </div>
              </div>
            )}

            {view === 'quiz' && (
              <QuizEngine
                topic={activeTopic}
                questions={activeQuestions}
                onExit={handleNavToDashboard}
                apiBase={API_BASE}
              />
            )}

            {view === 'stats' && (
              <StatsView apiBase={API_BASE} />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-20 py-8 border-t border-white/5 text-center text-slate-600 text-sm">
        <p>&copy; 2026 OpoTest Auxiliar. Tu plaza está más cerca.</p>
      </footer>
    </div>
  );
}

export default App;
