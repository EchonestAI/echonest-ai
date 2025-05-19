// components/ui/Toast.tsx
import React, { useState, useEffect } from 'react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  duration?: number;
  onClose?: () => void;
}

export default function Toast({ 
  message, 
  type = 'success', 
  duration = 3000, 
  onClose 
}: ToastProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      if (onClose) onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  // Set background color based on type
  const getBgColor = () => {
    switch (type) {
      case 'success': return 'bg-green-900/80 border-green-700';
      case 'error': return 'bg-red-900/80 border-red-700';
      case 'info': return 'bg-blue-900/80 border-blue-700';
      default: return 'bg-gray-900/80 border-gray-700';
    }
  };

  // Set icon based on type
  const getIcon = () => {
    switch (type) {
      case 'success':
        return (
          <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      case 'info':
        return (
          <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return null;
    }
  };

  if (!visible) return null;

  return (
    <div 
      className={`fixed top-4 right-4 z-50 ${getBgColor()} backdrop-blur-sm border text-white px-4 py-3 rounded-lg shadow-lg animate-fadeIn max-w-md`}
      role="alert"
    >
      <div className="flex items-center">
        <div className="flex-shrink-0 mr-3">
          {getIcon()}
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium">{message}</p>
        </div>
        <div className="ml-4">
          <button 
            type="button" 
            className="inline-flex text-gray-400 hover:text-white focus:outline-none"
            onClick={() => {
              setVisible(false);
              if (onClose) onClose();
            }}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}