import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MessageSquare, Briefcase, Presentation, ChevronRight, Sparkles, 
  FileText, Brain, Code, UserCheck, Award, Settings, Globe, Cpu, User, LogOut
} from 'lucide-react';
import DiscussionRoom from './components/DiscussionRoom';
import InterviewRoom from './components/InterviewRoom';
import PresentationRoom from './components/PresentationRoom';
import CodingTestRoom from './components/CodingTestRoom';
import Login from './components/Auth/Login';
import Signup from './components/Auth/Signup';

type Mode = 'home' | 'resume' | 'aptitude' | 'coding' | 'gd' | 'presentation' | 'technical' | 'managerial' | 'hr' | 'offer';

export default function App() {
  const [mode, setMode] = useState<Mode>('home');
  const [showSettings, setShowSettings] = useState(false);
  const [useOllama, setUseOllama] = useState(localStorage.getItem('use_ollama') === 'true');
  const [ollamaUrl, setOllamaUrl] = useState(localStorage.getItem('ollama_url') || 'http://localhost:11434/api/generate');
  // Auth state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);

  useEffect(() => {
    localStorage.setItem('use_ollama', useOllama.toString());
    localStorage.setItem('ollama_url', ollamaUrl);
  }, [useOllama, ollamaUrl]);

  // Auth useEffect
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (token && storedUser) {
      setIsLoggedIn(true);
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLoginSuccess = (token: string, userData: any) => {
    setIsLoggedIn(true);
    setUser(userData);
    setShowLogin(false);
    setShowSignup(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUser(null);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-emerald-500/30">
      <nav className="fixed top-0 left-0 right-0 z-50 px-8 py-6 flex justify-between items-center bg-black/50 backdrop-blur-md border-b border-zinc-800/50">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setMode('home')}>
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
            <Sparkles size={18} className="text-black" />
          </div>
          <span className="font-bold tracking-tight text-xl">RecruitPrep</span>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-4 mr-4">
            {isLoggedIn ? (
              <div className="flex items-center gap-2">
                <User size={18} className="text-emerald-400" />
                <span className="text-sm font-medium">{user?.email}</span>
                <button 
                  onClick={handleLogout}
                  className="px-3 py-1 bg-zinc-800 text-white text-xs font-bold rounded-lg hover:bg-zinc-700 transition-all"
                >
                  Logout
                </button>
              </div>
            ) : (
              <>
                <button 
                  onClick={() => setShowLogin(true)}
                  className="text-sm font-medium text-zinc-400 hover:text-white transition-colors"
                >
                  Login
                </button>
                <button 
                  onClick={() => setShowSignup(true)}
                  className="px-4 py-2 bg-white text-black text-sm font-bold rounded-lg hover:bg-zinc-200 transition-all"
                >
                  Sign Up
                </button>
              </>
            )}
          </div>
          <button 
            onClick={() => setShowSettings(true)}
            className="p-2 hover:bg-zinc-800 rounded-lg transition-all text-zinc-400 hover:text-white"
          >
            <Settings size={20} />
          </button>
        </div>
      </nav>

      <AnimatePresence mode="wait">
        {mode === 'home' ? (
          <motion.div
            key="home"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="max-w-7xl mx-auto px-8 pt-32 pb-20"
          >
            <div className="flex flex-col items-center text-center space-y-8 mb-20">
              <h1 className="text-7xl font-bold tracking-tight max-w-4xl">
                Your Path to the <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-indigo-400 bg-clip-text text-transparent">Dream Offer</span>
              </h1>
              <p className="text-zinc-400 text-xl max-w-2xl leading-relaxed">
                Complete all 7 rounds of the recruitment simulation to unlock your personalized offer letter and performance report.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <ModeCard 
                round="Round 0"
                title="Resume Screening"
                description="Profile check, CGPA, and eligibility verification."
                icon={<FileText className="text-zinc-400" size={24} />}
                onClick={() => setMode('resume')}
                color="zinc"
              />
              <ModeCard 
                round="Round 1"
                title="Aptitude Test"
                description="Quant, Logical, Verbal, and English proficiency."
                icon={<Brain className="text-blue-400" size={24} />}
                onClick={() => setMode('aptitude')}
                color="blue"
              />
              <ModeCard 
                round="Round 2"
                title="Coding / Technical Test"
                description="DSA, Problem solving, and MCQ technical rounds."
                icon={<Code className="text-purple-400" size={24} />}
                onClick={() => setMode('coding')}
                color="purple"
              />
              <ModeCard 
                round="Round 3"
                title="Group Discussion"
                description="Topic debate, communication, and teamwork skills."
                icon={<MessageSquare className="text-emerald-400" size={24} />}
                onClick={() => setMode('gd')}
                color="emerald"
              />
              <ModeCard 
                round="Round 4"
                title="Presentation / Essay"
                description="Topic pitch, slide presentation, and writing skills."
                icon={<Presentation className="text-amber-400" size={24} />}
                onClick={() => setMode('presentation')}
                color="amber"
              />
              <ModeCard 
                round="Round 5"
                title="Technical Interview"
                description="Projects, OOP, DBMS, OS, and Coding deep-dive."
                icon={<Briefcase className="text-orange-400" size={24} />}
                onClick={() => setMode('technical')}
                color="orange"
              />
              <ModeCard 
                round="Round 6"
                title="Managerial Interview"
                description="Situational, Leadership, and Stress management."
                icon={<UserCheck className="text-pink-400" size={24} />}
                onClick={() => setMode('managerial')}
                color="pink"
              />
              <ModeCard 
                round="Round 7"
                title="HR Interview"
                description="Culture fit, Salary, and Strengths/Weaknesses."
                icon={<Globe className="text-cyan-400" size={24} />}
                onClick={() => setMode('hr')}
                color="cyan"
              />
              <ModeCard 
                round="Final"
                title="Offer Letter"
                description="Mock result and comprehensive performance report."
                icon={<Award className="text-emerald-400" size={24} />}
                onClick={() => setMode('offer')}
                color="emerald"
                isSpecial
              />
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="room"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="relative pt-24"
          >
            <button 
              onClick={() => setMode('home')}
              className="fixed top-24 left-8 z-50 px-4 py-2 bg-zinc-900/50 border border-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-all flex items-center gap-2"
            >
              <ChevronRight className="rotate-180" size={16} /> Dashboard
            </button>
            {mode === 'gd' && <DiscussionRoom />}
            {mode === 'technical' && <InterviewRoom type="technical" />}
            {mode === 'managerial' && <InterviewRoom type="managerial" />}
            {mode === 'hr' && <InterviewRoom type="hr" />}
            {mode === 'presentation' && <PresentationRoom />}
            {mode === 'coding' && <CodingTestRoom />}
            {['resume', 'aptitude', 'offer'].includes(mode) && (
              <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
                <h2 className="text-3xl font-bold capitalize">{mode.replace('-', ' ')} Round</h2>
                <p className="text-zinc-500">This module is currently being optimized for your profile.</p>
                <button onClick={() => setMode('home')} className="text-emerald-400 font-bold">Return to Dashboard</button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 z-[100]"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-zinc-900 border border-zinc-800 max-w-md w-full rounded-3xl p-8 space-y-8"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">AI Settings</h2>
                <button onClick={() => setShowSettings(false)} className="text-zinc-500 hover:text-white">
                  <ChevronRight size={24} className="rotate-90" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-2xl border border-zinc-700/50">
                  <div className="flex items-center gap-3">
                    <Cpu size={20} className="text-emerald-400" />
                    <div>
                      <p className="text-sm font-bold">Local Llama Active</p>
                      <p className="text-[10px] text-zinc-500">Running via Ollama</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Ollama API URL</label>
                  <input 
                    type="text"
                    value={ollamaUrl}
                    onChange={(e) => setOllamaUrl(e.target.value)}
                    className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="http://localhost:11434/api/generate"
                  />
                </div>

                <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl">
                  <p className="text-xs text-emerald-400 leading-relaxed">
                    <strong>Tip:</strong> To use Ollama, ensure it's running on your laptop and CORS is enabled. Run: <code className="bg-black/50 px-1 rounded">OLLAMA_ORIGINS="*" ollama serve</code>
                  </p>
                </div>
              </div>

              <button 
                onClick={() => setShowSettings(false)}
                className="w-full bg-white text-black font-bold py-4 rounded-xl hover:bg-zinc-200 transition-all"
              >
                Save Configuration
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

        {/* Auth Modals */}
        <AnimatePresence>
          {showLogin && (
            <Login 
              onClose={() => setShowLogin(false)}
              onSuccess={handleLoginSuccess}
              onSwitchToSignup={() => {
                setShowLogin(false);
                setShowSignup(true);
              }}
            />
          )}
          {showSignup && (
            <Signup 
              onClose={() => setShowSignup(false)}
              onSuccess={handleLoginSuccess}
              onSwitchToLogin={() => {
                setShowSignup(false);
                setShowLogin(true);
              }}
            />
          )}
        </AnimatePresence>
      </div>
    );
}

function ModeCard({ round, title, description, icon, onClick, color, isSpecial }: { 
  round: string;
  title: string; 
  description: string; 
  icon: React.ReactNode; 
  onClick: () => void;
  color: string;
  isSpecial?: boolean;
}) {
  const colorMap: Record<string, string> = {
    emerald: 'hover:border-emerald-500/50 hover:shadow-emerald-500/10',
    indigo: 'hover:border-indigo-500/50 hover:shadow-indigo-500/10',
    amber: 'hover:border-amber-500/50 hover:shadow-amber-500/10',
    blue: 'hover:border-blue-500/50 hover:shadow-blue-500/10',
    purple: 'hover:border-purple-500/50 hover:shadow-purple-500/10',
    orange: 'hover:border-orange-500/50 hover:shadow-orange-500/10',
    pink: 'hover:border-pink-500/50 hover:shadow-pink-500/10',
    cyan: 'hover:border-cyan-500/50 hover:shadow-cyan-500/10',
    zinc: 'hover:border-zinc-500/50 hover:shadow-zinc-500/10',
  };

  return (
    <motion.button
      whileHover={{ y: -8 }}
      onClick={onClick}
      className={`group text-left p-8 bg-zinc-900/50 border border-zinc-800 rounded-3xl transition-all duration-500 ${colorMap[color]} hover:shadow-2xl relative overflow-hidden ${isSpecial ? 'bg-gradient-to-br from-emerald-500/5 to-transparent' : ''}`}
    >
      <div className="flex justify-between items-start mb-6">
        <div className="p-3 bg-zinc-800/50 rounded-xl group-hover:scale-110 transition-transform duration-500">
          {icon}
        </div>
        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 group-hover:text-zinc-400 transition-colors">{round}</span>
      </div>
      <h3 className="text-xl font-bold mb-2 group-hover:text-white transition-colors">{title}</h3>
      <p className="text-zinc-500 text-sm leading-relaxed mb-6">{description}</p>
      <div className="flex items-center gap-2 text-xs font-bold opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0">
        <span>Enter Round</span>
        <ChevronRight size={14} />
      </div>
    </motion.button>
  );
}
