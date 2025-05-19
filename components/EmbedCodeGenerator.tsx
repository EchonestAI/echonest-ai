// components/EmbedCodeGenerator.tsx
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '../contexts/ToastContext';

interface EmbedCodeGeneratorProps {
  botId: string;
  initialBotName?: string;
  onSave: (settings: any) => Promise<void>;
}

const EmbedCodeGenerator: React.FC<EmbedCodeGeneratorProps> = ({ 
  botId, 
  initialBotName = 'My Bot',
  onSave 
}) => {
  const { showToast } = useToast();
  const [embedCode, setEmbedCode] = useState<string>('');
  const [previewVisible, setPreviewVisible] = useState<boolean>(false);
  const [settings, setSettings] = useState({
    theme: 'dark',
    primaryColor: '#3B82F6',
    chatTitle: initialBotName,
    position: 'bottom-right',
    welcomeMessage: 'Welcome! How can I help you today?',
    buttonIcon: 'chat',
    height: 500,
    width: 350
  });
  const [isLoading, setIsLoading] = useState(false);
  
  // Position options for dropdown
  const positionOptions = [
    { value: 'bottom-right', label: 'Bottom Right' },
    { value: 'bottom-left', label: 'Bottom Left' },
    { value: 'top-right', label: 'Top Right' },
    { value: 'top-left', label: 'Top Left' }
  ];
  
  // Icon options for dropdown
  const iconOptions = [
    { value: 'chat', label: 'Chat Bubble' },
    { value: 'message', label: 'Message' },
    { value: 'help', label: 'Help' }
  ];
  
  // Theme options for dropdown
  const themeOptions = [
    { value: 'dark', label: 'Dark' },
    { value: 'light', label: 'Light' }
  ];
  
  // Function to generate embed code - Only called explicitly
  const generateEmbedCode = async () => {
    try {
      const response = await fetch('/api/generate-embed-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          botId,
          customizations: settings
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate embed code');
      }
      
      const data = await response.json();
      setEmbedCode(data.embedCode);
      return data;
    } catch (error) {
      console.error('Error generating embed code:', error);
      throw error;
    }
  };
  
  // Initial code generation on component mount
  useEffect(() => {
    const initialLoad = async () => {
      setIsLoading(true);
      try {
        await generateEmbedCode();
      } catch (error) {
        showToast('Failed to load embed code', 'error');
      } finally {
        setIsLoading(false);
      }
    };
    
    initialLoad();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Function to handle setting changes - ONLY updates state, does NOT apply changes
  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
    // No auto-apply here - just update the state
  };
  
  // Handle preview toggle - separate from applying changes
  const handleTogglePreview = () => {
    setPreviewVisible(!previewVisible);
  };
  
  // Apply changes button handler - explicitly triggered by user
  const handleApplyChanges = async () => {
    setIsLoading(true);
    try {
      await generateEmbedCode();
      await onSave(settings);
      showToast('Changes applied successfully', 'success');
    } catch (error) {
      console.error('Error applying changes:', error);
      showToast('Failed to apply changes', 'error');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Copy embed code to clipboard
  const handleCopyCode = () => {
    navigator.clipboard.writeText(embedCode);
    showToast('Embed code copied to clipboard', 'success');
  };
  
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Embed Your Bot</h2>
      
      <div className="grid md:grid-cols-2 gap-8">
        {/* Settings Panel */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium mb-2">Customization Options</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Bot Title</label>
            <input
              type="text"
              value={settings.chatTitle}
              onChange={(e) => handleSettingChange('chatTitle', e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter chat widget title"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Welcome Message</label>
            <input
              type="text"
              value={settings.welcomeMessage}
              onChange={(e) => handleSettingChange('welcomeMessage', e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter welcome message"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Theme</label>
            <select
              value={settings.theme}
              onChange={(e) => handleSettingChange('theme', e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {themeOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Primary Color</label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={settings.primaryColor}
                onChange={(e) => handleSettingChange('primaryColor', e.target.value)}
                className="w-10 h-10 rounded overflow-hidden"
              />
              <input
                type="text"
                value={settings.primaryColor}
                onChange={(e) => handleSettingChange('primaryColor', e.target.value)}
                className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="#3B82F6"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Position</label>
            <select
              value={settings.position}
              onChange={(e) => handleSettingChange('position', e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {positionOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Button Icon</label>
            <select
              value={settings.buttonIcon}
              onChange={(e) => handleSettingChange('buttonIcon', e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {iconOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Width (px)</label>
              <input
                type="number"
                value={settings.width}
                onChange={(e) => handleSettingChange('width', parseInt(e.target.value))}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="250"
                max="500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Height (px)</label>
              <input
                type="number"
                value={settings.height}
                onChange={(e) => handleSettingChange('height', parseInt(e.target.value))}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="300"
                max="800"
              />
            </div>
          </div>
          
          <div className="mt-6 flex space-x-3">
            {/* Apply Changes Button - Now properly styled and separated from other actions */}
            <Button 
              onClick={handleApplyChanges}
              disabled={isLoading}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Applying...
                </>
              ) : (
                'Apply Changes'
              )}
            </Button>
            
            {/* Toggle Preview Button - Doesn't apply changes */}
            <Button 
              onClick={handleTogglePreview} 
              variant="outline"
              className="border-blue-500 bg-transparent hover:bg-blue-900/20 text-blue-400 hover:text-blue-300 font-medium py-2 px-4 rounded-md transition-colors"
            >
              {previewVisible ? 'Hide Preview' : 'Show Preview'}
            </Button>
          </div>
        </div>
        
        {/* Preview & Code Panel */}
        <div className="space-y-6">
          {previewVisible ? (
            <div className="bg-gray-900 rounded-lg border border-gray-700 p-4 h-80 overflow-hidden relative">
              <h3 className="text-lg font-medium mb-4">Visual Preview</h3>
              
              <div 
                className={`absolute ${settings.position.includes('bottom') ? 'bottom-4' : 'top-4'} ${settings.position.includes('right') ? 'right-4' : 'left-4'}`}
              >
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center cursor-pointer shadow-lg"
                  style={{ backgroundColor: settings.primaryColor }}
                >
                  {settings.buttonIcon === 'chat' && (
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
                    </svg>
                  )}
                  {settings.buttonIcon === 'message' && (
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                    </svg>
                  )}
                  {settings.buttonIcon === 'help' && (
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  )}
                </div>
              </div>
              
              <div 
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2 border shadow-lg rounded-lg overflow-hidden`}
                style={{ 
                  width: `${Math.min(settings.width, 300)}px`, 
                  height: `${Math.min(settings.height, 200)}px`,
                  backgroundColor: settings.theme === 'dark' ? '#1f2937' : '#ffffff',
                  color: settings.theme === 'dark' ? '#ffffff' : '#000000'
                }}
              >
                <div 
                  className="border-b px-4 py-3"
                  style={{ 
                    borderColor: settings.theme === 'dark' ? '#374151' : '#e5e7eb'
                  }}
                >
                  <div className="font-medium">{settings.chatTitle}</div>
                </div>
                <div className="p-3 text-sm">
                  <div 
                    className="rounded-lg p-2 max-w-[80%] inline-block"
                    style={{ 
                      backgroundColor: settings.theme === 'dark' ? '#374151' : '#f3f4f6'
                    }}
                  >
                    {settings.welcomeMessage}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-900 rounded-lg border border-gray-700 p-4 h-80 flex items-center justify-center">
              <div className="text-center text-gray-400">
                <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                </svg>
                <p>Click "Show Preview" to see how your bot will appear on your website</p>
              </div>
            </div>
          )}
          
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-medium">Embed Code</h3>
              <Button 
                onClick={handleCopyCode}
                variant="outline" 
                size="sm"
                className="text-sm border-blue-500 bg-transparent hover:bg-blue-900/20 text-blue-400 hover:text-blue-300"
              >
                Copy Code
              </Button>
            </div>
            <div className="bg-gray-900 rounded-lg border border-gray-700 p-4">
              <pre className="text-xs text-gray-300 overflow-x-auto whitespace-pre-wrap">{embedCode}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmbedCodeGenerator;