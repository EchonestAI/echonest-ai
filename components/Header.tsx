// components/Header.tsx
import Link from 'next/link';
import { useRouter } from 'next/router';
import EchonestLogo from './EchonestLogo';

type HeaderProps = {
  showNav?: boolean;
  showSignOut?: boolean;
  onSignOut?: () => void;
};

export default function Header({ showNav = false, showSignOut = false, onSignOut }: HeaderProps) {
  const router = useRouter();
  
  return (
    <header className="sticky top-0 z-50 border-b border-gray-800 bg-black">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/">
              <div className="flex items-center gap-2">
                <EchonestLogo />
              </div>
            </Link>
            
            {showNav && (
              <nav className="hidden md:flex gap-6">
                <a href="#features" className="text-gray-300 hover:text-white transition">Features</a>
                <a href="#pricing" className="text-gray-300 hover:text-white transition">Pricing</a>
                <a href="#demo" className="text-gray-300 hover:text-white transition">Demo</a>
                <a href="#faq" className="text-gray-300 hover:text-white transition">FAQ</a>
              </nav>
            )}
          </div>
          
          {showSignOut && (
            <div className="flex items-center gap-4">
              <button className="p-2 text-gray-400 hover:text-white focus:outline-none">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </button>
              <button 
                onClick={onSignOut}
                className="inline-flex items-center rounded-md bg-gray-800 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
              >
                Sign Out
              </button>
            </div>
          )}
          
          {!showSignOut && router.pathname !== '/login' && router.pathname !== '/signup' && (
            <div className="flex items-center gap-3">
              <Link href="/login">
                <button className="rounded-md px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition">
                  Log In
                </button>
              </Link>
              <Link href="/signup">
                <button className="rounded-md px-4 py-2 text-sm font-medium bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white transition">
                  Sign Up
                </button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}