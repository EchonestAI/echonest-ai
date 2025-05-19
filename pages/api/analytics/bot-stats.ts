// pages/api/analytics/bot-stats.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';

// Define proper types for the API response
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

interface DailyStat {
  date: string;
  conversation_count: number;
  message_count: number;
  success_rate: number;
  [key: string]: any; // For any other fields
}

interface BotTotals {
  total_conversations: number;
  total_messages: number;
  avg_duration: number;
  success_rate: number;
  avg_rating: number;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Create authenticated Supabase client
  try {
    const supabase = createServerSupabaseClient({ req, res });
    
    // Check if user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return res.status(401).json({
        error: 'not_authenticated',
        description: 'The user does not have an active session or is not authenticated',
      });
    }

    const { botId } = req.query;
    
    if (!botId || typeof botId !== 'string') {
       return res.status(400).json({ error: 'botId is required' });
    }

    // Verify the bot belongs to the current user
    const { data: bot, error: botError } = await supabase
      .from('bots')
      .select('id, name, company_name, bot_type')
      .eq('id', botId)
      .eq('user_id', session.user.id)
      .single();
      
    if (botError) {
      console.error('Bot fetch error:', botError);
      return res.status(404).json({ error: 'Bot not found or access denied' });
    }
    
    if (!bot) {
      return res.status(404).json({ error: 'Bot not found' });
    }
    
    // Get total stats
    let totals: BotTotals = {
      total_conversations: 0,
      total_messages: 0,
      avg_duration: 0,
      success_rate: 0,
      avg_rating: 0
    };
    
    try {
      const { data: totalsData, error: totalsError } = await supabase
        .rpc('get_bot_total_stats', { bot_id_param: botId });
        
      if (totalsError) {
        console.error('Totals error:', totalsError);
      } else if (totalsData) {
        totals = totalsData as BotTotals;
      }
    } catch (e) {
      console.error('Totals RPC error:', e);
    }
    
    // Get daily stats with fallback
    let dailyStats: DailyStat[] = [];
    try {
      const { data: dailyStatsData, error: statsError } = await supabase
        .from('daily_stats')
        .select('*')
        .eq('bot_id', botId)
        .order('date', { ascending: false })
        .limit(30);
        
      if (statsError) {
        console.error('Daily stats error:', statsError);
      } else {
        dailyStats = dailyStatsData as DailyStat[] || [];
      }
    } catch (e) {
      console.error('Daily stats error:', e);
    }
    
    // Get safety issues with fallback
    let safetyIssues: SafetyIssue[] = [];
    try {
      const { data: safetyIssuesData, error: safetyError } = await supabase
        .from('safety_issues')
        .select('issue_type, severity, detected_at, resolved')
        .eq('bot_id', botId)
        .order('detected_at', { ascending: false })
        .limit(10);
        
      if (safetyError) {
        console.error('Safety issues error:', safetyError);
      } else {
        safetyIssues = safetyIssuesData as SafetyIssue[] || [];
      }
    } catch (e) {
      console.error('Safety issues error:', e);
    }
    
    // Get recent conversations with fallback
    let recentConversations: Conversation[] = [];
    try {
      const { data: recentConversationsData, error: conversationsError } = await supabase
        .from('conversations')
        .select(`
          id,
          start_time,
          end_time,
          message_count,
          successful,
          duration_seconds,
          feedback_rating
        `)
        .eq('bot_id', botId)
        .order('start_time', { ascending: false })
        .limit(10);
        
      if (conversationsError) {
        console.error('Recent conversations error:', conversationsError);
      } else {
        recentConversations = recentConversationsData as Conversation[] || [];
      }
    } catch (e) {
      console.error('Recent conversations error:', e);
    }
    
    // Get safety score
    let safetyScore = 0;
    try {
      const { data: safetyScoreData, error: safetyScoreError } = await supabase
        .rpc('get_safety_score', { user_id_param: session.user.id });
        
      if (safetyScoreError) {
        console.error('Safety score error:', safetyScoreError);
      } else {
        safetyScore = safetyScoreData as number || 0;
      }
    } catch (e) {
      console.error('Safety score error:', e);
    }
    
    return res.status(200).json({
      bot: {
        id: bot.id,
        name: bot.name || bot.company_name || 'Unnamed Bot',
        type: bot.bot_type || 'Assistant'
      },
      dailyStats,
      totals,
      safetyScore,
      safetyIssues,
      recentConversations
    });
  } catch (error) {
    console.error('Unhandled error in bot-stats API:', error);
    return res.status(500).json({ 
      error: 'Error fetching bot analytics data',
      details: error instanceof Error ? error.message : String(error)
    });
  }
}