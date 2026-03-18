import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, MicOff, Play, User, Award, RotateCcw, MessageSquare, Briefcase } from 'lucide-react';
import { generateInterviewQuestion, generateSpeech, evaluatePerformance } from '../services/geminiService';
import { useSpeechToText, useAudioAnalysis } from '../hooks/useSpeech';

interface InterviewRoomProps {
  type: 'technical' | 'managerial' | 'hr';
}

export default function InterviewRoom({ type }: InterviewRoomProps) {
  const [role, setRole] = useState('');
  const [isStarted, setIsStarted] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'model'; content: string }[]>([]);
  const [isAITurn, setIsAITurn] = useState(false);
  const [showEvaluation, setShowEvaluation] = useState(false);
  const [evaluation, setEvaluation] = useState<any>(null);
  
  const { isListening, transcript, startListening, stopListening } = useSpeechToText();
  const { pitch, volume, startAnalysis, stopAnalysis } = useAudioAnalysis();
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const typeLabels = {
    technical: 'Technical Interview',
    managerial: 'Managerial Interview',
    hr: 'HR Interview'
  };

  const startInterview = async () => {
    if (!role) return;
    setIsStarted(true);
    await askNextQuestion([]);
  };

  const askNextQuestion = async (history: { role: 'user' | 'model'; content: string }[]) => {
    setIsAITurn(true);
    // Include the interview type in the role description for better context
    const contextRole = `${type.toUpperCase()} Interview for ${role}`;
    const question = await generateInterviewQuestion(contextRole, history);
    
    setMessages(prev => [...prev, { role: 'model', content: question }]);
    
    // Use local TTS
    await generateSpeech(question);
    setIsAITurn(false);
  };

  const handleUserSubmit = async () => {
    stopListening();
    stopAnalysis();
    
    if (!transcript) return;
    
    const newMessages = [...messages, { role: 'user' as const, content: transcript }];
    setMessages(newMessages);
    
    setTimeout(() => askNextQuestion(newMessages), 1000);
  };

  const endInterview = async () => {
    const transcriptData = messages.map(m => ({ name: m.role === 'model' ? 'Interviewer' : 'Candidate', content: m.content }));
    const evalData = await evaluatePerformance('interview', transcriptData);
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
          <div className="w-20 h-20 bg-indigo-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-indigo-500/30">
            <Briefcase size={40} className="text-indigo-400" />
          </div>
          <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            {typeLabels[type]}
          </h1>
          <p className="text-zinc-400 text-lg">
            Face a professional AI interviewer for your {type} round. Get dynamic questions and instant feedback.
          </p>
          <div className="space-y-4">
            <input 
              type="text"
              placeholder="Enter Job Role (e.g., Software Engineer, Product Manager)"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            />
            <button 
              onClick={startInterview}
              className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
            >
              <Play size={20} /> Start Interview
            </button>
          </div>
        </motion.div>
      ) : (
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Interviewer View */}
          <div className="lg:col-span-1 space-y-8">
            <div className="relative aspect-square rounded-3xl overflow-hidden border border-zinc-800 bg-zinc-900 shadow-2xl">
              <img 
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${type === 'technical' ? 'Tech' : type === 'managerial' ? 'Manager' : 'HR'}`} 
                alt="Interviewer" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              {isAITurn && (
                <motion.div 
                  className="absolute inset-0 border-4 border-indigo-500"
                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                />
              )}
              <div className="absolute bottom-4 left-4 right-4 bg-black/60 backdrop-blur-md p-3 rounded-xl border border-white/10">
                <p className="text-xs font-bold uppercase tracking-widest text-indigo-400">AI Interviewer</p>
                <p className="text-sm font-medium">{typeLabels[type]}</p>
              </div>
            </div>

            <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500">Voice Analysis</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-[10px] mb-1">
                    <span>Pitch</span>
                    <span>{Math.round(pitch)}Hz</span>
                  </div>
                  <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-indigo-500"
                      animate={{ width: `${Math.min(100, (pitch / 500) * 100)}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[10px] mb-1">
                    <span>Volume</span>
                    <span>{Math.round(volume)}%</span>
                  </div>
                  <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-purple-500"
                      animate={{ width: `${Math.min(100, volume)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Conversation Area */}
          <div className="lg:col-span-2 flex flex-col h-[600px]">
            <div className="flex-1 overflow-y-auto space-y-6 pr-4 custom-scrollbar mb-6">
              <AnimatePresence>
                {messages.map((m, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${m.role === 'model' ? 'justify-start' : 'justify-end'}`}
                  >
                    <div className={`max-w-[85%] p-5 rounded-2xl ${m.role === 'model' ? 'bg-zinc-900 border border-zinc-800 text-zinc-200' : 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'}`}>
                      <p className="text-sm leading-relaxed">{m.content}</p>
                    </div>
                  </motion.div>
                ))}
                
                {isListening && transcript && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-end"
                  >
                    <div className="max-w-[85%] p-5 rounded-2xl bg-indigo-600/50 border border-indigo-500/30 text-white italic">
                      <p className="text-sm leading-relaxed">{transcript}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex gap-4">
              {!isListening ? (
                <button 
                  onClick={() => { startListening(); startAnalysis(); }}
                  disabled={isAITurn}
                  className={`flex-1 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${isAITurn ? 'bg-zinc-800 text-zinc-500' : 'bg-indigo-500 hover:bg-indigo-600 text-white'}`}
                >
                  <Mic size={20} /> Answer Question
                </button>
              ) : (
                <button 
                  onClick={handleUserSubmit}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
                >
                  <MicOff size={20} /> Stop & Submit
                </button>
              )}
              <button 
                onClick={endInterview}
                className="px-6 border border-zinc-700 hover:bg-zinc-800 text-zinc-300 rounded-xl font-bold transition-all"
              >
                End Session
              </button>
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
                  <h2 className="text-3xl font-bold mb-2">Interview Performance</h2>
                  <p className="text-zinc-400">{typeLabels[type]} for {role}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest border ${
                    evaluation.result === 'Selected' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                    evaluation.result === 'Waitlisted' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                    'bg-red-500/10 text-red-400 border-red-500/20'
                  }`}>
                    {evaluation.result}
                  </div>
                  <button onClick={() => setShowEvaluation(false)} className="text-zinc-500 hover:text-white">
                    <RotateCcw size={24} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                {Object.entries(evaluation.scores).map(([key, value]: [string, any]) => (
                  <div key={key} className="bg-zinc-800/50 p-6 rounded-2xl text-center border border-zinc-700/50">
                    <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2">{key}</p>
                    <p className="text-4xl font-bold text-indigo-400">{value}%</p>
                  </div>
                ))}
              </div>

              <div className="space-y-8">
                <div className="bg-indigo-500/10 border border-indigo-500/20 p-6 rounded-2xl">
                  <h3 className="text-lg font-bold text-indigo-400 mb-3 flex items-center gap-2">
                    <Award size={20} /> Interviewer Feedback
                  </h3>
                  <p className="text-zinc-300 leading-relaxed">{evaluation.feedback}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500">Strengths</h3>
                    <ul className="space-y-2">
                      {evaluation.strengths.map((s: string, i: number) => (
                        <li key={i} className="flex items-center gap-2 text-zinc-300">
                          <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500">Weaknesses</h3>
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
                Return to Dashboard
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
