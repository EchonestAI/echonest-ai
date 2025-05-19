// components/SubscribeButton.tsx
import { useState } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';

interface SubscribeButtonProps {
  planId: 'pro' | 'business';
  className?: string;
  variant?: 'primary' | 'outline' | 'ghost';
  children?: React.ReactNode;
  successUrl?: string;
  cancelUrl?: string;
}

export default function SubscribeButton({
  planId,
  className = '',
  variant = 'primary',
  children,
  successUrl,
  cancelUrl
}: SubscribeButtonProps) {
  const [loading, setLoading] = useState(false);
  const supabase = useSupabaseClient();

  // Define button styles based on variant
  const getButtonStyle = () => {
    switch (variant) {
      case 'primary':
        return 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white';
      case 'outline':
        return 'bg-transparent border border-blue-600 text-blue-600 hover:bg-blue-100/10';
      case 'ghost':
        return 'bg-transparent hover:bg-gray-800 text-gray-200';
      default:
        return 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white';
    }
  };

  const handleSubscribe = async () => {
    try {
      setLoading(true);
      
      // Check if user is authenticated
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        // Not authenticated, redirect to login
        window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
        return;
      }
      
      // For now, just simulate a redirect to future implementation
      alert(`You clicked to subscribe to the ${planId} plan. Stripe integration will be fully implemented soon.`);
      
      // When Stripe is fully implemented, this will be:
      // Create checkout session via API
      // Redirect to Stripe checkout
      
    } catch (error) {
      console.error('Subscribe error:', error);
      alert('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleSubscribe}
      disabled={loading}
      className={`font-medium rounded-lg px-4 py-2 transition-all duration-200 ${getButtonStyle()} ${className}`}
    >
      {loading ? (
        <div className="flex items-center justify-center">
          <svg className="animate-spin mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Processing...
        </div>
      ) : children || (planId === 'pro' ? 'Upgrade to Pro' : 'Upgrade to Business')}
    </button>
  );
}