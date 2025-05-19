// pages/signup.tsx
import { useState } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import AppLayout from '../components/AppLayout';
import EchonestLogo from '../components/EchonestLogo';

export default function SignupPage() {
  const supabase = useSupabaseClient();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('error');

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    // Get the current domain for the redirect
    const redirectTo = `${window.location.origin}/auth/callback`;
    
    const { error, data } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectTo,
        data: {
          name: email.split('@')[0], // Use part of email as name initially
        }
      }
    });

    setLoading(false);
    
    if (error) {
      setMessage(error.message);
      setMessageType('error');
    } else {
      // Check if confirmation is required
      if (data?.user?.identities?.length === 0) {
        setMessage('This email is already registered. Please log in instead.');
        setMessageType('error');
      } else if (data?.user?.identities && data.user.identities.length > 0 && !data.user.confirmed_at) {
        // Email confirmation is still required
        setMessage('Please check your email to confirm your account.');
        setMessageType('success');
      } else {
        // Auto-signed in, redirect to dashboard
        router.push('/dashboard');
      }
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
              Join Echonest.ai
            </h1>
            <p className="text-gray-400 mt-2">Create an account to start building your AI assistants</p>
          </div>
          
          <form onSubmit={handleSignup} className="bg-gray-800/70 backdrop-blur-sm p-8 rounded-lg shadow-xl border border-gray-700 space-y-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                <input
                  id="email"
                  type="email"
                  placeholder="youremail@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full p-3 rounded-lg bg-gray-900 border border-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">Password</label>
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
                  Creating account...
                </>
              ) : (
                'Create Account'
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
              Already have an account?{' '}
              <Link href="/login" className="text-blue-400 hover:text-blue-300 transition-all">
                Log in
              </Link>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-gray-800 text-gray-500">OR</span>
              </div>
            </div>
            
            <button 
              type="button"
              className="w-full bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg py-3 px-4 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500/50 flex items-center justify-center"
              onClick={async () => {
                const { error } = await supabase.auth.signInWithOAuth({
                  provider: 'google',
                  options: {
                    redirectTo: `${window.location.origin}/auth/callback`
                  }
                });
                if (error) {
                  setMessage(error.message);
                  setMessageType('error');
                }
              }}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.345-7.574 7.439-7.574c2.33 0 3.891.989 4.785 1.849l3.254-3.138C18.189 1.186 15.479 0 12.24 0c-6.635 0-12 5.365-12 12s5.365 12 12 12c6.926 0 11.52-4.869 11.52-11.726 0-.788-.085-1.39-.189-1.989H12.24z" fill="currentColor"/>
              </svg>
              Continue with Google
            </button>
          </form>
          
          <p className="text-xs text-center text-gray-500 mt-8">
            By signing up, you agree to our 
            <a href="#" className="text-gray-400 hover:text-blue-400 mx-1">Terms of Service</a> 
            and 
            <a href="#" className="text-gray-400 hover:text-blue-400 mx-1">Privacy Policy</a>
          </p>
        </div>
      </div>
    </AppLayout>
  );
}