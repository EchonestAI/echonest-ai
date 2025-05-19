// pages/api/analytics/record-conversation.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';

// Define interface for message structure
interface Message {
  isBot: boolean;
  content: string;
  timestamp?: string;
  tokens?: number;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Create authenticated Supabase client
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

  const { 
    botId,
    sessionId,
    startTime,
    endTime = null,
    successful = null,
    messages = []
  } = req.body;
  
  if (!botId || !sessionId) {
    return res.status(400).json({ error: 'botId and sessionId are required' });
  }

  try {
    // Verify the bot belongs to the current user
    const { data: bot, error: botError } = await supabase
      .from('bots')
      .select('id')
      .eq('id', botId)
      .eq('user_id', session.user.id)
      .single();
      
    if (botError || !bot) {
      return res.status(404).json({ error: 'Bot not found or access denied' });
    }
    
    // Create new conversation or update existing one if conversationId is provided
    if (req.body.conversationId) {
      // Update existing conversation
      const { data: conversation, error: conversationError } = await supabase
        .from('conversations')
        .update({
          end_time: endTime || new Date().toISOString(),
          successful: successful,
          message_count: messages.length > 0 ? messages.length : undefined
        })
        .eq('id', req.body.conversationId)
        .eq('user_id', session.user.id)
        .select()
        .single();
        
      if (conversationError) throw conversationError;
      
      // Add new messages if provided
      if (messages.length > 0 && conversation) {
        const formattedMessages = messages.map((msg: Message) => ({
          conversation_id: conversation.id,
          bot_id: botId,
          user_id: session.user.id,
          is_bot_message: msg.isBot,
          content: msg.content,
          sent_at: msg.timestamp || new Date().toISOString(),
          tokens_used: msg.tokens || null
        }));
        
        const { error: messagesError } = await supabase
          .from('messages')
          .insert(formattedMessages);
          
        if (messagesError) throw messagesError;
      }
      
      return res.status(200).json({
        success: true,
        conversation_id: conversation?.id
      });
    } else {
      // Create new conversation
      const { data: conversation, error: conversationError } = await supabase
        .from('conversations')
        .insert({
          bot_id: botId,
          user_id: session.user.id,
          session_id: sessionId,
          start_time: startTime || new Date().toISOString(),
          end_time: endTime,
          successful: successful,
          message_count: messages.length
        })
        .select()
        .single();
        
      if (conversationError) throw conversationError;
      
      // Add messages if provided
      if (messages.length > 0 && conversation) {
        const formattedMessages = messages.map((msg: Message) => ({
          conversation_id: conversation.id,
          bot_id: botId,
          user_id: session.user.id,
          is_bot_message: msg.isBot,
          content: msg.content,
          sent_at: msg.timestamp || new Date().toISOString(),
          tokens_used: msg.tokens || null
        }));
        
        const { error: messagesError } = await supabase
          .from('messages')
          .insert(formattedMessages);
          
        if (messagesError) throw messagesError;
      }
      
      return res.status(200).json({
        success: true,
        conversation_id: conversation?.id
      });
    }
  } catch (error) {
    console.error('Error recording conversation:', error);
    return res.status(500).json({ error: 'Error recording conversation data' });
  }
}