// pages/create.tsx with Echonest branding
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Header from '../components/Header';
import Link from 'next/link';
import EchonestLogo from '../components/EchonestLogo';

export default function CreateBotPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    botType: '',
    companyName: '',
    tone: '',
    industry: '',
    faq: '',
    email: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleNext = () => setStep((prev) => prev + 1);
  const handleBack = () => setStep((prev) => prev - 1);

  const handleSubmit = async () => {
    try {
      const res = await fetch('/api/create-bot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      const data = await res.json();
      
      // Make sure we include the useAutoGreeting flag in the URL
      const encodedPrompt = encodeURIComponent(data.prompt);
      window.location.href = `/chatbot?prompt=${encodedPrompt}&useAutoGreeting=false`;
    } catch (error) {
      console.error(error);
      alert('Something went wrong.');
    }
  };

  // Function to get the appropriate bot icon based on type
  const getBotIcon = () => {
    switch(form.botType) {
      case 'support': return '👨‍💻';
      case 'sales': return '💼';
      case 'booking': return '📆'; // Changed to a more recognizable calendar emoji
      default: return '🤖';
    }
  };
  
  // Animation for bot icon transitions
  const [animatingIcon, setAnimatingIcon] = useState(false);
  const [currentIcon, setCurrentIcon] = useState(getBotIcon());
  
  useEffect(() => {
    if (form.botType) {
      setAnimatingIcon(true);
      const timer = setTimeout(() => {
        setCurrentIcon(getBotIcon());
        setAnimatingIcon(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [form.botType]);

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full filter blur-3xl opacity-10"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500 rounded-full filter blur-3xl opacity-10"></div>
        
        <div className="relative max-w-4xl mx-auto px-4 py-16">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center mb-6 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full p-8 relative w-24 h-24">
              <div className={`absolute inset-0 flex items-center justify-center transition-all duration-300 text-7xl transform scale-50 ${animatingIcon ? 'opacity-0 scale-100' : 'opacity-100'}`}>
                {currentIcon}
              </div>
              {animatingIcon && (
                <div className="absolute inset-0 flex items-center justify-center opacity-0 text-7xl transform scale-25 animate-pulse">
                  {getBotIcon()}
                </div>
              )}
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
              Build Your AI Assistant
            </h1>
            <p className="text-gray-300 text-lg max-w-xl mx-auto">
              Create a custom AI chatbot tailored to your business needs in just a few steps.
            </p>
          </div>

          {/* Progress bar */}
          <div className="flex justify-between mb-12 relative">
            <div className="absolute top-1/2 h-1 w-full bg-gray-700 -translate-y-1/2"></div>
            <div 
              className="absolute top-1/2 h-1 bg-gradient-to-r from-blue-500 to-purple-500 -translate-y-1/2 transition-all duration-500 ease-in-out"
              style={{ width: `${((step - 1) / 2) * 100}%` }}
            ></div>
            
            {[1, 2, 3].map((num) => (
              <div 
                key={num} 
                className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300 ${
                  step >= num 
                    ? 'border-purple-500 bg-purple-500 text-white' 
                    : 'border-gray-700 bg-gray-800 text-gray-400'
                }`}
              >
                {step > num ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                ) : (
                  num
                )}
              </div>
            ))}
          </div>

          {/* Card container */}
          <div className="bg-gray-800 bg-opacity-70 backdrop-filter backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-700 p-8">
            {step === 1 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold mb-6">Basic Information</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-300">Bot Type</label>
                    <select
                      name="botType"
                      value={form.botType}
                      onChange={handleChange}
                      className="w-full bg-gray-900 text-white border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                    >
                      <option value="">Select a type</option>
                      <option value="support">Customer Support</option>
                      <option value="sales">Sales Assistant</option>
                      <option value="booking">Booking Assistant</option>
                    </select>
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-300">Company Name</label>
                    <div className="relative">
                      <input
                        name="companyName"
                        value={form.companyName}
                        onChange={handleChange}
                        placeholder="e.g. Acme Inc."
                        className="w-full bg-gray-900 text-white border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                      />
                      {form.companyName && (
                        <div className="absolute right-3 top-3 text-green-400">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between mt-8">
                  <Link href="/dashboard">
                    <button className="flex items-center gap-2 py-3 px-6 rounded-lg font-medium border border-gray-600 hover:border-gray-400 transition-all duration-300">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                      </svg>
                      Cancel
                    </button>
                  </Link>
                  <button
                    onClick={handleNext}
                    disabled={!form.botType || !form.companyName}
                    className={`flex items-center gap-2 py-3 px-6 rounded-lg font-medium transition-all duration-300 ${
                      !form.botType || !form.companyName
                        ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl'
                    }`}
                  >
                    Next
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold mb-6">Personality & Industry</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-300">Bot Tone</label>
                    <div className="grid grid-cols-3 gap-3">
                      {['friendly', 'formal', 'casual'].map((toneOption) => (
                        <div 
                          key={toneOption}
                          onClick={() => setForm({...form, tone: toneOption})}
                          className={`cursor-pointer border rounded-lg p-4 text-center transition-all ${
                            form.tone === toneOption 
                              ? 'border-purple-500 bg-purple-500 bg-opacity-20' 
                              : 'border-gray-700 hover:border-gray-500'
                          }`}
                        >
                          <div className="text-2xl mb-2">
                            {toneOption === 'friendly' && '😊'}
                            {toneOption === 'formal' && '🧐'}
                            {toneOption === 'casual' && '😎'}
                          </div>
                          <div className="capitalize">{toneOption}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-300">Industry</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                        </svg>
                      </span>
                      <input
                        name="industry"
                        value={form.industry}
                        onChange={handleChange}
                        placeholder="e.g. Healthcare, Retail, Technology"
                        className="w-full bg-gray-900 text-white border border-gray-600 rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-between mt-8">
                  <button
                    onClick={handleBack}
                    className="flex items-center gap-2 py-3 px-6 rounded-lg font-medium border border-gray-600 hover:border-gray-400 transition-all duration-300"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                    </svg>
                    Back
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={!form.tone || !form.industry}
                    className={`flex items-center gap-2 py-3 px-6 rounded-lg font-medium transition-all duration-300 ${
                      !form.tone || !form.industry
                        ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl'
                    }`}
                  >
                    Next
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold mb-6">Final Details</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-300">Paste Your FAQ</label>
                    <div className="relative">
                      <textarea
                        name="faq"
                        value={form.faq}
                        onChange={handleChange}
                        rows={5}
                        placeholder="Paste your company FAQ or knowledge base content here..."
                        className="w-full bg-gray-900 text-white border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                      />
                      <div className="absolute bottom-3 right-3 text-gray-500 text-sm">
                        {form.faq.length} characters
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-300">Your Email</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                        </svg>
                      </span>
                      <input
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="your@email.com"
                        className="w-full bg-gray-900 text-white border border-gray-600 rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                      />
                    </div>
                  </div>
                </div>

                {/* Bot preview */}
                {form.botType && form.companyName && form.tone && (
                  <div className="mt-6 p-4 bg-gray-900 rounded-lg border border-gray-700">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="text-2xl">{getBotIcon()}</div>
                      <div>
                        <p className="font-medium">{form.companyName} {
                          form.botType === 'support' ? 'Support Bot' : 
                          form.botType === 'sales' ? 'Sales Assistant' : 
                          'Booking Assistant'
                        }</p>
                        <p className="text-xs text-gray-400">Tone: <span className="capitalize">{form.tone}</span></p>
                      </div>
                    </div>
                    <div className="bg-gray-800 rounded p-3 text-sm">
                      <p className="text-gray-300">
                        {form.tone === 'friendly' && `Hi there! 👋 I'm your ${form.botType} assistant for ${form.companyName}. How can I help you today?`}
                        {form.tone === 'formal' && `Welcome to ${form.companyName}. I'm your dedicated ${form.botType} assistant. How may I be of service today?`}
                        {form.tone === 'casual' && `Hey! 😎 What's up? I'm your ${form.botType} buddy for ${form.companyName}. Need any help?`}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex justify-between mt-8">
                  <button
                    onClick={handleBack}
                    className="flex items-center gap-2 py-3 px-6 rounded-lg font-medium border border-gray-600 hover:border-gray-400 transition-all duration-300"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                    </svg>
                    Back
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={!form.email}
                    className={`group flex items-center gap-2 py-3 px-6 rounded-lg font-medium transition-all duration-300 ${
                      !form.email
                        ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white shadow-lg hover:shadow-xl'
                    }`}
                  >
                    <span>Create My Bot</span>
                    <svg className="w-5 h-5 transform group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7"></path>
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-12 text-center text-gray-500 text-sm">
            <p>Your AI assistant will be ready instantly after completion.</p>
          </div>
        </div>
      </div>
    </>
  );
}