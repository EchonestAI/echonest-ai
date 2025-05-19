// components/EmbedCodeGenerator.tsx
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '../contexts/ToastContext';

type EmbedCodeGeneratorProps = {
  botId: string;
  initialBotName: string;
  onSave?: (settings: any) => Promise<void>;
};

type CustomizationSettings = {
  theme: 'dark' | 'light';
  primaryColor: string;
  chatTitle: string;
  position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  welcomeMessage: string;
  buttonIcon: 'chat' | 'message' | 'help';
};

export default function EmbedCodeGenerator({ 
  botId, 
  initialBotName,
  onSave 
}: EmbedCodeGeneratorProps) {
  const { showToast } = useToast();
  const [embedCode, setEmbedCode] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const codeRef = useRef<HTMLTextAreaElement>(null);
  
  const [settings, setSettings] = useState<CustomizationSettings>({
    theme: 'dark',
    primaryColor: '#3B82F6',
    chatTitle: initialBotName || 'Chat Assistant',
    position: 'bottom-right',
    welcomeMessage: 'Hello! How can I help you today?',
    buttonIcon: 'chat'
  });
  
  const handleSettingChange = (key: keyof CustomizationSettings, value: any) => {
    setSettings({
      ...settings,
      [key]: value
    });
  };
  
  const handleGenerate = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/generate-embed-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          botId,
          customizations: settings
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate embed code');
      }
      
      const data = await response.json();
      setEmbedCode(data.embedCode);
      
      // Save settings if onSave prop is provided
      if (onSave) {
        await onSave(settings);
        
        // Show toast notification
        showToast('Bot settings updated successfully!', 'success');
      }
      
    } catch (error) {
      console.error('Error generating embed code:', error);
      showToast('Failed to generate embed code. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  const handleCopy = () => {
    if (codeRef.current) {
      codeRef.current.select();
      document.execCommand('copy');
      
      showToast('Embed code copied to clipboard!', 'success');
    }
  };
  
  // Toggle preview
  const togglePreview = () => {
    setShowPreview(!showPreview);
  };
  
  return (
    <div className="space-y-6 relative">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Embed Your Bot on Your Website</h3>
        <div className="flex gap-2">
          <Button
            onClick={togglePreview}
            variant="outline"
            className="text-sm"
          >
            {showPreview ? 'Hide Preview' : 'Show Preview'}
          </Button>
          <Button
            onClick={() => setShowSettings(!showSettings)}
            variant="outline"
            className="text-sm"
          >
            {showSettings ? 'Hide Customization' : 'Customize'}
          </Button>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row gap-6">
        <div className={`${showSettings ? 'flex-1' : 'w-full'}`}>
          {showSettings && (
            <div className="bg-gray-800/50 rounded-lg p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Theme</label>
                  <select
                    value={settings.theme}
                    onChange={(e) => handleSettingChange('theme', e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="dark">Dark</option>
                    <option value="light">Light</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Primary Color</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={settings.primaryColor}
                      onChange={(e) => handleSettingChange('primaryColor', e.target.value)}
                      className="w-10 h-10 rounded border-0"
                    />
                    <input
                      type="text"
                      value={settings.primaryColor}
                      onChange={(e) => handleSettingChange('primaryColor', e.target.value)}
                      className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Chat Title</label>
                  <input
                    type="text"
                    value={settings.chatTitle}
                    onChange={(e) => handleSettingChange('chatTitle', e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Position</label>
                  <select
                    value={settings.position}
                    onChange={(e) => handleSettingChange('position', e.target.value as any)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="bottom-right">Bottom Right</option>
                    <option value="bottom-left">Bottom Left</option>
                    <option value="top-right">Top Right</option>
                    <option value="top-left">Top Left</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Button Icon</label>
                  <select
                    value={settings.buttonIcon}
                    onChange={(e) => handleSettingChange('buttonIcon', e.target.value as any)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="chat">Chat Bubble</option>
                    <option value="message">Message</option>
                    <option value="help">Help</option>
                  </select>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-1">Welcome Message</label>
                  <textarea
                    value={settings.welcomeMessage}
                    onChange={(e) => handleSettingChange('welcomeMessage', e.target.value)}
                    rows={2}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          )}
          
          <div className="flex justify-center mt-6">
            <Button
              onClick={handleGenerate}
              disabled={loading}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              {loading ? 'Generating...' : 'Generate Embed Code'}
            </Button>
          </div>
          
          {embedCode && (
            <div className="bg-gray-800/50 rounded-lg p-4 space-y-4 mt-6">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-white">Your Embed Code</h4>
                <Button 
                  onClick={handleCopy}
                  size="sm"
                  variant="outline"
                >
                  Copy to Clipboard
                </Button>
              </div>
              <textarea
                ref={codeRef}
                value={embedCode}
                readOnly
                rows={10}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              />
              <div className="text-sm text-gray-400">
                <p>Copy and paste this code into your website's HTML, just before the closing &lt;/body&gt; tag.</p>
              </div>
            </div>
          )}
        </div>
        
        {/* Preview */}
        {showPreview && (
          <div className="md:w-96 h-[600px] bg-gray-800 border border-gray-700 rounded-lg overflow-hidden relative flex flex-col">
            <div className="text-center py-2 bg-gray-900 border-b border-gray-700 text-sm font-medium">
              Bot Preview
            </div>
            
            {/* Simulate a website */}
            <div className={`flex-1 overflow-hidden p-4 ${settings.theme === 'light' ? 'bg-white' : 'bg-gray-900'}`}>
              <div className={`text-2xl font-bold mb-2 ${settings.theme === 'light' ? 'text-gray-900' : 'text-white'}`}>
                Example Website
              </div>
              <div className={`h-4 w-3/4 rounded mb-2 ${settings.theme === 'light' ? 'bg-gray-200' : 'bg-gray-800'}`}></div>
              <div className={`h-4 w-1/2 rounded mb-6 ${settings.theme === 'light' ? 'bg-gray-200' : 'bg-gray-800'}`}></div>
              
              <div className={`h-24 rounded mb-4 ${settings.theme === 'light' ? 'bg-gray-100' : 'bg-gray-800'}`}></div>
              <div className={`h-4 w-5/6 rounded mb-2 ${settings.theme === 'light' ? 'bg-gray-200' : 'bg-gray-800'}`}></div>
              <div className={`h-4 w-4/6 rounded mb-2 ${settings.theme === 'light' ? 'bg-gray-200' : 'bg-gray-800'}`}></div>
              <div className={`h-4 w-3/6 rounded mb-6 ${settings.theme === 'light' ? 'bg-gray-200' : 'bg-gray-800'}`}></div>
              
              <div className={`h-40 rounded ${settings.theme === 'light' ? 'bg-gray-100' : 'bg-gray-800'}`}></div>
            </div>
            
            {/* Chat button */}
            <div style={{ position: 'absolute', 
                          [settings.position.includes('bottom') ? 'bottom' : 'top']: '20px', 
                          [settings.position.includes('right') ? 'right' : 'left']: '20px' }}>
              <div 
                style={{ backgroundColor: settings.primaryColor }}
                className="w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg cursor-pointer"
              >
                {settings.buttonIcon === 'chat' ? (
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 1.95c-5.52 0-10 4.48-10 10s4.48 10 10 10h5v-2h-5c-4.34 0-8-3.66-8-8s3.66-8 8-8 8 3.66 8 8v1.43c0 .79-.71 1.57-1.5 1.57s-1.5-.78-1.5-1.57v-1.43c0-2.76-2.24-5-5-5s-5 2.24-5 5 2.24 5 5 5c1.38 0 2.64-.56 3.54-1.47.65.89 1.77 1.47 2.96 1.47 1.97 0 3.5-1.6 3.5-3.57v-1.43c0-5.52-4.48-10-10-10zm0 13c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z" />
                  </svg>
                ) : settings.buttonIcon === 'message' ? (
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92c-.5.51-.86.97-1.04 1.69-.08.32-.13.68-.13 1.14h-2v-.5c0-.46.08-.9.22-1.31.2-.58.53-1.1.95-1.52l1.24-1.26c.46-.44.68-1.1.55-1.8-.13-.72-.69-1.33-1.39-1.53-1.11-.31-2.14.32-2.47 1.27-.12.35-.43.58-.79.58-.5 0-.86-.51-.71-.99.13-.39.32-.75.58-1.08C9.66 6.77 11.21 6 13 6c3 0 4 2.07 4 3.4 0 1.1-.96 2.14-1.93 2.85z" />
                  </svg>
                )}
              </div>
            </div>
            
            {/* Chat window (dummy) */}
            <div 
              style={{ 
                position: 'absolute', 
                [settings.position.includes('bottom') ? 'bottom' : 'top']: '90px', 
                [settings.position.includes('right') ? 'right' : 'left']: '20px',
                width: '300px',
                height: '400px',
                backgroundColor: settings.theme === 'light' ? 'white' : '#1f2937',
                border: `1px solid ${settings.theme === 'light' ? '#e5e7eb' : '#374151'}`,
                display: 'flex',
                flexDirection: 'column'
              }} 
              className="rounded-lg shadow-lg overflow-hidden"
            >
              {/* Header */}
              <div 
                style={{ backgroundColor: settings.theme === 'light' ? '#f9fafb' : '#111827' }} 
                className="px-4 py-3 border-b border-gray-700 flex justify-between items-center"
              >
                <div className={`font-medium ${settings.theme === 'light' ? 'text-gray-900' : 'text-white'}`}>
                  {settings.chatTitle}
                </div>
                <div className="text-gray-400 cursor-pointer">
                  ✕
                </div>
              </div>
              
              {/* Chat area */}
              <div className="flex-1 p-4 overflow-y-auto">
                {/* Bot message */}
                <div className="flex mb-4">
                  <div 
                    style={{ backgroundColor: settings.theme === 'light' ? '#f3f4f6' : '#374151' }} 
                    className={`max-w-[80%] rounded-lg py-2 px-3 rounded-tl-none ${
                      settings.theme === 'light' ? 'text-gray-900' : 'text-white'
                    }`}
                  >
                    <div className="text-sm">{settings.welcomeMessage}</div>
                  </div>
                </div>
              </div>
              
              {/* Input area */}
              <div 
                style={{ backgroundColor: settings.theme === 'light' ? '#f9fafb' : '#1f2937' }} 
                className="p-3 border-t border-gray-600"
              >
                <div className="flex items-center gap-2">
                  <div 
                    style={{ backgroundColor: settings.theme === 'light' ? 'white' : '#374151', 
                             borderColor: settings.theme === 'light' ? '#d1d5db' : '#4b5563' }} 
                    className="flex-1 h-9 rounded-lg border px-3"
                  ></div>
                  <div 
                    style={{ backgroundColor: settings.primaryColor }} 
                    className="w-9 h-9 rounded-full flex items-center justify-center text-white"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}