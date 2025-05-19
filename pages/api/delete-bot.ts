// pages/api/delete-bot.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Create authenticated client
    const supabase = createServerSupabaseClient({ req, res });
    
    // Get session and verify authentication
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const botId = req.query.id as string;
    
    if (!botId) {
      return res.status(400).json({ error: 'Bot ID is required' });
    }
    
    // Verify the bot belongs to the user
    const { data: botData, error: botError } = await supabase
      .from('bots')
      .select('id, user_id')
      .eq('id', botId)
      .single();
    
    if (botError || !botData) {
      return res.status(404).json({ error: 'Bot not found' });
    }
    
    if (botData.user_id !== session.user.id) {
      return res.status(403).json({ error: 'You do not have permission to delete this bot' });
    }
    
    // Delete related conversations and messages
    // First, get all conversation IDs for this bot
    const { data: conversationsData } = await supabase
      .from('conversations')
      .select('id')
      .eq('bot_id', botId);
    
    if (conversationsData && conversationsData.length > 0) {
      // Get conversation IDs
      const conversationIds = conversationsData.map(conv => conv.id);
      
      // Delete messages for these conversations
      const { error: messagesError } = await supabase
        .from('messages')
        .delete()
        .in('conversation_id', conversationIds);
      
      if (messagesError) {
        console.error('Error deleting messages:', messagesError);
      }
      
      // Delete conversations
      const { error: convsError } = await supabase
        .from('conversations')
        .delete()
        .in('id', conversationIds);
      
      if (convsError) {
        console.error('Error deleting conversations:', convsError);
      }
    }
    
    // Finally, delete the bot
    const { error: deleteBotError } = await supabase
      .from('bots')
      .delete()
      .eq('id', botId);
    
    if (deleteBotError) {
      return res.status(500).json({ 
        error: 'Error deleting bot', 
        details: deleteBotError.message 
      });
    }
    
    return res.status(200).json({ success: true });
  } catch (error: unknown) {
    console.error('Server error:', error);
    let message = 'An unknown error occurred';
    
    if (error instanceof Error) {
      message = error.message;
    }
    
    return res.status(500).json({ 
      error: 'Server error', 
      message 
    });
  }
}