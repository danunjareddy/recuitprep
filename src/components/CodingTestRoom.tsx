import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Code, Play, CheckCircle2, AlertCircle, RotateCcw, Award, ChevronRight } from 'lucide-react';
import { generateCodingTest, evaluatePerformance } from '../services/geminiService';

export default function CodingTestRoom() {
  const [topic, setTopic] = useState('');
  const [isStarted, setIsStarted] = useState(false);
  const [testData, setTestData] = useState<any>(null);
  const [userAnswers, setUserAnswers] = useState<string[]>([]);
  const [userCode, setUserCode] = useState('');
  const [showEvaluation, setShowEvaluation] = useState(false);
  const [evaluation, setEvaluation] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const startTest = async () => {
    if (!topic) return;
    setIsLoading(true);
    const data = await generateCodingTest(topic);
    setTestData(data);
    setUserAnswers(new Array(data.mcqs.length).fill(''));
    setIsStarted(true);
    setIsLoading(false);
  };

  const submitTest = async () => {
    const transcript = {
      dsa_solution: userCode,
      mcq_answers: testData.mcqs.map((m: any, i: number) => ({
        question: m.question,
        userAnswer: userAnswers[i],
        correctAnswer: m.answer
      }))
    };
    const evalData = await evaluatePerformance('coding', transcript);
    setEvaluation(evalData);
    setShowEvaluation(true);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-8 font-sans">
      {!isStarted ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto mt-20 text-center space-y-8"
        >
          <div className="w-20 h-20 bg-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-purple-500/30">
            <Code size={40} className="text-purple-400" />
          </div>
          <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Coding & Technical Test
          </h1>
          <p className="text-zinc-400 text-lg">
            Test your problem-solving skills with AI-generated DSA challenges and technical MCQs.
          </p>
          <div className="space-y-4">
            <input 
              type="text"
              placeholder="Enter Technology (e.g., React, Python, Data Structures)"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
            <button 
              onClick={startTest}
              disabled={isLoading}
              className="w-full bg-purple-500 hover:bg-purple-600 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? "Generating Test..." : <><Play size={20} /> Start Test</>}
            </button>
          </div>
        </motion.div>
      ) : (
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* DSA Problem */}
          <div className="space-y-6">
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 space-y-6">
              <div className="flex items-center gap-3 text-purple-400">
                <Code size={24} />
                <h2 className="text-xl font-bold">DSA Challenge: {testData.dsa.title}</h2>
              </div>
              <div className="prose prose-invert max-w-none">
                <p className="text-zinc-300 leading-relaxed">{testData.dsa.description}</p>
                <div className="bg-black/50 p-4 rounded-xl border border-zinc-800 mt-4">
                  <p className="text-xs font-bold text-zinc-500 uppercase mb-2">Constraints</p>
                  <p className="text-sm font-mono">{testData.dsa.constraints}</p>
                </div>
                <div className="bg-black/50 p-4 rounded-xl border border-zinc-800 mt-4">
                  <p className="text-xs font-bold text-zinc-500 uppercase mb-2">Example</p>
                  <pre className="text-sm font-mono whitespace-pre-wrap">{testData.dsa.example}</pre>
                </div>
              </div>
              <textarea 
                className="w-full h-64 bg-black border border-zinc-800 rounded-xl p-4 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="// Write your solution here..."
                value={userCode}
                onChange={(e) => setUserCode(e.target.value)}
              />
            </div>
          </div>

          {/* MCQs */}
          <div className="space-y-6">
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 space-y-8">
              <div className="flex items-center gap-3 text-pink-400">
                <CheckCircle2 size={24} />
                <h2 className="text-xl font-bold">Technical MCQs</h2>
              </div>
              
              {testData.mcqs.map((m: any, i: number) => (
                <div key={i} className="space-y-4">
                  <p className="text-zinc-200 font-medium">{i + 1}. {m.question}</p>
                  <div className="grid grid-cols-1 gap-3">
                    {m.options.map((opt: string) => (
                      <button 
                        key={opt}
                        onClick={() => {
                          const newAnswers = [...userAnswers];
                          newAnswers[i] = opt;
                          setUserAnswers(newAnswers);
                        }}
                        className={`text-left p-4 rounded-xl border transition-all text-sm ${userAnswers[i] === opt ? 'bg-purple-500/20 border-purple-500 text-purple-300' : 'bg-zinc-800/50 border-zinc-800 text-zinc-400 hover:border-zinc-700'}`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              <button 
                onClick={submitTest}
                className="w-full bg-white text-black font-bold py-4 rounded-xl hover:bg-zinc-200 transition-all shadow-lg"
              >
                Submit Test
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
                  <h2 className="text-3xl font-bold mb-2">Coding Test Result</h2>
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
                    <p className="text-4xl font-bold text-purple-400">{value}%</p>
                  </div>
                ))}
              </div>

              <div className="space-y-8">
                <div className={`p-6 rounded-2xl border ${evaluation.result === 'Selected' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                  <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                    <Award size={20} /> Test Outcome: {evaluation.result}
                  </h3>
                  <p className="text-zinc-300 leading-relaxed">{evaluation.feedback}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500">Strengths</h3>
                    <ul className="space-y-2">
                      {evaluation.strengths.map((s: string, i: number) => (
                        <li key={i} className="flex items-center gap-2 text-zinc-300">
                          <div className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
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
                Try Another Test
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
