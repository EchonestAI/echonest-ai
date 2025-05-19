// pages/auth/callback.tsx
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSupabaseClient } from '@supabase/auth-helpers-react';

export default function AuthCallbackPage() {
  const router = useRouter();
  const supabase = useSupabaseClient();

  useEffect(() => {
    // Get the hash fragment from the URL
    const hash = window.location.hash;
    
    // Handle the auth callback via the hash
    const handleAuthCallback = async () => {
      // Check if there's actually a hash to process
      if (hash) {
        try {
          // Process the hash
          const { data, error } = await supabase.auth.getUser();
          
          if (error) {
            console.error('Error during auth callback:', error.message);
            router.push('/login?error=Authentication%20failed');
          } else if (data?.user) {
            // User is logged in, redirect to dashboard
            router.push('/dashboard');
          }
        } catch (err) {
          console.error('Error processing auth callback:', err);
          router.push('/login?error=Authentication%20failed');
        }
      } else {
        // No hash, check if user is already authenticated
        const { data } = await supabase.auth.getUser();
        if (data?.user) {
          router.push('/dashboard');
        } else {
          router.push('/login');
        }
      }
    };

    handleAuthCallback();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black text-white">
      <div className="text-center">
        <div className="inline-block animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mb-4"></div>
        <h2 className="text-xl font-semibold">Authenticating...</h2>
        <p className="text-gray-400 mt-2">Please wait while we log you in</p>
      </div>
    </div>
  );
}

// This runs server-side and is separate from the client component above
export async function getServerSideProps() {
  // Return empty props - the client-side code will handle the redirect
  return {
    props: {}
  };
}