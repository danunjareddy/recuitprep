// Ollama Integration Helper
async function callOllama(prompt: string, model: string = "llama3", isJson: boolean = false) {
  const ollamaUrl = localStorage.getItem('ollama_url') || 'http://localhost:11434/api/generate';
  try {
    const response = await fetch(ollamaUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: model,
        prompt: prompt,
        stream: false,
        format: isJson ? "json" : undefined
      })
    });
    const data = await response.json();
    return data.response;
  } catch (error) {
    console.error("Ollama error:", error);
    // Fallback message if Ollama is not running
    return isJson ? "{}" : "I'm sorry, I'm having trouble connecting to my local brain (Ollama). Please ensure it's running with OLLAMA_ORIGINS='*' ollama serve";
  }
}

async function getAIResponse(prompt: string, systemInstruction: string, history: any[] = [], isJson: boolean = false) {
  const fullPrompt = `System: ${systemInstruction}\n\nContext: ${JSON.stringify(history)}\n\nUser: ${prompt}\n\nAssistant:`;
  return await callOllama(fullPrompt, "llama3", isJson);
}

export interface Participant {
  id: string;
  name: string;
  role: string;
  avatar: string;
  personality: string;
}

export const GD_PARTICIPANTS: Participant[] = [
  {
    id: "ai-1",
    name: "Alex",
    role: "Analytical Thinker",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
    personality: "Focuses on data, statistics, and logical consistency. Very objective."
  },
  {
    id: "ai-2",
    name: "Sarah",
    role: "Empathetic Supporter",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    personality: "Focuses on the human element, social impact, and emotional intelligence."
  },
  {
    id: "ai-3",
    name: "David",
    role: "Critical Challenger",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=David",
    personality: "Plays devil's advocate, looks for flaws in arguments, and asks tough questions."
  },
  {
    id: "ai-4",
    name: "Maya",
    role: "Creative Visionary",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Maya",
    personality: "Focuses on future possibilities, innovation, and out-of-the-box solutions."
  }
];

export async function generateGDResponse(
  topic: string,
  history: { role: string; content: string; name?: string }[],
  participant: Participant
) {
  const systemInstruction = `You are ${participant.name}, a participant in a Group Discussion about "${topic}". 
  Your role is ${participant.role}. 
  Your personality: ${participant.personality}.
  Keep your response concise (2-3 sentences). 
  Interact with previous points made by others. 
  Do not sound like an AI; sound like a professional candidate in a recruitment round.`;

  return await getAIResponse(`Provide your response to the discussion.`, systemInstruction, history);
}

export async function generateInterviewQuestion(
  jobRole: string,
  history: { role: string; content: string }[],
  type: 'technical' | 'managerial' | 'hr' = 'hr'
) {
  const systemInstruction = `You are an expert ${type} interviewer for a ${jobRole} position. 
  Ask one professional question at a time. 
  If the user has already answered a question, provide a brief follow-up or move to the next logical topic. 
  For technical: focus on DSA, OOP, DBMS, OS.
  For managerial: focus on leadership, situational, and stress questions.
  For HR: focus on culture fit, salary, and strengths/weaknesses.
  Be professional and slightly formal.`;

  return await getAIResponse(`Ask the next question.`, systemInstruction, history);
}

export async function generateJudgeQuestions(topic: string, transcript: string) {
  const systemInstruction = `You are a panel of judges evaluating a presentation on "${topic}". 
  Based on the transcript: "${transcript}", ask 2-3 challenging but fair questions to the presenter. 
  Return the questions as a JSON object with a "questions" key containing an array of strings.`;

  const response = await getAIResponse(`Generate judge questions for the presentation.`, systemInstruction, [], true);
  try {
    const data = JSON.parse(response);
    return data.questions || [];
  } catch (e) {
    return ["Can you elaborate on your core findings?", "What were the main challenges you faced?"];
  }
}

export async function generateCodingTest(topic: string) {
  const systemInstruction = `Generate a coding test for "${topic}". 
  Include:
  1. One DSA problem (title, description, constraints, example).
  2. Three technical MCQs with options and correct answers.
  Return as a JSON object with keys: "dsa" (object with title, description, constraints, example) and "mcqs" (array of objects with question, options, answer).`;

  const response = await getAIResponse(`Generate coding test.`, systemInstruction, [], true);
  try {
    return JSON.parse(response);
  } catch (e) {
    return { dsa: { title: "Error", description: "Failed to generate test" }, mcqs: [] };
  }
}

export async function evaluatePerformance(
  type: 'gd' | 'interview' | 'presentation' | 'coding' | 'aptitude',
  transcript: any
) {
  const systemInstruction = `Evaluate the user's performance in this ${type} session based on the provided data.
    Provide a detailed evaluation in JSON format with:
    - scores: { clarity: number, relevance: number, confidence: number, structure: number } (all 0-100)
    - feedback: string (constructive suggestions)
    - strengths: string[]
    - weaknesses: string[]
    - result: 'Selected' | 'Rejected' | 'Waitlisted'`;

  const response = await getAIResponse(`Evaluate performance: ${JSON.stringify(transcript)}`, systemInstruction, [], true);
  try {
    return JSON.parse(response);
  } catch (e) {
    return { scores: { clarity: 0, relevance: 0, confidence: 0, structure: 0 }, feedback: "Evaluation failed", strengths: [], weaknesses: [], result: "Waitlisted" };
  }
}

// Local TTS using Web Speech API
export async function generateSpeech(text: string): Promise<string | null> {
  return new Promise((resolve) => {
    if (!('speechSynthesis' in window)) {
      resolve(null);
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.name.includes('Google') || v.name.includes('Female') || v.lang === 'en-US');
    if (preferredVoice) utterance.voice = preferredVoice;

    utterance.onend = () => {
      resolve('speech-finished');
    };

    utterance.onerror = (e) => {
      console.error("Speech error:", e);
      resolve(null);
    };

    window.speechSynthesis.speak(utterance);
    
    // Safety timeout in case onend doesn't fire
    setTimeout(() => resolve('speech-finished'), text.length * 100); 
  });
}
