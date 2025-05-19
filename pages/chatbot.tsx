// pages/chatbot.tsx with Echonest branding
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Header from '../components/Header';
import EchonestLogo from '../components/EchonestLogo';

export default function ChatbotPage() {
  const router = useRouter();
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<Array<{type: 'user' | 'bot', content: string}>>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState<string | null>(null);
  const [botInfo, setBotInfo] = useState<{
    name?: string;
    type?: string;
    tone?: string;
  }>({});
  const [showSettings, setShowSettings] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Animation states
  const [typingText, setTypingText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (router.isReady) {
      const queryPrompt = router.query.prompt;
      const useAutoGreeting = router.query.useAutoGreeting !== 'false'; // Check for greeting flag
      
      if (typeof queryPrompt === 'string') {
        const decoded = decodeURIComponent(queryPrompt);
        setPrompt(decoded);
        console.log('✅ Loaded bot prompt:', decoded);
        
        // Extract bot info from prompt
        const nameMatch = decoded.match(/for\s+([^,\.]+)/i);
        const typeMatch = decoded.match(/(support|sales|booking)\s+bot/i);
        const toneMatch = decoded.match(/helpful and\s+([a-zA-Z]+)/i);
        
        setBotInfo({
          name: nameMatch?.[1]?.trim() || 'Company',
          type: typeMatch?.[1] || 'assistant',
          tone: toneMatch?.[1] || 'friendly'
        });
        
        // Only use auto-greeting if the flag is true (which it won't be by default now)
        if (useAutoGreeting) {
          setTimeout(() => {
            const welcomeMessage = getWelcomeMessage(
              nameMatch?.[1]?.trim() || 'Company',
              toneMatch?.[1] || 'friendly'
            );
            simulateTyping(welcomeMessage);
          }, 1000);
        } else {
          // Use AI-generated greeting instead with stronger language instruction
          setTimeout(async () => {
            setLoading(true);
            try {
              const res = await fetch('/api/chat-with-bot', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                  message: "[GREETING_REQUEST] Please provide a greeting using ONLY the language of the FAQ. If the FAQ is in Dutch, greet in Dutch. If in German, greet in German, etc. DO NOT use English unless the FAQ itself is in English.", 
                  prompt: decoded
                })
              });
              
              const data = await res.json();
              console.log('AI Greeting response:', data.response); // Debug log
              
              if (data.response) {
                simulateTyping(data.response);
              } else {
                // Fallback only if no response
                simulateTyping("Hello! How can I help you today?");
              }
            } catch (err) {
              console.error(err);
              // Fallback
              simulateTyping("Hello! How can I help you today?");
            }
            setLoading(false);
          }, 1000);
        }
      }
    }
  }, [router.isReady, router.query.prompt]);

  const getWelcomeMessage = (company: string, tone: string) => {
    switch(tone) {
      case 'friendly':
        return `Hi there! 👋 Welcome to ${company}! I'm your virtual assistant. How can I help you today?`;
      case 'formal':
        return `Welcome to ${company}. I'm your dedicated virtual assistant. How may I be of service today?`;
      case 'casual':
        return `Hey! What's up? 😎 I'm the ${company} bot here to help. Got any questions?`;
      default:
        return `Welcome to ${company}! How can I help you today?`;
    }
  };

  const getBotIcon = () => {
    switch(botInfo.type) {
      case 'support': return '👨‍💻';
      case 'sales': return '💼';
      case 'booking': return '📅';
      default: return '🤖';
    }
  };

  const simulateTyping = (text: string) => {
    if (!text || text.length === 0) {
      return; // Guard against empty texts
    }
    
    setIsTyping(true);
    
    // Start with the first two characters to fix the disappearing letter issue
    setTypingText(text.substring(0, 2));
    
    let index = 2; // Start from the third character
    const speed = 15; // milliseconds per character
    
    const typeNextChar = () => {
      if (index < text.length) {
        setTypingText(text.substring(0, index + 1)); // Use substring instead of adding characters
        index++;
        setTimeout(typeNextChar, speed);
      } else {
        // Once done typing, update messages state
        setMessages(prev => [...prev, { type: 'bot', content: text }]);
        setTypingText('');
        setIsTyping(false);
      }
    };
    
    // Only start the typing animation if there are more than 2 characters
    if (text.length > 2) {
      setTimeout(() => typeNextChar(), speed);
    } else {
      // For very short messages, just show them directly
      setMessages(prev => [...prev, { type: 'bot', content: text }]);
      setTypingText('');
      setIsTyping(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, typingText]);

  const sendMessage = async () => {
    if (!prompt || !input.trim()) return;
    
    // Add user message immediately
    setMessages(prev => [...prev, { type: 'user', content: input }]);
    
    const userInput = input;
    setInput('');
    setLoading(true);
    
    try {
      const res = await fetch('/api/chat-with-bot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userInput, prompt })
      });
      
      const data = await res.json();
      simulateTyping(data.response);
    } catch (err) {
      console.error(err);
      simulateTyping("I'm sorry, I encountered an error. Please try again.");
    }
    
    setLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const runBotTest = async () => {
    if (!prompt) {
      alert('Missing bot prompt!');
      return;
    }
    
    setTestResults('⏳ Running AI evaluation...');
    
    try {
      const res = await fetch('/api/test-bot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
      
      const data = await res.json();
      setTestResults(data.feedback || 'No feedback returned.');
    } catch (err) {
      console.error(err);
      setTestResults('❌ Test failed.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
      {/* Header bar */}
      <header className="bg-gray-800 bg-opacity-70 backdrop-filter backdrop-blur-lg border-b border-gray-700 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="text-2xl bg-gradient-to-r from-blue-500 to-purple-500 rounded-full w-10 h-10 flex items-center justify-center">
              {getBotIcon()}
            </div>
            <div>
              <h1 className="font-bold leading-tight">{botInfo.name} <span className="capitalize">{botInfo.type}</span></h1>
              <p className="text-xs text-gray-400">Tone: <span className="capitalize">{botInfo.tone}</span></p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/dashboard">
              <button className="text-gray-400 hover:text-white transition flex items-center mr-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                </svg>
                <span className="ml-1">Dashboard</span>
              </button>
            </Link>
            <button 
              onClick={() => setShowSettings(!showSettings)}
              className="text-gray-400 hover:text-white transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
            </button>
            <button 
              onClick={() => router.push('/create')}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1 rounded font-medium transition"
            >
              New Bot
            </button>
          </div>
        </div>
      </header>
      
      {/* Main chat area */}
      <main className="max-w-5xl mx-auto px-4 py-6 flex flex-col md:flex-row gap-6 min-h-[calc(100vh-64px)]">
        <div className="flex-1 flex flex-col">
          {/* Chat container */}
          <div 
            ref={chatContainerRef}
            className="flex-1 bg-gray-800 bg-opacity-60 backdrop-filter backdrop-blur-sm rounded-lg border border-gray-700 shadow-xl overflow-hidden flex flex-col"
          >
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 && !isTyping && (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <div className="text-4xl mb-3">{getBotIcon()}</div>
                    <p>Start a conversation with your bot</p>
                  </div>
                </div>
              )}
              
              {messages.map((msg, idx) => (
                <div 
                  key={idx} 
                  className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      msg.type === 'user' 
                        ? 'bg-blue-600 text-white rounded-tr-none' 
                        : 'bg-gray-700 text-white rounded-tl-none'
                    }`}
                  >
                    {msg.type === 'bot' && (
                      <div className="flex items-center gap-2 mb-1 text-blue-300 text-xs font-medium">
                        <span>{getBotIcon()}</span>
                        <span>{botInfo.name} Bot</span>
                      </div>
                    )}
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] rounded-2xl px-4 py-3 bg-gray-700 text-white rounded-tl-none">
                    <div className="flex items-center gap-2 mb-1 text-blue-300 text-xs font-medium">
                      <span>{getBotIcon()}</span>
                      <span>{botInfo.name} Bot</span>
                    </div>
                    <div className="whitespace-pre-wrap">
                      {typingText}
                      <span className="inline-block animate-pulse">▋</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
            
            {/* Input area */}
            <div className="p-3 border-t border-gray-700 bg-gray-800">
              <div className="flex items-center gap-2">
                <textarea
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your message..."
                  rows={1}
                  className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  style={{ 
                    minHeight: '44px',
                    maxHeight: '120px'
                  }}
                />
                <button
                  onClick={sendMessage}
                  disabled={loading || !input.trim()}
                  className={`rounded-full w-10 h-10 flex items-center justify-center transition-all ${
                    loading || !input.trim()
                      ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {loading ? (
                    <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                    </svg>
                  )}
                </button>
              </div>
              <div className="text-xs text-gray-500 mt-1 text-center">
                Press Enter to send, Shift+Enter for new line
              </div>
            </div>
          </div>
        </div>
        
        {/* Side panel - conditionally shown */}
        <div className={`w-full md:w-80 transition-all duration-300 ${showSettings ? 'opacity-100' : 'md:opacity-100 opacity-0 h-0 md:h-auto overflow-hidden'}`}>
          <div className="bg-gray-800 bg-opacity-60 backdrop-filter backdrop-blur-sm rounded-lg border border-gray-700 p-4 sticky top-24">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
              </svg>
              Bot Settings
            </h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-1">Bot Information</h3>
                <div className="bg-gray-700 rounded p-3 text-sm">
                  <p><span className="text-gray-400">Name:</span> {botInfo.name}</p>
                  <p><span className="text-gray-400">Type:</span> <span className="capitalize">{botInfo.type}</span></p>
                  <p><span className="text-gray-400">Tone:</span> <span className="capitalize">{botInfo.tone}</span></p>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-1">🧪 Test Your Bot</h3>
                <button
                  onClick={runBotTest}
                  className="w-full bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded text-white font-medium transition flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path>
                  </svg>
                  Run AI Test
                </button>
              </div>
              
              {testResults && (
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-1">📊 Test Results</h3>
                  <div className="bg-gray-700 rounded p-3 text-sm whitespace-pre-wrap max-h-60 overflow-y-auto">
                    {testResults}
                  </div>
                </div>
              )}
              
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-1">Actions</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      if (chatContainerRef.current) {
                        const html = chatContainerRef.current.innerHTML;
                        const blob = new Blob([html], { type: 'text/html' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `${botInfo.name}-chat-export.html`;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                      }
                    }}
                    className="w-full bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded text-white font-medium transition flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                    </svg>
                    Export Chat
                  </button>
                  
                  <button
                    onClick={() => setMessages([])}
                    className="w-full bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded text-white font-medium transition flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                    Clear Chat
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}