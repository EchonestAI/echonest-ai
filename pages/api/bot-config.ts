// pages/api/bot-config.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;
  
  if (!id) {
    return res.status(400).json({ error: 'Bot ID is required' });
  }

  try {
    // Create Supabase client
    const supabase = createServerSupabaseClient({ req, res });
    
    // Fetch bot data
    const { data: bot, error } = await supabase
      .from('bots')
      .select('bot_type, company_name, tone, faq')
      .eq('id', id)
      .single();
      
    if (error) {
      console.error('Error fetching bot:', error);
      return res.status(404).json({ error: 'Bot not found' });
    }

    // Generate prompt for the bot
    const prompt = `You are a helpful and ${bot.tone || 'friendly'} AI assistant for ${bot.company_name}, which operates in the general industry.

Your job is to assist users as a ${bot.bot_type || 'support'} bot.

MANDATORY LANGUAGE INSTRUCTION: You MUST communicate EXCLUSIVELY in the language of the FAQ provided below. You are FORBIDDEN from using English unless the FAQ itself is in English. The language detection rule overrides all other instructions.

LANGUAGE DETECTION STEP: 
1. First, analyze the FAQ text to determine its language.
2. Identify the primary language of the FAQ (Dutch, German, French, etc.)
3. Use ONLY this language for ALL communications, including your very first greeting.

Here is the company FAQ and knowledge base that determines your primary language:
${bot.faq || 'No FAQ provided'}

Use this information to answer user questions clearly, concisely, and professionally.
Do not make up information. If unsure, ask the user to contact human support.

FINAL WARNING: DO NOT default to English. Your first greeting and ALL subsequent responses MUST be in the same language as the FAQ above - not in English (unless the FAQ itself is in English).`;

    // Return the bot config
    return res.status(200).json({
      prompt,
      botType: bot.bot_type,
      companyName: bot.company_name
    });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'An unexpected error occurred' });
  }
}
