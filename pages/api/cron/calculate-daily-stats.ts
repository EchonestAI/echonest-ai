// pages/api/cron/calculate-daily-stats.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

// Initialize a server-side Supabase client using service role key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Check for API key to prevent unauthorized access
  const apiKey = req.headers['x-api-key'];
  if (apiKey !== process.env.CRON_API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // Execute the calculate_daily_stats function with default date (yesterday)
    const { data, error } = await supabase.rpc('calculate_daily_stats');
    
    if (error) {
      console.error('Error calculating daily stats:', error);
      return res.status(500).json({ error: error.message });
    }
    
    console.log('Daily stats calculated successfully');
    
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Unexpected error:', error);
    return res.status(500).json({ error: 'An unexpected error occurred' });
  }
}