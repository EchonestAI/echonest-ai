// pages/edit-bot/[id].tsx
import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/router';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Header from '../../components/Header';
import EmbedCodeGenerator from '../../components/EmbedCodeGenerator';

// Define interface for bot data
interface BotFormData {
  name: string;
  bot_type: string;
  tone: string;
  company_name: string;
  faq: string;
}

export default function EditBotPage() {
  const router = useRouter();
  const { id } = router.query;
  const user = useUser();
  const supabase = useSupabaseClient();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [botData, setBotData] = useState<BotFormData>({
    name: '',
    bot_type: '',
    tone: '',
    company_name: '',
    faq: ''
  });
  
  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    
    const fetchBotData = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('bots')
          .select('*')
          .eq('id', id)
          .eq('user_id', user.id)
          .single();
        
        if (error) {
          console.error('Error fetching bot:', error);
          alert('Failed to fetch bot details.');
          router.push('/dashboard');
          return;
        }
        
        if (data) {
          setBotData({
            name: data.name || data.company_name || 'My Bot',
            bot_type: data.bot_type || 'support',
            tone: data.tone || 'friendly',
            company_name: data.company_name || '',
            faq: data.faq || ''
          });
        }
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBotData();
  }, [id, user, router, supabase]);
  
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setBotData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!id || !user) return;
    
    try {
      setSaving(true);
      
      const updates = {
        name: botData.name,
        bot_type: botData.bot_type,
        tone: botData.tone,
        company_name: botData.company_name,
        faq: botData.faq,
        updated_at: new Date().toISOString()
      };
      
      const { error } = await supabase
        .from('bots')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) {
        console.error('Error updating bot:', error);
        alert('Failed to update bot.');
        return;
      }
      
      alert('Bot updated successfully!');
      router.push('/dashboard');
    } catch (err) {
      console.error('Error:', err);
      alert('An unexpected error occurred.');
    } finally {
      setSaving(false);
    }
  };
  
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
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
            <h1 className="text-2xl font-bold">Edit Bot</h1>
          </div>
          
          <Button 
            onClick={() => document.getElementById('edit-bot-form')?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }))}
            disabled={saving}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          >
            {saving ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : 'Save Changes'}
          </Button>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-6 shadow-xl border border-gray-700">
          <form id="edit-bot-form" onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Bot Name</label>
              <input
                type="text"
                name="name"
                value={botData.name}
                onChange={handleChange}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter bot name"
              />
            </div>
            
            <div className="mt-8">
              <EmbedCodeGenerator 
                botId={id as string} 
                initialBotName={botData.name}
                onSave={async (settings) => {
                  // You can save the embed settings to the database if needed
                  // For example:
                  try {
                    await supabase
                      .from('bot_embed_settings')
                      .upsert({
                        bot_id: id,
                        settings: settings
                      });
                  } catch (error) {
                    console.error('Error saving embed settings:', error);
                  }
                }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Bot Type</label>
              <select
                name="bot_type"
                value={botData.bot_type}
                onChange={handleChange}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="support">Customer Support</option>
                <option value="sales">Sales Assistant</option>
                <option value="booking">Booking Assistant</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Tone</label>
              <select
                name="tone"
                value={botData.tone}
                onChange={handleChange}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="friendly">Friendly</option>
                <option value="formal">Formal</option>
                <option value="casual">Casual</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Company Name</label>
              <input
                type="text"
                name="company_name"
                value={botData.company_name}
                onChange={handleChange}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter company name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">FAQ Content</label>
              <textarea
                name="faq"
                value={botData.faq}
                onChange={handleChange}
                rows={10}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Paste your FAQ content or knowledge base here..."
              ></textarea>
              <p className="text-xs text-gray-400 mt-1">This content will be used to train your bot. Add FAQs, product information, or any knowledge base you want your bot to learn from.</p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}