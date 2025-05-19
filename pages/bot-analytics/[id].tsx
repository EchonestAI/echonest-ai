import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import Header from '../../components/Header';
import StatsOverview from '../../components/dashboard/StatsOverview';
import RecentActivity from '../../components/dashboard/RecentActivity';
import ConversationChart from '../../components/dashboard/ConversationChart';
import { Button } from '@/components/ui/button';

// Define proper types
interface Bot {
  id: string;
  name: string;
  type: string;
}

interface BotTotals {
  total_conversations: number;
  total_messages: number;
  avg_duration: number;
  success_rate: number;
  avg_rating: number;
}

interface DailyStat {
  date: string;
  conversation_count: number;
  message_count: number;
  success_rate: number;
}

interface SafetyIssue {
  issue_type: string;
  severity: string;
  detected_at: string;
  resolved: boolean;
}

interface Conversation {
  id: string;
  start_time: string;
  end_time: string | null;
  message_count: number;
  successful: boolean | null;
  duration_seconds: number | null;
  feedback_rating: number | null;
}

interface AnalyticsData {
  bot: Bot;
  dailyStats: DailyStat[];
  totals: BotTotals;
  safetyScore: number;
  safetyIssues: SafetyIssue[];
  recentConversations: Conversation[];
}

export default function BotAnalyticsPage() {
  const router = useRouter();
  const { id } = router.query;
  const user = useUser();
  const supabase = useSupabaseClient();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  
  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    
    const fetchAnalytics = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`/api/analytics/bot-stats?botId=${id}`);
        
        if (!response.ok) {
          console.error('Analytics API returned status:', response.status);
          // Try to get the error details from the response
          const errorText = await response.text();
          console.error('Error response:', errorText);
          
          // Show a more user-friendly error message
          setError(`Could not load analytics. Please try again later.`);
          setLoading(false);
          return; // Return early to avoid the .json() call on an error response
        }
        
        const data = await response.json();
        console.log('Analytics data:', data);
        setAnalyticsData(data);
        
      } catch (err) {
        console.error('Error fetching analytics:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch analytics');
      } finally {
        setLoading(false);
      }
    };
    
    fetchAnalytics();
  }, [id, user, router, supabase]);
  
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };
  
  // Format activity data for RecentActivity component
  const formatActivities = () => {
    if (!analyticsData?.recentConversations) return [];
    
    return analyticsData.recentConversations.map(convo => ({
      id: convo.id,
      type: 'chat' as const,
      bot: analyticsData.bot.name,
      time: new Date(convo.start_time).toLocaleString(),
      message: `${convo.message_count} messages ${convo.successful ? '• Successful' : ''}`,
    }));
  };
  
  // Format chart data for ConversationChart component
  const formatChartData = () => {
    if (!analyticsData?.dailyStats) return [];
    
    return analyticsData.dailyStats.slice(0, 7).map(day => ({
      date: day.date,
      count: day.conversation_count || 0
    })).reverse();
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <Header showSignOut={true} onSignOut={handleSignOut} />
        <div className="container mx-auto py-16 px-4 flex justify-center">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <Header showSignOut={true} onSignOut={handleSignOut} />
        <div className="container mx-auto py-16 px-4 flex flex-col items-center">
          <div className="bg-red-900/20 text-red-400 p-4 rounded-lg mb-4">
            <p>Error: {error}</p>
          </div>
          <Button 
            onClick={() => router.push('/dashboard')}
            className="mt-4"
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header showSignOut={true} onSignOut={handleSignOut} />
      
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => router.push('/dashboard')}
              className="flex items-center text-gray-400 hover:text-white transition"
            >
              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
              </svg>
              Back to Dashboard
            </button>
            <h1 className="text-2xl font-bold">Bot Analytics</h1>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-green-900/30 text-green-400 text-sm rounded-full">Active</span>
            <h2 className="text-xl font-semibold">{analyticsData?.bot?.name || 'My Bot'}</h2>
          </div>
        </div>
        
        {/* Stats Overview */}
        <div className="mb-8">
          <StatsOverview
            totalConversations={analyticsData?.totals?.total_conversations || 0}
            successRate={analyticsData?.totals?.success_rate || 0}
            safetyScore={analyticsData?.safetyScore || 0}
            loadingStats={false}
          />
        </div>
        
        {/* Chart and Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <ConversationChart 
            data={formatChartData()} 
            loading={false} 
          />
          
          <RecentActivity 
            activities={formatActivities()} 
            loading={false} 
          />
        </div>
        
        {/* Safety Issues Section */}
        {analyticsData?.safetyIssues && analyticsData.safetyIssues.length > 0 && (
          <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden border border-gray-700 mb-8">
            <div className="px-6 py-4 border-b border-gray-700">
              <h2 className="text-xl font-semibold">Safety Issues</h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left">
                    <th className="px-6 py-3 text-sm font-medium text-gray-400">Issue Type</th>
                    <th className="px-6 py-3 text-sm font-medium text-gray-400">Severity</th>
                    <th className="px-6 py-3 text-sm font-medium text-gray-400">Detected</th>
                    <th className="px-6 py-3 text-sm font-medium text-gray-400 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {analyticsData.safetyIssues.map((issue, i) => (
                    <tr key={i}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{issue.issue_type}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          issue.severity === 'high' ? 'bg-red-900/30 text-red-400' :
                          issue.severity === 'medium' ? 'bg-yellow-900/30 text-yellow-400' :
                          'bg-blue-900/30 text-blue-400'
                        }`}>
                          {issue.severity}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                        {new Date(issue.detected_at).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          issue.resolved ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'
                        }`}>
                          {issue.resolved ? 'Resolved' : 'Open'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {/* No data placeholder */}
        {(!analyticsData || 
          (analyticsData.totals.total_conversations === 0 && 
           analyticsData.dailyStats.length === 0 && 
           analyticsData.recentConversations.length === 0)) && (
          <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl p-10 border border-gray-700 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <h3 className="mt-4 text-xl font-medium text-white">No analytics data yet</h3>
            <p className="mt-2 text-gray-400 max-w-md mx-auto">
              As users interact with your bot, you'll see real-time analytics, conversation trends, and insights here.
            </p>
            <div className="mt-6">
              <Button 
                onClick={() => router.push(`/chatbot?botId=${id}`)}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                Start Chatting
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}