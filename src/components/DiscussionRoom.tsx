import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, MicOff, Play, RotateCcw, MessageSquare, Award, User, Bot, ChevronRight } from 'lucide-react';
import { GD_PARTICIPANTS, generateGDResponse, generateSpeech, evaluatePerformance } from '../services/geminiService';
import { useSpeechToText, useAudioAnalysis } from '../hooks/useSpeech';

export default function DiscussionRoom() {
  const [topic, setTopic] = useState('');
  const [isStarted, setIsStarted] = useState(false);
  const [messages, setMessages] = useState<{ name: string; content: string; isAI: boolean }[]>([]);
  const [activeSpeakerId, setActiveSpeakerId] = useState<string | null>(null);
  const [isAITurn, setIsAITurn] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [showEvaluation, setShowEvaluation] = useState(false);
  const [evaluation, setEvaluation] = useState<any>(null);
  
  const { isListening, transcript, startListening, stopListening } = useSpeechToText();
  const { pitch, volume, startAnalysis, stopAnalysis } = useAudioAnalysis();
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const startDiscussion = () => {
    if (!topic) return;
    setIsStarted(true);
    runAITurn(0);
  };

  const runAITurn = async (index: number) => {
    if (index >= GD_PARTICIPANTS.length) {
      setIsAITurn(false);
      setActiveSpeakerId('user');
      return;
    }

    const participant = GD_PARTICIPANTS[index];
    setActiveSpeakerId(participant.id);
    setIsAITurn(true);
    setIsThinking(true);

    const history = messages.map(m => ({
      role: m.isAI ? 'model' : 'user',
      content: m.content,
      name: m.name
    }));

    const response = await generateGDResponse(topic, history, participant);
    setIsThinking(false);
    
    setMessages(prev => [...prev, { name: participant.name, content: response, isAI: true }]);
    
    // Use local TTS
    await generateSpeech(response);
    
    // Move to next turn after speech finishes
    setTimeout(() => runAITurn(index + 1), 1000);
  };

  const handleUserSubmit = async () => {
    stopListening();
    stopAnalysis();
    
    if (!transcript) {
      setActiveSpeakerId(null);
      return;
    }
    
    const userMsg = { name: 'You', content: transcript, isAI: false };
    setMessages(prev => [...prev, userMsg]);
    setActiveSpeakerId(null);
    
    // After user speaks, AI agents react
    setTimeout(() => runAITurn(0), 1000);
  };

  const endDiscussion = async () => {
    const evalData = await evaluatePerformance('gd', messages);
    setEvaluation(evalData);
    setShowEvaluation(true);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-8 font-sans">
      <audio ref={audioRef} className="hidden" />
      
      {!isStarted ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto mt-20 text-center space-y-8"
        >
          <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            AI Group Discussion
          </h1>
          <p className="text-zinc-400 text-lg">
            Practice your communication skills in a simulated recruitment round with 4 AI agents.
          </p>
          <div className="space-y-4">
            <input 
              type="text"
              placeholder="Enter discussion topic (e.g., The Future of Remote Work)"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
            <button 
              onClick={startDiscussion}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <Play size={20} /> Start Simulation
            </button>
          </div>
        </motion.div>
      ) : (
        <div className="max-w-6xl mx-auto space-y-12">
          {/* Circular Participant Layout */}
          <div className="relative h-[400px] flex items-center justify-center">
            {/* AI Participants */}
            {GD_PARTICIPANTS.map((p, i) => {
              const angle = (i * 360) / 5 - 90;
              const radius = 160;
              const x = Math.cos((angle * Math.PI) / 180) * radius;
              const y = Math.sin((angle * Math.PI) / 180) * radius;
              
              return (
                <motion.div
                  key={p.id}
                  className="absolute flex flex-col items-center gap-2"
                  style={{ x, y }}
                  animate={{
                    scale: activeSpeakerId === p.id ? 1.2 : 1,
                  }}
                >
                  <div className={`relative w-24 h-24 rounded-full border-4 transition-all duration-500 overflow-hidden ${activeSpeakerId === p.id ? 'border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.4)]' : 'border-zinc-800'}`}>
                    <img src={p.avatar} alt={p.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    {activeSpeakerId === p.id && (
                      <motion.div 
                        className="absolute inset-0 bg-emerald-500/20"
                        animate={{ opacity: [0.2, 0.5, 0.2] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                      />
                    )}
                  </div>
                  <span className="text-sm font-medium text-zinc-300">{p.name}</span>
                  <span className="text-[10px] uppercase tracking-wider text-zinc-500">{p.role}</span>
                </motion.div>
              );
            })}

            {/* User Participant */}
            <motion.div
              className="absolute flex flex-col items-center gap-2"
              style={{ 
                x: Math.cos((288 - 90) * Math.PI / 180) * 160, 
                y: Math.sin((288 - 90) * Math.PI / 180) * 160 
              }}
              animate={{ scale: activeSpeakerId === 'user' ? 1.2 : 1 }}
            >
              <div className={`relative w-24 h-24 rounded-full border-4 transition-all duration-500 bg-zinc-900 flex items-center justify-center ${activeSpeakerId === 'user' ? 'border-cyan-500 shadow-[0_0_30px_rgba(6,182,212,0.4)]' : 'border-zinc-800'}`}>
                <User size={40} className="text-zinc-600" />
                {isListening && (
                  <motion.div 
                    className="absolute inset-0 border-4 border-cyan-400 rounded-full"
                    animate={{ scale: [1, 1.2, 1], opacity: [1, 0, 1] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                  />
                )}
              </div>
              <span className="text-sm font-medium text-zinc-300">You</span>
            </motion.div>

            {/* Center Topic Display */}
            <div className="text-center max-w-xs">
              <h2 className="text-xl font-semibold text-zinc-400 italic">"{topic}"</h2>
            </div>
          </div>

          {/* Transcript / Chat Area */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-4 max-h-[400px] overflow-y-auto pr-4 custom-scrollbar">
              <AnimatePresence>
                {messages.map((m, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: m.isAI ? -20 : 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`flex flex-col ${m.isAI ? 'items-start' : 'items-end'}`}
                  >
                    <div className={`max-w-[80%] p-4 rounded-2xl ${m.isAI ? 'bg-zinc-900 text-zinc-200' : 'bg-emerald-600 text-white'}`}>
                      <p className="text-xs font-bold mb-1 opacity-50">{m.name}</p>
                      <p className="text-sm leading-relaxed">{m.content}</p>
                    </div>
                  </motion.div>
                ))}
                
                {isListening && transcript && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex flex-col items-end"
                  >
                    <div className="max-w-[80%] p-4 rounded-2xl bg-emerald-600/50 border border-emerald-500/30 text-white italic">
                      <p className="text-xs font-bold mb-1 opacity-50">You (Speaking...)</p>
                      <p className="text-sm leading-relaxed">{transcript}</p>
                    </div>
                  </motion.div>
                )}

                {isThinking && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex flex-col items-start"
                  >
                    <div className="max-w-[80%] p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800 text-zinc-500">
                      <div className="flex gap-1">
                        <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 bg-zinc-500 rounded-full" />
                        <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 bg-zinc-500 rounded-full" />
                        <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 bg-zinc-500 rounded-full" />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Real-time Feedback & Controls */}
            <div className="space-y-6">
              <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500">Live Analysis</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span>Pitch Accuracy</span>
                      <span>{Math.min(100, Math.round((pitch / 500) * 100))}%</span>
                    </div>
                    <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-cyan-500"
                        animate={{ width: `${Math.min(100, (pitch / 500) * 100)}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span>Voice Energy</span>
                      <span>{Math.round(volume)}%</span>
                    </div>
                    <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-emerald-500"
                        animate={{ width: `${Math.min(100, volume)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                {!isListening ? (
                  <button 
                    onClick={() => { startListening(); startAnalysis(); }}
                    disabled={isAITurn}
                    className={`py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${isAITurn ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' : 'bg-cyan-500 hover:bg-cyan-600 text-black'}`}
                  >
                    <Mic size={20} /> Speak Now
                  </button>
                ) : (
                  <button 
                    onClick={handleUserSubmit}
                    className="bg-red-500 hover:bg-red-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
                  >
                    <MicOff size={20} /> Stop & Submit
                  </button>
                )}
                <button 
                  onClick={endDiscussion}
                  className="border border-zinc-700 hover:bg-zinc-800 text-zinc-300 py-4 rounded-xl font-bold transition-all"
                >
                  End & Evaluate
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Evaluation Modal */}
      <AnimatePresence>
        {showEvaluation && evaluation && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 z-50"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-zinc-900 border border-zinc-800 max-w-4xl w-full rounded-3xl p-8 max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="text-3xl font-bold mb-2">Performance Report</h2>
                  <p className="text-zinc-400">Group Discussion: {topic}</p>
                </div>
                <button onClick={() => setShowEvaluation(false)} className="text-zinc-500 hover:text-white">
                  <RotateCcw size={24} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                {Object.entries(evaluation.scores).map(([key, value]: [string, any]) => (
                  <div key={key} className="bg-zinc-800/50 p-6 rounded-2xl text-center border border-zinc-700/50">
                    <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2">{key}</p>
                    <p className="text-4xl font-bold text-emerald-400">{value}%</p>
                  </div>
                ))}
              </div>

              <div className="space-y-8">
                <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-2xl">
                  <h3 className="text-lg font-bold text-emerald-400 mb-3 flex items-center gap-2">
                    <Award size={20} /> Overall Feedback
                  </h3>
                  <p className="text-zinc-300 leading-relaxed">{evaluation.feedback}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500">Key Strengths</h3>
                    <ul className="space-y-2">
                      {evaluation.strengths.map((s: string, i: number) => (
                        <li key={i} className="flex items-center gap-2 text-zinc-300">
                          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500">Areas for Improvement</h3>
                    <ul className="space-y-2">
                      {evaluation.weaknesses.map((w: string, i: number) => (
                        <li key={i} className="flex items-center gap-2 text-zinc-300">
                          <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                          {w}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => window.location.reload()}
                className="w-full mt-10 bg-white text-black font-bold py-4 rounded-xl hover:bg-zinc-200 transition-all"
              >
                Start New Session
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
