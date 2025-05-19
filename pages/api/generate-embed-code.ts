// pages/api/generate-embed-code.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
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
    
    const { botId, customizations } = req.body;
    
    if (!botId) {
      return res.status(400).json({ error: 'Bot ID is required' });
    }
    
    // Verify the bot belongs to the user
    const { data: bot, error: botError } = await supabase
      .from('bots')
      .select('id, name, company_name')
      .eq('id', botId)
      .eq('user_id', session.user.id)
      .single();
      
    if (botError || !bot) {
      return res.status(404).json({ error: 'Bot not found' });
    }
    
    // Default customizations
    const defaults = {
      theme: 'dark',
      primaryColor: '#3B82F6',  // Blue-500
      chatTitle: bot.name || bot.company_name || 'Chat Assistant',
      position: 'bottom-right', // 'bottom-right', 'bottom-left', 'top-right', 'top-left'
      welcomeMessage: `Welcome! How can I help you today?`,
      buttonIcon: 'chat',       // 'chat', 'message', 'help'
      height: 500,
      width: 350
    };
    
    // Merge with provided customizations
    const settings = { ...defaults, ...customizations };
    
    // Generate a unique script ID for the bot
    const scriptId = `echonest-bot-${botId}`;
    
    // Create the embed code
    const embedCode = `
<!-- Echonest.ai Chat Widget -->
<script id="${scriptId}">
(function(w, d, s, o) {
  const js = d.createElement(s);
  js.src = '${process.env.NEXT_PUBLIC_URL || 'https://echonest.ai'}/widget.js';
  js.async = 1;
  js.dataset.botId = '${botId}';
  js.dataset.primaryColor = '${settings.primaryColor}';
  js.dataset.theme = '${settings.theme}';
  js.dataset.title = '${settings.chatTitle}';
  js.dataset.position = '${settings.position}';
  js.dataset.welcomeMessage = '${settings.welcomeMessage}';
  js.dataset.buttonIcon = '${settings.buttonIcon}';
  js.dataset.height = '${settings.height}';
  js.dataset.width = '${settings.width}';
  d.getElementById('${scriptId}').appendChild(js);
})(window, document, 'script');
</script>
<!-- End Echonest.ai Chat Widget -->
`.trim();
    
    // Return the embed code
    return res.status(200).json({ 
      embedCode,
      settings
    });
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