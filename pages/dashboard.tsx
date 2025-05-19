// pages/dashboard.tsx
import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '../components/Header';
import SubscribeButton from '../components/SubscribeButton';
import EchonestLogo from '../components/EchonestLogo';

export default function Dashboard() {
  const user = useUser();
  const supabase = useSupabaseClient();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [chatbots, setChatbots] = useState<any[]>([]);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [confirmChecked, setConfirmChecked] = useState(false);
  
  // Add stats state
  const [stats, setStats] = useState({
    totalConversations: 0,
    successRate: 0,
    safetyScore: 0,
    recentActivities: [],
  });

  // Add subscription state
  const [subscription, setSubscription] = useState({
    plan: 'free',
    status: 'inactive',
    expiresAt: null,
  });

  const fetchBots = async () => {
    try {
      setLoading(true);
      
      // Fetch user's chatbots
      const { data: botsData, error: botsError } = await supabase
        .from('bots')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (botsError) {
        console.error('Error fetching bots:', botsError);
      } else {
        setChatbots(botsData || []);
      }
    } catch (err) {
      console.error('Error fetching bots:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    const fetchDashboardData = async () => {
      try {
        await fetchBots();
        
        // Fetch subscription info
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('plan, subscription_status, subscription_period_end')
          .eq('id', user.id)
          .single();
          
        if (!profileError && profileData) {
          setSubscription({
            plan: profileData.plan || 'free',
            status: profileData.subscription_status || 'inactive',
            expiresAt: profileData.subscription_period_end
          });
        }
        
        // Fetch analytics stats if API is ready
        try {
          const response = await fetch('/api/analytics/dashboard-stats');
          if (response.ok) {
            const data = await response.json();
            setStats({
              totalConversations: data.total_conversations || 0,
              successRate: data.success_rate || 0,
              safetyScore: data.safety_score || 0,
              recentActivities: data.recent_conversations || [],
            });
          }
        } catch (statsError) {
          console.error('Error fetching analytics:', statsError);
          // If analytics API fails, keep zeros as default
        }
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  // Open confirmation modal
  const openDeleteConfirmation = (botId: string) => {
    setConfirmDelete(botId);
    setConfirmChecked(false);
  };

  // Close confirmation modal
  const closeDeleteConfirmation = () => {
    setConfirmDelete(null);
    setConfirmChecked(false);
  };

  // Function to handle bot deletion
  const handleDeleteBot = async () => {
    if (!confirmDelete || !confirmChecked) return;
    
    setDeleting(confirmDelete);
    try {
      const response = await fetch(`/api/delete-bot?id=${confirmDelete}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        // Remove the bot from the state
        setChatbots(chatbots.filter(bot => bot.id !== confirmDelete));
        closeDeleteConfirmation();
      } else {
        const error = await response.json();
        console.error('Error deleting bot:', error);
        alert('Failed to delete bot: ' + (error.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error deleting bot:', error);
      alert('Failed to delete bot. Please try again.');
    } finally {
      setDeleting(null);
    }
  };

  // Handle sign out
  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      router.push('/login');
    }
  };

  // Format date helper function
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Get plan name display
  const getPlanDisplay = () => {
    switch(subscription.plan) {
      case 'pro': return 'Pro';
      case 'business': return 'Business';
      default: return 'Free';
    }
  };

  // Get bot limit based on plan
  const getBotLimit = () => {
    switch(subscription.plan) {
      case 'pro': return 3;
      case 'business': return '∞';
      default: return 1;
    }
  };

  if (!user) return null;

  return (
    <>
      <Header showSignOut={true} onSignOut={handleSignOut} />
      
      {/* Custom Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg border border-gray-700 shadow-xl max-w-md w-full p-6 animate-fadeIn">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center mb-4 bg-red-500 bg-opacity-20 rounded-full p-3">
                <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white">Delete Bot</h3>
              <p className="mt-2 text-gray-300">Are you sure you want to delete this bot? This action cannot be undone and all conversations will be permanently lost.</p>
            </div>

            <div className="mb-6">
            <label className="flex items-center space-x-3 text-gray-300 select-none cursor-pointer">
                <div className="relative flex items-center justify-center">
                <input
                    type="checkbox"
                    checked={confirmChecked}
                    onChange={(e) => setConfirmChecked(e.target.checked)}
                    className="sr-only" // Hidden original checkbox
                />
                <div className={`w-5 h-5 border ${confirmChecked ? 'bg-red-500 border-red-500' : 'bg-gray-700 border-gray-600'} rounded transition-colors flex items-center justify-center`}>
                    {confirmChecked && (
                    <svg className="w-4 h-4 text-white" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z" />
                    </svg>
                    )}
                </div>
                </div>
                <span>I understand that this action is irreversible</span>
            </label>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={closeDeleteConfirmation}
                className="flex-1 px-4 py-2 rounded bg-gray-700 hover:bg-gray-600 text-white font-medium transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteBot}
                disabled={!confirmChecked || deleting === confirmDelete}
                className="flex-1 px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleting === confirmDelete ? 'Deleting...' : 'Delete Bot'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-gray-900 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-gray-800/60 backdrop-filter backdrop-blur-sm rounded-xl shadow-lg overflow-hidden border border-gray-700">
                <div className="p-6">
                  <div className="flex flex-col items-center">
                    <div className="h-20 w-20 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-xl font-bold mb-4">
                      {user.email?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <h2 className="text-xl font-bold text-white">{user.email?.split('@')[0]}</h2>
                    <p className="text-gray-400 text-sm">{user.email}</p>
                  </div>
                  <div className="mt-6 border-t border-gray-700 pt-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Plan</span>
                      <span className="font-semibold text-white">{getPlanDisplay()}</span>
                    </div>
                    <div className="mt-2 flex justify-between text-sm">
                      <span className="text-gray-400">Bots Created</span>
                      <span className="font-semibold text-white">{chatbots.length}/{getBotLimit()}</span>
                    </div>
                    {subscription.plan === 'free' ? (
                      <div className="mt-4">
                        <SubscribeButton planId="pro" className="w-full">
                          Upgrade to Pro
                        </SubscribeButton>
                      </div>
                    ) : subscription.expiresAt && (
                      <div className="mt-2 text-xs text-gray-400">
                        Renews: {formatDate(subscription.expiresAt as string)}
                      </div>
                    )}
                  </div>
                </div>
                <div className="bg-gray-800 border-t border-gray-700">
                  <nav className="px-4 py-3 space-y-1">
                    <a href="#" className="flex items-center px-2 py-2 text-sm font-medium rounded-md bg-gray-700 text-white">
                      <svg className="mr-3 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                      Dashboard
                    </a>
                    <a href="#" className="flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-300 hover:bg-gray-700 hover:text-white">
                      <svg className="mr-3 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Analytics
                    </a>
                    <a href="#" className="flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-300 hover:bg-gray-700 hover:text-white">
                      <svg className="mr-3 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Settings
                    </a>
                    <a href="#" className="flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-300 hover:bg-gray-700 hover:text-white">
                      <svg className="mr-3 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Help & Support
                    </a>
                  </nav>
                </div>
              </div>
            </div>

            {/* Main Dashboard Area */}
            <div className="lg:col-span-3 space-y-8">
              {/* Welcome Header */}
              <header className="bg-gray-800/60 backdrop-filter backdrop-blur-sm rounded-xl shadow-lg overflow-hidden border border-gray-700 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-white">Welcome, {user.email?.split('@')[0]}</h1>
                    <p className="text-gray-400 mt-1">Here's what's happening with your AI assistants</p>
                  </div>
                  <Link href="/create">
                    <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                      <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Create New Bot
                    </button>
                  </Link>
                </div>
              </header>

              {/* Stats Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-800/60 backdrop-filter backdrop-blur-sm rounded-xl shadow-lg overflow-hidden border border-gray-700 p-6">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-blue-500/20 text-blue-400">
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h2 className="text-lg font-semibold text-white">Total Conversations</h2>
                      <p className="mt-1 text-3xl font-bold text-white">{loading ? '...' : stats.totalConversations}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-800/60 backdrop-filter backdrop-blur-sm rounded-xl shadow-lg overflow-hidden border border-gray-700 p-6">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-purple-500/20 text-purple-400">
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h2 className="text-lg font-semibold text-white">Safety Score</h2>
                      <p className="mt-1 text-3xl font-bold text-white">{loading ? '...' : `${stats.safetyScore}%`}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-800/60 backdrop-filter backdrop-blur-sm rounded-xl shadow-lg overflow-hidden border border-gray-700 p-6">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-green-500/20 text-green-400">
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h2 className="text-lg font-semibold text-white">Success Rate</h2>
                      <p className="mt-1 text-3xl font-bold text-white">{loading ? '...' : `${stats.successRate}%`}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* My Chatbots */}
              <div className="bg-gray-800/60 backdrop-filter backdrop-blur-sm rounded-xl shadow-lg overflow-hidden border border-gray-700">
                <div className="px-6 py-4 border-b border-gray-700 flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-white">My Chatbots</h2>
                  {chatbots.length >= 1 && subscription.plan !== 'free' && (
                    <Link href="/create">
                      <button className="text-sm text-blue-400 hover:text-blue-300 flex items-center">
                        <svg className="mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Create New
                      </button>
                    </Link>
                  )}
                </div>
                
                <div className="px-6 py-4">
                  {loading ? (
                    <div className="flex justify-center py-10">
                      <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </div>
                  ) : chatbots.length === 0 ? (
                    <div className="text-center py-10">
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                      </svg>
                      <h3 className="mt-2 text-sm font-medium text-gray-300">No chatbots yet</h3>
                      <p className="mt-1 text-sm text-gray-400">Get started by creating your first AI assistant.</p>
                      <div className="mt-6">
                        <Link href="/create">
                          <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                            <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Create New Bot
                          </button>
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <div className="grid gap-6 md:grid-cols-2">
                      {chatbots.map((bot) => (
                        <div key={bot.id} className="bg-gray-700/50 rounded-lg border border-gray-600 overflow-hidden hover:border-blue-500 transition-all group">
                          <div className="px-4 py-4 border-b border-gray-600 flex justify-between items-center">
                            <div className="flex items-center space-x-3">
                              <div className="p-2 rounded-full bg-blue-500/20 text-blue-400">
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                </svg>
                              </div>
                              <h3 className="font-medium text-white">{bot.name || bot.company_name || 'AI Assistant'}</h3>
                            </div>
                            <span className="text-xs px-2 py-1 rounded-full bg-green-900/30 text-green-400">Active</span>
                          </div>
                          <div className="px-4 py-3">
                            <div className="flex justify-between text-sm text-gray-400 mb-3">
                              <span>Type: {bot.bot_type || 'Assistant'}</span>
                              <span>Created: {new Date(bot.created_at).toLocaleDateString()}</span>
                            </div>
                            <div className="text-sm text-white">
                              <div className="flex justify-between mb-1">
                                <span className="text-gray-400">Conversations</span>
                                <span>0</span>
                              </div>
                              <div className="flex justify-between mb-1">
                                <span className="text-gray-400">Success Rate</span>
                                <span>0%</span>
                              </div>
                            </div>
                          </div>
                                <div className="bg-gray-700 grid grid-cols-4 gap-1 p-2">
                                <Link href={`/chatbot?botId=${bot.id}`} className="col-span-1">
                                    <button className="w-full text-sm py-2 rounded bg-gray-600 hover:bg-gray-500 text-white transition-colors">
                                    Chat
                                    </button>
                                </Link>
                                <Link href={`/edit-bot/${bot.id}`} className="col-span-1">
                                    <button className="w-full text-sm py-2 rounded bg-gray-600 hover:bg-gray-500 text-white transition-colors">
                                    Edit
                                    </button>
                                </Link>
                                <Link href={`/bot-analytics/${bot.id}`} className="col-span-1">
                                    <button className="w-full text-sm py-2 rounded bg-gray-600 hover:bg-gray-500 text-white transition-colors">
                                    Analytics
                                    </button>
                                </Link>
                                <div className="col-span-1">
                                    <button
                                    onClick={() => openDeleteConfirmation(bot.id)}
                                    className="w-full text-sm py-2 rounded bg-red-600/40 hover:bg-red-500/60 text-red-200 transition-colors"
                                    >
                                    Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

        {/* Subscription Plan Upgrade - show for free plan users */}
                    {subscription.plan === 'free' && (
                        <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 backdrop-filter backdrop-blur-sm rounded-xl shadow-lg overflow-hidden border border-gray-700 p-6">
                        <div className="flex flex-col md:flex-row items-center justify-between">
                            <div className="mb-4 md:mb-0">
                            <h2 className="text-lg font-semibold text-white">Upgrade to Pro</h2>
                            <p className="text-gray-400 mt-1">Get access to 3 bots, analytics, and more features</p>
                            </div>
                            <SubscribeButton planId="pro" className="px-6">
                            <span className="flex items-center">
                                Upgrade Now
                                <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </span>
                            </SubscribeButton>
                        </div>
                        </div>
                    )}

                    {/* Recent Activity */}
                    <div className="bg-gray-800/60 backdrop-filter backdrop-blur-sm rounded-xl shadow-lg overflow-hidden border border-gray-700">
                        <div className="px-6 py-4 border-b border-gray-700">
                        <h2 className="text-lg font-semibold text-white">Recent Activity</h2>
                        </div>
                        
                        {/* Show activity or empty state */}
                        {(stats.recentActivities && stats.recentActivities.length > 0) ? (
                        <div className="divide-y divide-gray-700">
                            {(stats.recentActivities as any[]).map((activity, index) => (
                            <div key={index} className="px-6 py-4 flex items-center justify-between">
                                <div className="flex items-center">
                                <div className="p-2 rounded-full bg-blue-500/20 text-blue-400">
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-white">
                                    {activity.bots?.name || activity.bots?.company_name || 'AI Assistant'}
                                    </p>
                                    <p className="text-xs text-gray-400">
                                    {activity.message_count || 0} messages • 
                                    {activity.successful ? ' Successful' : ' Incomplete'}
                                    </p>
                                </div>
                                </div>
                                <div className="text-right text-xs text-gray-400">
                                {new Date(activity.start_time).toLocaleString()}
                                </div>
                            </div>
                            ))}
                        </div>
                        ) : (
                        <div className="text-center py-10">
                            <svg className="mx-auto h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <h3 className="mt-2 text-sm font-medium text-gray-300">No recent activity</h3>
                            <p className="mt-1 text-sm text-gray-400">Your bot activity will appear here.</p>
                        </div>
                        )}
                    </div>
                    </div>
                </div>
                </div>
            </div>
            </>
        );
        }