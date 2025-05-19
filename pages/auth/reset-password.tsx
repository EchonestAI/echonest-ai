// pages/auth/reset-password.tsx
import { useState } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import AppLayout from '../../components/AppLayout';
import EchonestLogo from '../../components/EchonestLogo';

export default function ResetPasswordPage() {
  const supabase = useSupabaseClient();
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('error');
  const [loading, setLoading] = useState(false);
  
  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    
    if (password !== confirmPassword) {
      setMessage('Passwords do not match.');
      setMessageType('error');
      return;
    }
    
    if (password.length < 6) {
      setMessage('Password must be at least 6 characters.');
      setMessageType('error');
      return;
    }
    
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.updateUser({ password });
      
      setLoading(false);
      
      if (error) {
        setMessage(error.message);
        setMessageType('error');
      } else {
        setMessage('Your password has been updated successfully.');
        setMessageType('success');
        
        // Redirect to dashboard after successful password reset
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      }
    } catch (error) {
      setLoading(false);
      setMessage('An unexpected error occurred. Please try again.');
      setMessageType('error');
    }
  };
  
  return (
    <AppLayout>
      <div className="flex items-center justify-center px-4 py-20">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <EchonestLogo size="lg" />
            </div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
              Reset Your Password
            </h1>
            <p className="text-gray-400 mt-2">Enter your new password below</p>
          </div>
          
          <form onSubmit={handleReset} className="bg-gray-800/70 backdrop-blur-sm p-8 rounded-lg shadow-xl border border-gray-700 space-y-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">New Password</label>
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full p-3 rounded-lg bg-gray-900 border border-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                />
                <p className="text-xs text-gray-500 mt-1">Password must be at least 6 characters</p>
              </div>
              
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-1">Confirm Password</label>
                <input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full p-3 rounded-lg bg-gray-900 border border-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                />
              </div>
            </div>
            
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg py-3 px-4 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 flex items-center justify-center"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Updating Password...
                </>
              ) : (
                'Reset Password'
              )}
            </button>
            
            {message && (
              <div className={`p-3 rounded-lg text-sm ${
                messageType === 'success' ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'
              }`}>
                {message}
              </div>
            )}
            
            <div className="text-center text-sm text-gray-400">
              Remember your password?{' '}
              <Link href="/login" className="text-blue-400 hover:text-blue-300 transition-all">
                Log in
              </Link>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}