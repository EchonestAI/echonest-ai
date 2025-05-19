// pages/embed-chat.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import FeedbackForm from '../components/FeedbackForm';

const EmbedChat = () => {
  const router = useRouter();
  const { botId, theme, primaryColor } = router.query;
  
  const [messages, setMessages] = useState<{type: 'user' | 'bot', content: string}[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [systemPrompt, setSystemPrompt] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Listen for welcome message from parent
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'ECHONEST_WELCOME') {
        // Add welcome message
        setMessages([{
          type: 'bot',
          content: event.data.message
        }]);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Fetch bot config on load
  useEffect(() => {
    const fetchBotConfig = async () => {
      if (!botId) return;
      
      try {
        const response = await fetch(`/api/bot-config?id=${botId}`);
        if (!response.ok) throw new Error('Failed to fetch bot configuration');
        
        const data = await response.json();
        setSystemPrompt(data.prompt);
      } catch (error) {
        console.error('Error fetching bot config:', error);
        setMessages([{
          type: 'bot',
          content: 'Sorry, I had trouble connecting. Please try again later.'
        }]);
      }
    };
    
    fetchBotConfig();
  }, [botId]);

  // Scroll to bottom of chat when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, showFeedback]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading || !systemPrompt) return;
    
    const userMessage = inputValue.trim();
    setInputValue('');
    setIsLoading(true);
    
    // Hide feedback form if showing
    if (showFeedback) {
      setShowFeedback(false);
    }
    
    // Add user message to chat
    setMessages(prev => [...prev, { type: 'user', content: userMessage }]);
    
    try {
      const response = await fetch('/api/chat-with-bot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          prompt: systemPrompt,
          botId,
          conversationId,
          sessionId: localStorage.getItem('echonest_session_id') || undefined
        })
      });
      
      if (!response.ok) throw new Error('Failed to get response');
      
      const data = await response.json();
      
      // Store session and conversation IDs
      if (data.conversationId) {
        setConversationId(data.conversationId);
        
        if (!localStorage.getItem('echonest_session_id')) {
          const sessionId = Math.random().toString(36).substring(2, 15);
          localStorage.setItem('echonest_session_id', sessionId);
        }
      }
      
      // Add bot response to chat
      setMessages(prev => [...prev, { type: 'bot', content: data.response || 'Sorry, I had trouble understanding that.' }]);
      
      // Check if we should show feedback form
      if (data.response && (
        data.response.includes("Anything else I can help with?") ||
        data.response.includes("Is there anything else you'd like to know?") ||
        data.response.includes("Was that helpful?") || 
        messages.length > 6
      )) {
        setShowFeedback(true);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, { type: 'bot', content: 'Sorry, there was an error processing your message.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle "Enter" key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className={`flex flex-col h-full ${theme === 'light' ? 'bg-white text-gray-900' : 'bg-gray-900 text-white'}`}>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div 
            key={idx} 
            className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              style={{ 
                backgroundColor: msg.type === 'user' 
                  ? (primaryColor as string) || '#3B82F6' 
                  : theme === 'light' ? '#f3f4f6' : '#1f2937'
              }}
              className={`max-w-[80%] rounded-lg py-2 px-4 ${
                msg.type === 'user' 
                  ? 'rounded-tr-none text-white' 
                  : theme === 'light' ? 'rounded-tl-none text-gray-800' : 'rounded-tl-none text-gray-100'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div 
              className={`max-w-[80%] rounded-lg rounded-tl-none py-2 px-4 ${
                theme === 'light' ? 'bg-gray-100 text-gray-800' : 'bg-gray-800 text-gray-100'
              }`}
            >
              <div className="flex space-x-1">
                <div className={`w-2 h-2 ${theme === 'light' ? 'bg-gray-400' : 'bg-gray-600'} rounded-full animate-pulse`}></div>
                <div className={`w-2 h-2 ${theme === 'light' ? 'bg-gray-400' : 'bg-gray-600'} rounded-full animate-pulse`} style={{ animationDelay: '0.2s' }}></div>
                <div className={`w-2 h-2 ${theme === 'light' ? 'bg-gray-400' : 'bg-gray-600'} rounded-full animate-pulse`} style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}
        
        {/* Feedback form */}
        {showFeedback && conversationId && (
          <div className="mt-4">
            <FeedbackForm 
              conversationId={conversationId} 
              onFeedbackSubmitted={() => setShowFeedback(false)}
              primaryColor={primaryColor as string || '#3B82F6'}
              theme={theme as 'light' | 'dark' || 'dark'}
            />
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      <div className={`p-3 border-t ${theme === 'light' ? 'border-gray-200 bg-gray-50' : 'border-gray-700 bg-gray-800'}`}>
        <div className="flex items-center gap-2">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type your message..."
            rows={1}
            className={`flex-1 resize-none p-2 rounded-lg focus:outline-none focus:ring-2 ${
              theme === 'light' 
                ? 'bg-white border border-gray-300 focus:ring-blue-500 text-gray-900' 
                : 'bg-gray-700 border border-gray-600 focus:ring-blue-500 text-white'
            }`}
            style={{
              minHeight: '44px',
              maxHeight: '120px'
            }}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            style={{ backgroundColor: isLoading || !inputValue.trim() ? '#9ca3af' : (primaryColor as string || '#3B82F6') }}
            className="rounded-full w-10 h-10 flex items-center justify-center text-white transition-all disabled:opacity-50"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmbedChat;