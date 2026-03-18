import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, MicOff, Play, Award, RotateCcw, Presentation, Upload, FileText, BarChart3 } from 'lucide-react';
import { 
  generateJudgeQuestions, 
  generateSpeech, 
  evaluatePerformance 
} from '../services/geminiService';
import { useSpeechToText, useAudioAnalysis } from '../hooks/useSpeech';

export default function PresentationRoom() {
  const [topic, setTopic] = useState('');
  const [isStarted, setIsStarted] = useState(false);
  const [transcriptText, setTranscriptText] = useState('');
  const [showEvaluation, setShowEvaluation] = useState(false);
  const [evaluation, setEvaluation] = useState<any>(null);
  const [slides, setSlides] = useState<string[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isQASession, setIsQASession] = useState(false);
  const [judgeQuestions, setJudgeQuestions] = useState<string[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isAITurn, setIsAITurn] = useState(false);
  
  const { isListening, transcript, startListening, stopListening } = useSpeechToText();
  const { pitch, volume, startAnalysis, stopAnalysis } = useAudioAnalysis();
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const startPresentation = () => {
    if (!topic) return;
    setIsStarted(true);
    setSlides([
      `Introduction to ${topic}`,
      `Key Challenges in ${topic}`,
      `Proposed Solutions & Innovation`,
      `Future Outlook & Conclusion`
    ]);
  };

  const handleStop = async () => {
    stopListening();
    stopAnalysis();
    setTranscriptText(prev => prev + ' ' + transcript);
  };

  const startQA = async () => {
    setIsQASession(true);
    const questions = await generateJudgeQuestions(topic, transcriptText + ' ' + transcript);
    setJudgeQuestions(questions);
    askJudgeQuestion(questions, 0);
  };

  const askJudgeQuestion = async (questions: string[], index: number) => {
    if (index >= questions.length) {
      setIsAITurn(false);
      return;
    }
    setIsAITurn(true);
    setCurrentQuestionIndex(index);
    const question = questions[index];
    
    // Use local TTS
    await generateSpeech(question);
    setIsAITurn(false);
  };

  const handleUserAnswer = async () => {
    stopListening();
    stopAnalysis();
    setTranscriptText(prev => prev + `\nJudge Question: ${judgeQuestions[currentQuestionIndex]}\nAnswer: ${transcript}`);
    
    if (currentQuestionIndex + 1 < judgeQuestions.length) {
      setTimeout(() => askJudgeQuestion(judgeQuestions, currentQuestionIndex + 1), 1000);
    } else {
      endPresentation();
    }
  };

  const endPresentation = async () => {
    const transcriptData = [{ name: 'Presenter', content: transcriptText }];
    const evalData = await evaluatePerformance('presentation', transcriptData);
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
          <div className="w-20 h-20 bg-amber-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-amber-500/30">
            <Presentation size={40} className="text-amber-400" />
          </div>
          <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
            Presentation Practice
          </h1>
          <p className="text-zinc-400 text-lg">
            Master your public speaking. Present your ideas to a virtual AI audience and get judged on clarity and flow.
          </p>
          <div className="space-y-4">
            <input 
              type="text"
              placeholder="Enter Presentation Topic"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
            <div className="flex gap-4">
              <button 
                onClick={startPresentation}
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-black font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <Play size={20} /> Start Presenting
              </button>
              <label className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer">
                <Upload size={20} /> Upload Slides
                <input type="file" className="hidden" />
              </label>
            </div>
          </div>
        </motion.div>
      ) : (
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Slide Viewer */}
            <div className="lg:col-span-3 space-y-6">
              <div className="aspect-video bg-zinc-900 rounded-3xl border border-zinc-800 flex flex-col items-center justify-center p-12 text-center shadow-2xl relative overflow-hidden">
                <div className="absolute top-6 left-6 flex items-center gap-2 text-zinc-500 text-xs font-bold uppercase tracking-widest">
                  <FileText size={14} /> Slide {currentSlide + 1} / {slides.length}
                </div>
                <motion.h2 
                  key={currentSlide}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-4xl font-bold text-zinc-200"
                >
                  {slides[currentSlide]}
                </motion.h2>
                <div className="mt-8 w-full max-w-md h-1 bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 w-1/3" />
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  {slides.map((_, i) => (
                    <button 
                      key={i}
                      onClick={() => setCurrentSlide(i)}
                      className={`w-3 h-3 rounded-full transition-all ${currentSlide === i ? 'bg-amber-500 w-8' : 'bg-zinc-800'}`}
                    />
                  ))}
                </div>
                <div className="flex gap-4">
                  <button 
                    onClick={() => setCurrentSlide(prev => Math.max(0, prev - 1))}
                    className="px-6 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm font-bold"
                  >
                    Previous
                  </button>
                  <button 
                    onClick={() => setCurrentSlide(prev => Math.min(slides.length - 1, prev + 1))}
                    className="px-6 py-2 bg-amber-500 text-black hover:bg-amber-600 rounded-lg text-sm font-bold"
                  >
                    Next Slide
                  </button>
                </div>
              </div>
            </div>

            {/* Audience & Analysis */}
            <div className="space-y-6">
              <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl space-y-6">
                <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                  <BarChart3 size={14} /> Live Metrics
                </h3>
                
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between text-[10px] mb-2 text-zinc-400">
                      <span>Speech Clarity</span>
                      <span>{Math.round(volume)}%</span>
                    </div>
                    <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                        animate={{ width: `${Math.min(100, volume)}%` }}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-[10px] mb-2 text-zinc-400">
                      <span>Pace & Flow</span>
                      <span>{Math.min(100, Math.round((pitch / 400) * 100))}%</span>
                    </div>
                    <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]"
                        animate={{ width: `${Math.min(100, (pitch / 400) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-zinc-800">
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-4">Virtual Audience</p>
                  <div className="flex -space-x-3 overflow-hidden">
                    {[1,2,3,4,5].map(i => (
                      <img 
                        key={i}
                        className="inline-block h-10 w-10 rounded-full ring-2 ring-zinc-900"
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=Audience${i}`}
                        alt="Audience"
                        referrerPolicy="no-referrer"
                      />
                    ))}
                    <div className="flex items-center justify-center h-10 w-10 rounded-full bg-zinc-800 ring-2 ring-zinc-900 text-[10px] font-bold">
                      +12
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                {isQASession ? (
                  <>
                    <div className="bg-indigo-500/10 border border-indigo-500/20 p-4 rounded-xl mb-2">
                      <p className="text-[10px] uppercase tracking-widest text-indigo-400 mb-1">Judge Question {currentQuestionIndex + 1}</p>
                      <p className="text-sm font-medium">{judgeQuestions[currentQuestionIndex] || "Generating question..."}</p>
                    </div>
                    {!isListening ? (
                      <button 
                        onClick={() => { startListening(); startAnalysis(); }}
                        disabled={isAITurn}
                        className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${isAITurn ? 'bg-zinc-800 text-zinc-500' : 'bg-indigo-500 hover:bg-indigo-600 text-white'}`}
                      >
                        <Mic size={20} /> Answer Judge
                      </button>
                    ) : (
                      <button 
                        onClick={handleUserAnswer}
                        className="w-full bg-red-500 hover:bg-red-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
                      >
                        <MicOff size={20} /> Submit Answer
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    {!isListening ? (
                      <button 
                        onClick={() => { startListening(); startAnalysis(); }}
                        className="w-full py-4 bg-amber-500 hover:bg-amber-600 text-black rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/20"
                      >
                        <Mic size={20} /> Start Speaking
                      </button>
                    ) : (
                      <button 
                        onClick={handleStop}
                        className="w-full bg-red-500 hover:bg-red-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
                      >
                        <MicOff size={20} /> Pause Speech
                      </button>
                    )}
                    <button 
                      onClick={startQA}
                      className="w-full border border-zinc-700 hover:bg-zinc-800 text-zinc-300 py-4 rounded-xl font-bold transition-all"
                    >
                      Finish & Start Q&A
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Real-time Transcript Preview */}
          <div className="bg-zinc-900/30 border border-zinc-800/50 p-6 rounded-2xl">
            <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-4">Live Transcript Preview</p>
            <p className="text-zinc-400 italic text-sm leading-relaxed">
              {transcript || "Your speech will appear here as you talk..."}
            </p>
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
                  <h2 className="text-3xl font-bold mb-2">Presentation Evaluation</h2>
                  <p className="text-zinc-400">Topic: {topic}</p>
                </div>
                <button onClick={() => setShowEvaluation(false)} className="text-zinc-500 hover:text-white">
                  <RotateCcw size={24} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                {Object.entries(evaluation.scores).map(([key, value]: [string, any]) => (
                  <div key={key} className="bg-zinc-800/50 p-6 rounded-2xl text-center border border-zinc-700/50">
                    <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2">{key}</p>
                    <p className="text-4xl font-bold text-amber-400">{value}%</p>
                  </div>
                ))}
              </div>

              <div className="space-y-8">
                <div className="bg-amber-500/10 border border-amber-500/20 p-6 rounded-2xl">
                  <h3 className="text-lg font-bold text-amber-400 mb-3 flex items-center gap-2">
                    <Award size={20} /> Judge's Verdict
                  </h3>
                  <p className="text-zinc-300 leading-relaxed">{evaluation.feedback}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500">Strengths</h3>
                    <ul className="space-y-2">
                      {evaluation.strengths.map((s: string, i: number) => (
                        <li key={i} className="flex items-center gap-2 text-zinc-300">
                          <div className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500">Areas to Improve</h3>
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
                Practice Again
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
