import { AppProps } from 'next/app';
import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import { useState } from 'react';
import '@/styles/globals.css';
import { ToastProvider } from '../contexts/ToastContext';

export default function App({ Component, pageProps }: AppProps) {
  const [supabaseClient] = useState(() => createBrowserSupabaseClient());

  return (
    <SessionContextProvider supabaseClient={supabaseClient} initialSession={pageProps.initialSession}>
      <ToastProvider>
        <Component {...pageProps} />
      </ToastProvider>
    </SessionContextProvider>
  );
}