// components/FeedbackForm.tsx
import React, { useState } from 'react';

type FeedbackFormProps = {
  conversationId: string;
  onFeedbackSubmitted: () => void;
  primaryColor: string;
  theme: 'light' | 'dark';
};

export default function FeedbackForm({ 
  conversationId, 
  onFeedbackSubmitted,
  primaryColor = '#3B82F6',
  theme = 'dark'
}: FeedbackFormProps) {
  const [rating, setRating] = useState<number | null>(null);
  const [wasHelpful, setWasHelpful] = useState<boolean | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  const handleSubmit = async () => {
    if (submitting) return;
    
    setSubmitting(true);
    try {
      const response = await fetch('/api/chat-with-bot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          conversationId,
          isFeedback: true,
          feedbackRating: rating,
          markSuccessful: wasHelpful,
          endConversation: true
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit feedback');
      }
      
      onFeedbackSubmitted();
    } catch (error) {
      console.error('Error submitting feedback:', error);
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <div className={`p-4 ${theme === 'light' ? 'bg-gray-100' : 'bg-gray-800'} rounded-lg`}>
      <h4 className="text-center font-medium mb-3">How was your experience?</h4>
      
      <div className="mb-4">
        <p className="text-sm mb-2 text-center">Did you get the help you needed?</p>
        <div className="flex justify-center space-x-3">
          <button
            onClick={() => setWasHelpful(true)}
            className={`px-4 py-1 rounded-full text-sm transition-colors ${
              wasHelpful === true
                ? `bg-green-600 text-white`
                : `${theme === 'light' ? 'bg-gray-200 hover:bg-gray-300' : 'bg-gray-700 hover:bg-gray-600'} text-gray-400 hover:text-white`
            }`}
          >
            Yes
          </button>
          <button
            onClick={() => setWasHelpful(false)}
            className={`px-4 py-1 rounded-full text-sm transition-colors ${
              wasHelpful === false
                ? `bg-red-600 text-white`
                : `${theme === 'light' ? 'bg-gray-200 hover:bg-gray-300' : 'bg-gray-700 hover:bg-gray-600'} text-gray-400 hover:text-white`
            }`}
          >
            No
          </button>
        </div>
      </div>
      
      <div className="mb-4">
        <p className="text-sm mb-2 text-center">Rate your experience:</p>
        <div className="flex justify-center space-x-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setRating(star)}
              className="transition-transform hover:scale-110 focus:outline-none"
            >
              <svg 
                className={`w-8 h-8 ${rating && rating >= star ? 'text-yellow-400' : 'text-gray-400'}`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </button>
          ))}
        </div>
      </div>
      
      <div className="text-center">
        <button
          onClick={handleSubmit}
          disabled={wasHelpful === null || rating === null || submitting}
          style={{ 
            backgroundColor: (wasHelpful === null || rating === null) 
              ? '#9ca3af' 
              : primaryColor
          }}
          className="px-6 py-2 rounded-lg text-white font-medium transition-colors disabled:opacity-50"
        >
          {submitting ? 'Submitting...' : 'Submit Feedback'}
        </button>
      </div>
    </div>
  );
}