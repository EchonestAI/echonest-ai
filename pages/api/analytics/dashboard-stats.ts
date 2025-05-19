// pages/api/analytics/dashboard-stats.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Create authenticated Supabase client
    const supabase = createServerSupabaseClient({ req, res });
    
    // Get user from session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const userId = session.user.id;

    // Get total conversations count
    const { data: conversationsData, error: conversationsError } = await supabase
      .rpc('get_total_conversations', { user_id_param: userId });
    
    if (conversationsError) {
      console.error('Failed to get conversations:', conversationsError.message);
      // Don't throw error, continue with default value
    }

    // Get success rate
    const { data: successRateData, error: successRateError } = await supabase
      .rpc('get_success_rate', { user_id_param: userId });
      
    if (successRateError) {
      console.error('Failed to get success rate:', successRateError.message);
      // Don't throw error, continue with default value
    }

    // Get safety score
    const { data: safetyScoreData, error: safetyScoreError } = await supabase
      .rpc('get_safety_score', { user_id_param: userId });
      
    if (safetyScoreError) {
      console.error('Failed to get safety score:', safetyScoreError.message);
      // Don't throw error, continue with default value
    }

    // Get recent conversations
    const { data: recentConversations, error: recentConversationsError } = await supabase
      .from('conversations')
      .select(`
        id,
        start_time,
        duration_seconds,
        message_count,
        successful,
        feedback_rating,
        bots(name, company_name)
      `)
      .eq('user_id', userId)
      .order('start_time', { ascending: false })
      .limit(5);
      
    if (recentConversationsError) {
      console.error('Failed to get recent conversations:', recentConversationsError.message);
      // Don't throw error, continue with default value
    }

    const responseData = {
      total_conversations: conversationsData || 0,
      success_rate: successRateData || 0,
      safety_score: safetyScoreData || 0,
      recent_conversations: recentConversations || []
    };

    res.status(200).json(responseData);
  } catch (error: unknown) {
    // Properly handle unknown type error
    if (error instanceof Error) {
      console.error('API error:', error.message);
      res.status(500).json({ error: error.message });
    } else {
      console.error('Unknown API error:', error);
      res.status(500).json({ error: 'An unknown error occurred' });
    }
  }
}