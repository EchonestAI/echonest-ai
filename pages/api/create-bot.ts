// pages/api/create-bot.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Check method
  if (req.method !== 'POST') {
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
    
    // Get request data
    const { botType, companyName, tone, industry, faq, email } = req.body;
    
    console.log('Creating bot with data:', {
      botType, companyName, tone, industry, 
      faqLength: faq?.length, email
    });
    
    // Validate required fields
    if (!botType || !companyName) {
      return res.status(400).json({ 
        error: 'Missing required fields', 
        requiredFields: ['botType', 'companyName'] 
      });
    }
    
    // Insert the bot
    const { data, error } = await supabase
      .from('bots')
      .insert({
        bot_type: botType,
        company_name: companyName,
        tone: tone || 'friendly',
        industry: industry || 'general',
        faq: faq || '',
        email: email || '',
        user_id: session.user.id
      })
      .select();
      
    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ 
        error: 'Database error', 
        details: error.message,
        hint: error.hint,
        code: error.code
      });
    }
    
    if (!data || data.length === 0) {
      return res.status(500).json({ 
        error: 'Bot created but no data returned' 
      });
    }
    
    // Generate prompt with strengthened language detection instruction
    const prompt = `You are a helpful and ${tone || 'friendly'} AI assistant for ${companyName}, which operates in the ${industry || 'general'} industry.

Your job is to assist users as a ${botType} bot.

MANDATORY LANGUAGE INSTRUCTION: You MUST communicate EXCLUSIVELY in the language of the FAQ provided below. You are FORBIDDEN from using English unless the FAQ itself is in English. The language detection rule overrides all other instructions.

LANGUAGE DETECTION STEP: 
1. First, analyze the FAQ text to determine its language.
2. Identify the primary language of the FAQ (Dutch, German, French, etc.)
3. Use ONLY this language for ALL communications, including your very first greeting.

Here is the company FAQ and knowledge base that determines your primary language:
${faq || 'No FAQ provided'}

Use this information to answer user questions clearly, concisely, and professionally.
Do not make up information. If unsure, ask the user to contact human support.

FINAL WARNING: DO NOT default to English. Your first greeting and ALL subsequent responses MUST be in the same language as the FAQ above - not in English (unless the FAQ itself is in English).`;
    
    // Return success response with useAutoGreeting flag
    return res.status(200).json({ 
      success: true, 
      botId: data[0].id,
      prompt,
      useAutoGreeting: false
    });
  } catch (error: unknown) {
    // Handle errors
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