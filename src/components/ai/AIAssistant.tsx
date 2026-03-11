import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useAuthStore } from '../../store/authStore';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AIAssistantProps {
  currentPage?: string;
  appointmentCount?: number;
  pendingNotes?: number;
  activePatients?: number;
}

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

// ─── Text-to-speech helper ────────────────────────────────────────────────
function speak(text: string) {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.95;
  utterance.pitch = 1;
  utterance.volume = 1;
  // Prefer an English voice if available
  const voices = window.speechSynthesis.getVoices();
  const preferred = voices.find(v => v.lang.startsWith('en') && v.localService);
  if (preferred) utterance.voice = preferred;
  window.speechSynthesis.speak(utterance);
}

function stopSpeaking() {
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
}

// ─── Quick-train topic buttons ────────────────────────────────────────────
const TRAINING_TOPICS = [
  { label: 'Dashboard',    prompt: 'Train me on the Dashboard — give me a complete visual walkthrough of every element.' },
  { label: 'Patients',     prompt: 'Train me on Patients — walk me through registering a new patient, searching, and editing step by step.' },
  { label: 'Appointments', prompt: 'Train me on Appointments — show me the calendar, how to schedule, and how to change appointment status.' },
  { label: 'Time Clock',   prompt: 'Train me on the Time Clock — walk me through clocking in, breaks, and clocking out step by step.' },
  { label: 'Reminders',    prompt: 'Train me on Reminders — explain every feature and show me how to send a reminder to a patient.' },
  { label: 'Staff',        prompt: 'Train me on Staff management — how to add, edit, and deactivate staff members.' },
  { label: 'Payroll',      prompt: 'Train me on Payroll — walk me through generating, approving, and paying a payroll cycle.' },
  { label: 'OptimumAI',   prompt: 'Train me on how to use OptimumAI — all features including voice, text-to-speech, and training mode.' },
];

export function AIAssistant({ currentPage, appointmentCount, pendingNotes, activePatients }: AIAssistantProps) {
  const { staff } = useAuthStore();
  const [open, setOpen]             = useState(false);
  const [messages, setMessages]     = useState<Message[]>([]);
  const [input, setInput]           = useState('');
  const [loading, setLoading]       = useState(false);
  const [listening, setListening]   = useState(false);
  const [speakEnabled, setSpeakEnabled] = useState(false);
  const [showTopics, setShowTopics] = useState(false);

  const bottomRef     = useRef<HTMLDivElement>(null);
  const inputRef      = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);

  const hasSpeech = typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
  const hasTTS = typeof window !== 'undefined' && 'speechSynthesis' in window;

  const isTrainingPage = currentPage === 'training';

  // ── Greeting on open ───────────────────────────────────────────────────
  useEffect(() => {
    if (open && messages.length === 0) {
      const greeting = isTrainingPage
        ? `Hi ${staff?.first_name ?? 'there'}! I'm OptimumAI. I'm in Training Mode — I can walk you through any part of the app step by step, visually and verbally. Pick a topic below or ask me anything!`
        : `Hi ${staff?.first_name ?? 'there'}! I'm OptimumAI, your clinic assistant. Type or tap 🎤 to speak. How can I help?`;
      setMessages([{ role: 'assistant', content: greeting }]);
      if (speakEnabled) speak(greeting);
    }
  }, [open]);

  // ── Auto-scroll ────────────────────────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // ── Focus input when opened ────────────────────────────────────────────
  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  // ── Cleanup TTS + recognition on unmount ──────────────────────────────
  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
      stopSpeaking();
    };
  }, []);

  // ── Stop speaking when disabled ───────────────────────────────────────
  useEffect(() => {
    if (!speakEnabled) stopSpeaking();
  }, [speakEnabled]);

  // ── Speech recognition ────────────────────────────────────────────────
  const startListening = () => {
    if (!hasSpeech) return;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SR();
    recognitionRef.current = recognition;
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onstart  = () => setListening(true);
    recognition.onend    = () => setListening(false);
    recognition.onerror  = () => setListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(prev => (prev ? prev + ' ' + transcript : transcript));
    };
    recognition.start();
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setListening(false);
  };

  // ── Send message ──────────────────────────────────────────────────────
  const send = useCallback(async (overrideText?: string) => {
    const text = (overrideText ?? input).trim();
    if (!text || loading) return;

    const userMessage: Message = { role: 'user', content: text };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setShowTopics(false);
    setLoading(true);

    try {
      const context = {
        userName: `${staff?.first_name} ${staff?.last_name}`,
        userRole: staff?.role,
        currentPage,
        today: new Date().toLocaleDateString('en-US'),
        appointmentCount,
        pendingNotes,
        activePatients,
        trainingMode: isTrainingPage,
      };

      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
          context,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const reply = data.content as string;
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
      if (speakEnabled) speak(reply);
    } catch (err: any) {
      const errMsg = `Error: ${err?.message || 'Unknown error'}`;
      setMessages(prev => [...prev, { role: 'assistant', content: errMsg }]);
      if (speakEnabled) speak(errMsg);
    } finally {
      setLoading(false);
    }
  }, [input, messages, loading, staff, currentPage, appointmentCount, pendingNotes, activePatients, speakEnabled, isTrainingPage]);

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-white text-teal-600 shadow-lg flex items-center justify-center transition-all hover:scale-105"
        title="OptimumAI Assistant"
      >
        {open ? (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        )}
      </button>

      {/* Chat panel */}
      {open && (
        <div
          className="fixed bottom-24 right-6 z-50 bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden"
          style={{ width: '22rem', height: isTrainingPage ? '600px' : '520px' }}
        >
          {/* ── Header ── */}
          <div className="bg-teal-600 px-4 py-3 flex items-center gap-3 flex-shrink-0">
            <div className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="text-white font-semibold text-sm">OptimumAI</div>
              <div className="text-teal-200 text-xs">
                {isTrainingPage ? 'Training Mode Active' : 'Clinic Assistant'}
              </div>
            </div>

            {/* TTS toggle */}
            {hasTTS && (
              <button
                onClick={() => setSpeakEnabled(s => !s)}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors flex-shrink-0 ${
                  speakEnabled ? 'bg-white text-teal-600' : 'bg-teal-500 text-teal-100 hover:bg-teal-400'
                }`}
                title={speakEnabled ? 'Mute voice' : 'Enable voice output'}
              >
                {speakEnabled ? (
                  /* Speaker ON */
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M15.536 8.464a5 5 0 010 7.072M12 6v12m0 0l-3-3m3 3l3-3M9 9H5a1 1 0 00-1 1v4a1 1 0 001 1h4l4 4V5L9 9z" />
                  </svg>
                ) : (
                  /* Speaker OFF */
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                  </svg>
                )}
              </button>
            )}

            {/* Topics toggle (training page) */}
            {isTrainingPage && (
              <button
                onClick={() => setShowTopics(s => !s)}
                className="w-8 h-8 rounded-lg bg-teal-500 hover:bg-teal-400 text-white flex items-center justify-center flex-shrink-0"
                title="Quick Training Topics"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                </svg>
              </button>
            )}
          </div>

          {/* ── Training Mode Badge ── */}
          {isTrainingPage && (
            <div className="bg-teal-50 border-b border-teal-100 px-4 py-2 flex items-center gap-2 flex-shrink-0">
              <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse flex-shrink-0" />
              <span className="text-xs text-teal-700 font-medium">
                Training Mode — Visual &amp; Oral step-by-step guidance active
              </span>
              {hasTTS && (
                <span className="ml-auto text-xs text-teal-500">
                  {speakEnabled ? '🔊 Voice ON' : '🔇 Voice OFF'}
                </span>
              )}
            </div>
          )}

          {/* ── Quick Topics Panel ── */}
          {showTopics && (
            <div className="border-b border-gray-200 p-3 bg-gray-50 flex-shrink-0">
              <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Train me on…</p>
              <div className="grid grid-cols-2 gap-1.5">
                {TRAINING_TOPICS.map(t => (
                  <button
                    key={t.label}
                    onClick={() => send(t.prompt)}
                    className="text-left text-xs bg-white border border-teal-200 text-teal-700 rounded-lg px-2 py-1.5 hover:bg-teal-50 hover:border-teal-400 transition-colors font-medium"
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Messages ── */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <div className="w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center mr-2 flex-shrink-0 mt-1">
                    <span className="text-teal-600 text-xs font-bold">AI</span>
                  </div>
                )}
                <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'bg-teal-600 text-white rounded-br-sm'
                    : 'bg-white text-gray-800 border border-gray-200 rounded-bl-sm shadow-sm'
                }`}>
                  {msg.content}
                  {/* Re-read button for AI messages */}
                  {msg.role === 'assistant' && hasTTS && (
                    <button
                      onClick={() => speak(msg.content)}
                      className="mt-1 text-xs text-gray-400 hover:text-teal-500 block"
                      title="Read aloud"
                    >
                      🔊 Read aloud
                    </button>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center mr-2 flex-shrink-0">
                  <span className="text-teal-600 text-xs font-bold">AI</span>
                </div>
                <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* ── Input Row ── */}
          <div className="p-3 border-t border-gray-200 bg-white flex gap-2 items-end flex-shrink-0">
            {hasSpeech && (
              <button
                onClick={listening ? stopListening : startListening}
                className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                  listening
                    ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                }`}
                title={listening ? 'Stop listening' : 'Speak'}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </button>
            )}

            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder={listening ? 'Listening...' : isTrainingPage ? 'Ask to train you on anything…' : 'Ask anything or tap 🎤'}
              rows={1}
              className="flex-1 resize-none border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              style={{ maxHeight: '100px' }}
            />

            <button
              onClick={() => send()}
              disabled={!input.trim() || loading}
              className="w-9 h-9 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-40 text-white flex items-center justify-center flex-shrink-0 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
