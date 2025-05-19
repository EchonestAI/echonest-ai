// pages/api/chat-with-bot.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { OpenAI } from 'openai';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// List of potentially harmful content patterns
const SAFETY_PATTERNS = [
  { pattern: /passw(or)?d|secret|credentials?/i, type: 'potential_credentials', severity: 'medium' },
  { pattern: /(^|\s)prompts?(\s|$)|system\s+instructions?|ignore\s+previous|ignore\s+above/i, type: 'prompt_injection', severity: 'high' },
  { pattern: /\b(hate|kill|hurt|harm|attack)\b/i, type: 'harmful_content', severity: 'medium' },
  { pattern: /\b(phone|ssn|credit|card|passport)\s*:?\s*\d/i, type: 'pii_data', severity: 'high' },
];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { 
    message, 
    prompt, 
    botId, 
    conversationId, 
    sessionId, 
    isFeedback, 
    feedbackRating, 
    markSuccessful, 
    endConversation 
  } = req.body;

  // Optional: Get authenticated user if you want to track user-specific conversations
  const supabase = createServerSupabaseClient({ req, res });
  const { data: { session } } = await supabase.auth.getSession();
  const userId = session?.user?.id;

  // If this is a feedback update request
  if (isFeedback && conversationId && userId) {
    try {
      const updates: any = {};
      
      if (feedbackRating !== undefined) {
        updates.feedback_rating = feedbackRating;
      }
      
      if (markSuccessful !== undefined) {
        updates.successful = markSuccessful;
      }
      
      if (endConversation) {
        updates.end_time = new Date().toISOString();
      }
      
      // Only proceed if we have updates to make
      if (Object.keys(updates).length > 0) {
        const { error } = await supabase
          .from('conversations')
          .update(updates)
          .eq('id', conversationId)
          .eq('user_id', userId);
          
        if (error) {
          console.error('Error updating conversation feedback:', error);
          return res.status(500).json({ error: "Error updating feedback" });
        }
        
        return res.status(200).json({ success: true });
      }
    } catch (error) {
      console.error('Error in feedback processing:', error);
      return res.status(500).json({ error: "Error processing feedback" });
    }
  }

  if (!prompt || !message) {
    return res.status(400).json({ error: "Missing message or prompt." });
  }

  try {
    // If we have a botId and a logged-in user, we can track the conversation
    let currentConversationId = conversationId;
    
    if (userId && botId) {
      // Create or update conversation
      if (!currentConversationId) {
        const newSessionId = sessionId || Math.random().toString(36).substring(2, 15);
        
        const { data: newConversation, error: conversationError } = await supabase
          .from('conversations')
          .insert({
            bot_id: botId,
            user_id: userId,
            session_id: newSessionId,
            start_time: new Date().toISOString(),
            message_count: 0
          })
          .select()
          .single();
          
        if (!conversationError && newConversation) {
          currentConversationId = newConversation.id;
        }
      }
      
      // Safety check for user message
      for (const pattern of SAFETY_PATTERNS) {
        if (pattern.pattern.test(message)) {
          // Record safety issue
          await supabase
            .from('safety_issues')
            .insert({
              bot_id: botId,
              issue_type: pattern.type,
              severity: pattern.severity,
              content: message,
              detected_at: new Date().toISOString()
            });
          
          break; // Only record the first match to avoid duplicates
        }
      }
      
      // If we have a conversation ID, record the user message
      if (currentConversationId) {
        await supabase
          .from('messages')
          .insert({
            conversation_id: currentConversationId,
            bot_id: botId,
            user_id: userId,
            is_bot_message: false,
            content: message,
            sent_at: new Date().toISOString()
          });
      }
    }

    // Get response from OpenAI
    const chat = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: prompt },
        { role: 'user', content: message }
      ]
    });

    const reply = chat.choices[0].message?.content;
    
    // Safety check for bot response
    if (userId && botId && reply) {
      for (const pattern of SAFETY_PATTERNS) {
        if (pattern.pattern.test(reply)) {
          // Record safety issue for bot response
          await supabase
            .from('safety_issues')
            .insert({
              bot_id: botId,
              issue_type: `bot_${pattern.type}`,
              severity: pattern.severity,
              content: reply.substring(0, 100) + '...', // Only store a snippet
              detected_at: new Date().toISOString()
            });
          
          break;
        }
      }
    }
    
    // If we're tracking the conversation, also record the bot's response
    if (userId && botId && currentConversationId) {
      await supabase
        .from('messages')
        .insert({
          conversation_id: currentConversationId,
          bot_id: botId,
          user_id: userId,
          is_bot_message: true,
          content: reply || '',
          sent_at: new Date().toISOString(),
          tokens_used: chat.usage?.total_tokens || 0
        });
    }

    // Return the response to the user, including the conversation ID if we're tracking
    res.status(200).json({ 
      response: reply,
      conversationId: currentConversationId || null
    });
  } catch (error) {
    console.error('Error in chat-with-bot:', error);
    res.status(500).json({ error: "Error processing your request" });
  }
}