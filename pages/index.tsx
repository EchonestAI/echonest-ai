// pages/index.tsx
import Link from "next/link";
import { useState, useEffect, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react';
import EchonestLogo from "../components/EchonestLogo";
import SubscribeButton from "../components/SubscribeButton";

// Create a simple Badge component since we don't have the shadcn Badge
interface BadgeProps {
  children: ReactNode;
  className?: string;
}

const Badge = ({ children, className = "" }: BadgeProps) => {
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${className}`}>
      {children}
    </span>
  );
};

// Define the type for bot responses to fix TypeScript error
interface BotResponses {
  [key: string]: string;
}

// Inline demo component to avoid import issues
const InlineDemoBot = ({ className = "" }: { className?: string }) => {
  const [messages, setMessages] = useState([
    { type: 'bot', content: "Hello! I'm the Echonest.ai demo assistant. Feel free to ask me anything about our platform, pricing, or setup process." }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Sample responses for demo purposes - with proper TypeScript typing
  const botResponses: BotResponses = {
    "pricing": "We offer three plans: Free (1 bot), Pro ($19/month for 3 bots), and Business ($49/month for unlimited bots). All plans include core features, with advanced features in higher tiers.",
    "create": "Creating a bot is easy! Just sign up, click 'Create New Bot', choose the type, enter your company details, and paste your FAQ content. Your bot will be ready instantly with no coding required.",
    "language": "Our bots are multilingual! They automatically detect and respond in the language of your FAQ content. We support over 100 languages including English, Spanish, French, German, Dutch, Chinese, Japanese, and many more.",
    "trial": "Our Free plan is essentially a perpetual trial! You can create one bot, test it out, and upgrade only when you need more bots or advanced features."
  };

  const handleSendMessage = () => {
    if (!input.trim()) return;
    
    // Add user message
    const userMessage = { type: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    
    // Simulate a delay for bot response
    setTimeout(() => {
      let botResponse = "I'm sorry, I don't have specific information about that. Feel free to ask about our pricing, how to create a bot, or language support!";
      
      // Check for keyword matches - fixed TypeScript issue with safer code
      const inputLower = input.toLowerCase();
      const matchingKey = Object.keys(botResponses).find(key => inputLower.includes(key));
      
      if (matchingKey) {
        botResponse = botResponses[matchingKey];
      }
      
      setMessages(prev => [...prev, { type: 'bot', content: botResponse }]);
      setLoading(false);
    }, 1000);
  };

  // Demo message examples
  const exampleQuestions = [
    "What are your pricing plans?",
    "How do I create my first bot?",
    "What languages can your bots speak?",
    "Do you offer a free trial?"
  ];
  
  return (
    <div className={`grid md:grid-cols-2 gap-10 items-center ${className}`}>
      <div className="space-y-6">
        <h3 className="text-2xl font-semibold text-white">Ask our demo bot anything!</h3>
        
        <div className="space-y-3">
          <p className="text-gray-300">Try these example questions:</p>
          <div className="space-y-2">
            {exampleQuestions.map((question, i) => (
              <button 
                key={i}
                onClick={() => {
                  setInput(question);
                  setTimeout(() => {
                    const userMessage = { type: 'user', content: question };
                    setMessages(prev => [...prev, userMessage]);
                    setInput('');
                    setLoading(true);
                    
                    setTimeout(() => {
                      let botResponse = "I'm sorry, I don't have specific information about that.";
                      
                      // Fixed TypeScript issue with safer code
                      const questionLower = question.toLowerCase();
                      const matchingKey = Object.keys(botResponses).find(key => 
                        questionLower.includes(key)
                      );
                      
                      if (matchingKey) {
                        botResponse = botResponses[matchingKey];
                      }
                      
                      setMessages(prev => [...prev, { type: 'bot', content: botResponse }]);
                      setLoading(false);
                    }, 1000);
                  }, 100);
                }}
                className="block w-full text-left px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors text-sm"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
        
        <div className="text-gray-400 text-sm">
          <p>This demo bot knows about Echonest.ai features and pricing. In your implementation, your bot will have knowledge of your specific business!</p>
        </div>
      </div>
      
      <div className="rounded-lg bg-gradient-to-r p-[1px] from-blue-400 to-purple-500 shadow-2xl">
        <div className="rounded-lg overflow-hidden bg-gray-900 h-[500px] flex flex-col">
          <div className="h-12 bg-gray-800 flex items-center px-4">
            <div className="flex space-x-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <div className="text-center text-xs text-gray-400 flex-1">Echonest.ai Demo Bot</div>
          </div>
          
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {messages.map((msg, idx) => (
              <div 
                key={idx} 
                className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[80%] rounded-lg py-2 px-4 ${
                    msg.type === 'user' 
                      ? 'bg-blue-600 rounded-tr-none' 
                      : 'bg-gray-800 rounded-tl-none'
                  }`}
                >
                  {msg.type === 'bot' && (
                    <div className="flex items-center mb-1">
                      <span className="text-xs mr-2">🤖</span>
                      <span className="text-xs text-blue-400">Echonest.ai Assistant</span>
                    </div>
                  )}
                  <p className="text-sm text-white whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="flex justify-start">
                <div className="max-w-[80%] bg-gray-800 rounded-lg rounded-tl-none py-2 px-4">
                  <div className="flex items-center mb-1">
                    <span className="text-xs mr-2">🤖</span>
                    <span className="text-xs text-blue-400">Echonest.ai Assistant</span>
                  </div>
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-600 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-gray-600 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-gray-600 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="p-3 border-t border-gray-700 bg-gray-800">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask something about Echonest.ai..."
                className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
              />
              <button
                onClick={handleSendMessage}
                disabled={!input.trim() || loading}
                className="rounded-full w-10 h-10 flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white transition-all disabled:opacity-50 disabled:bg-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function HomePage() {
  const [isVisible, setIsVisible] = useState(false);
  const user = useUser();
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    // Once useUser resolves, set loading to false
    setLoading(false);
  }, [user]);
  const supabase = useSupabaseClient();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-40 right-10 w-64 h-64 bg-blue-500 rounded-full filter blur-3xl opacity-10 animate-pulse"></div>
      <div className="absolute top-80 left-10 w-96 h-96 bg-purple-500 rounded-full filter blur-3xl opacity-10 animate-pulse" style={{ animationDelay: "1s" }}></div>
      
      {/* Navbar */}
      <nav className="relative z-10 backdrop-blur-md bg-black bg-opacity-30 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-1">
            <EchonestLogo />
          </div>
          <div className="hidden md:flex space-x-6 text-sm">
            <a href="#features" className="text-gray-300 hover:text-white transition">Features</a>
            <a href="#pricing" className="text-gray-300 hover:text-white transition">Pricing</a>
            <a href="#demo" className="text-gray-300 hover:text-white transition">Demo</a>
            <a href="#faq" className="text-gray-300 hover:text-white transition">FAQ</a>
          </div>
          <div className="flex items-center space-x-2">
            {!loading && user ? (
              <>
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm">Dashboard</Button>
                </Link>
                <Button
                  size="sm"
                  onClick={async () => {
                    await supabase.auth.signOut();
                    window.location.href = '/';
                  }}
                >
                  Log Out
                </Button>
              </>
            ) : (
              !loading && (
                <>
                  <Link href="/login">
                    <Button variant="ghost" size="sm">Login</Button>
                  </Link>
                  <Link href="/signup">
                    <Button size="sm">Sign Up</Button>
                  </Link>
                </>
              )
            )}
          </div>
        </div>
      </nav>

      {/* Hero section */}
      <section className="relative pt-20 pb-32 flex flex-col items-center">
        <div className="text-center max-w-4xl mx-auto px-6">
          <Badge className="mb-4 bg-blue-900/30 text-blue-400 hover:bg-blue-900/30">AI-Powered Customer Support</Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 leading-tight">
            Create Custom Chatbots In Minutes, Not Months
          </h1>
          <p className="text-xl text-gray-300 mb-10 max-w-3xl mx-auto">
            Build intelligent AI assistants for your business without coding. Connect your knowledge base and launch in minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all duration-200 border-0 shadow-lg hover:shadow-blue-900/30 hover:shadow-xl" size="lg">
                Start For Free
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                </svg>
              </Button>
            </Link>
            <Link href="#demo">
              <Button 
                variant="outline" 
                size="lg" 
                className="border-blue-500 bg-transparent hover:bg-blue-900/20 text-blue-400 hover:text-blue-300 transition-all duration-200"
                onClick={(e) => {
                  e.preventDefault();
                  const demoSection = document.getElementById('demo');
                  if (demoSection) {
                    demoSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }}
              >
                Try Demo
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features section */}
      <section id="features" className="py-20 bg-gradient-to-b from-black to-gray-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-blue-900/30 text-blue-400 hover:bg-blue-900/30">Features</Badge>
            <h2 className="text-3xl md:text-4xl font-bold">Everything You Need to Build Better Chatbots</h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path>
                  </svg>
                ),
                title: "No-Code Creation",
                description: "Set up your bot with a few clicks. No technical experience required. Just paste your FAQs and we handle the rest."
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
                  </svg>
                ),
                title: "Instant Knowledge Base",
                description: "Connect your existing documentation, FAQs, or support content. Your bot becomes an instant expert in your business."
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                  </svg>
                ),
                title: "Multilingual Support",
                description: "Automatically detect and respond in multiple languages. Global support without the global team."
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                  </svg>
                ),
                title: "Advanced AI Safety Testing",
                description: "Automatic guardrails to avoid prompt injection and hallucination issues. Keep your customers and brand safe."
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"></path>
                  </svg>
                ),
                title: "Real-time Analytics",
                description: "Monitor conversation success rates, common questions, and customer satisfaction in real time."
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                  </svg>
                ),
                title: "Seamless Integration",
                description: "Embed your chatbot anywhere with just a few lines of code. Works on websites, apps, and custom tools."
              }
            ].map((feature, i) => (
              <div key={i} className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 transition duration-300 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-900/10">
                <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full w-12 h-12 flex items-center justify-center mb-4 text-blue-400">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-2 text-white">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo section - Using the inline demo component */}
      <section id="demo" className="py-20 bg-gradient-to-b from-gray-900 to-black">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-blue-900/30 text-blue-400 hover:bg-blue-900/30">Live Demo</Badge>
            <h2 className="text-3xl md:text-4xl font-bold">See Echonest.ai in Action</h2>
            <p className="mt-4 text-gray-400 max-w-2xl mx-auto">
              Try out our demo bot to see how your own custom AI assistant could work. Ask it questions about Echonest.ai features, pricing, or setup process.
            </p>
          </div>
          
          {/* Integrated inline demo component */}
          <InlineDemoBot className="mt-12" />
          
          <div className="mt-16 text-center">
            <Link href="/signup">
              <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg">
                Create Your Own Bot
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                </svg>
              </Button>
            </Link>
          </div>
        </div>
      </section>
      
      {/* Pricing - Now updated to use the SubscribeButton component */}
      <section id="pricing" className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-blue-900/30 text-blue-400 hover:bg-blue-900/30">No Hidden Fees</Badge>
          <h2 className="text-3xl md:text-4xl font-bold">Simple, Transparent Pricing</h2>
          <p className="mt-4 text-gray-400 max-w-2xl mx-auto">Choose the plan that fits your needs. All plans include core features with no hidden costs.</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              name: "Starter",
              price: "Free",
              description: "Perfect for individuals and small projects",
              features: ["1 Chatbot", "Basic Testing", "Standard Templates", "Community Support"],
              cta: "Get Started",
              link: "/create",
              planId: null,
              popular: false
            },
            {
              name: "Pro",
              price: "$19",
              period: "/month",
              description: "Ideal for growing businesses",
              features: ["3 Chatbots", "Advanced AI Testing", "Analytics Dashboard", "Export Options", "Priority Support", "Custom Branding"],
              cta: "Upgrade to Pro",
              link: "/create",
              planId: "pro",
              popular: true
            },
            {
              name: "Business",
              price: "$49",
              period: "/month",
              description: "For teams and larger organizations",
              features: ["Unlimited Bots", "Custom Branding", "Team Access", "Advanced Analytics", "API Access", "24/7 Support", "Custom Integrations"],
              cta: "Contact Sales",
              link: "#",
              planId: "business",
              popular: false
            }
          ].map((plan, i) => (
            <div key={i} className={`relative ${plan.popular ? 'transform md:-translate-y-4' : ''}`}>
              {plan.popular && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-bold px-4 py-1 rounded-full z-10">
                  MOST POPULAR
                </div>
              )}
              <Card className={`bg-gray-800/80 backdrop-blur-sm border-gray-700 overflow-hidden h-full ${plan.popular ? 'border-blue-500 shadow-lg shadow-blue-900/20' : ''}`}>
                <div className={`absolute top-0 left-0 right-0 h-1 ${plan.popular ? 'bg-gradient-to-r from-blue-500 to-purple-500' : 'bg-gray-700'}`}></div>
                <CardHeader>
                  <CardTitle className="text-2xl text-white">{plan.name}</CardTitle>
                  <div className="flex items-baseline mt-2">
                    <span className="text-3xl font-bold text-blue-400">{plan.price}</span>
                    {plan.period && <span className="text-gray-400 ml-1">{plan.period}</span>}
                  </div>
                  <p className="text-sm text-gray-400 mt-2">{plan.description}</p>
                </CardHeader>
                <CardContent>
                  <ul className="mb-6 mt-2 space-y-3 text-sm text-gray-300">
                    {plan.features.map((f, j) => (
                      <li key={j} className="flex items-center">
                        <svg className="w-5 h-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        {f}
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  {plan.planId ? (
                    <SubscribeButton 
                      planId={plan.planId as 'pro' | 'business'} 
                      className="w-full"
                    >
                      {plan.cta}
                    </SubscribeButton>
                  ) : (
                    <Link href={plan.link} className="w-full">
                      <Button className="w-full">
                        {plan.cta}
                      </Button>
                    </Link>
                  )}
                </CardFooter>
              </Card>
            </div>
          ))}
        </div>
        
        <div className="mt-12 text-center bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
          <h3 className="text-xl font-semibold mb-2">Need a custom solution?</h3>
          <p className="text-gray-400 mb-4">Contact our sales team for enterprise pricing and custom features.</p>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="border-blue-600 bg-gray-800/60 hover:bg-gray-700 text-blue-400 hover:text-blue-300 transition-all duration-200">
                Contact Sales
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-900 border-gray-700">
              <DialogHeader>
                <DialogTitle className="text-white">Get in Touch</DialogTitle>
              </DialogHeader>
              <form className="space-y-4 mt-4">
                <input
                  type="text"
                  placeholder="Your Name"
                  className="w-full bg-gray-800 border border-gray-600 rounded px-4 py-2 text-white"
                />
                <input
                  type="email"
                  placeholder="Email Address"
                  className="w-full bg-gray-800 border border-gray-600 rounded px-4 py-2 text-white"
                />
                <textarea
                  placeholder="How can we help?"
                  className="w-full bg-gray-800 border border-gray-600 rounded px-4 py-2 text-white"
                  rows={4}
                />
                <Button className="w-full">Send Message</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-6 py-24 text-center">
        <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 backdrop-blur-sm rounded-2xl p-12 border border-gray-700">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to build your AI assistant?</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Start creating your first bot today — no credit card required.
          </p>
          <Link href="/create">
            <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all duration-200 border-0 shadow-lg hover:shadow-blue-900/30 hover:shadow-xl" size="lg">
              Get Started for Free
              <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
              </svg>
            </Button>
          </Link>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="max-w-3xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-blue-900/30 text-blue-400 hover:bg-blue-900/30">Questions & Answers</Badge>
          <h2 className="text-3xl md:text-4xl font-bold">Frequently Asked Questions</h2>
        </div>

        <Accordion type="multiple" className="space-y-4">
          {[
            {
              q: "How do I create my first chatbot?",
              a: "Click 'Create Your Bot', choose your type, company details, and paste your FAQ. Echonest.ai will generate everything else."
            },
            {
              q: "Do I need technical knowledge?",
              a: "Nope! Echonest.ai is built for business users — no coding or AI experience needed."
            },
            {
              q: "Can I customize my bot's appearance?",
              a: "Yes! You can change icons, greetings, colors, and even embed it seamlessly on your site."
            },
            {
              q: "How does AI safety testing work?",
              a: "We simulate common prompt injections, edge cases, and tone violations, then show you the results before launch."
            },
            {
              q: "What languages does the chatbot support?",
              a: "Our bots are multilingual and automatically detect and respond in the language of your FAQ content. We support over 100 languages including English, Spanish, French, German, Dutch, Chinese, Japanese, and many more."
            },
            {
              q: "How accurate is the chatbot?",
              a: "Our chatbots are built on advanced AI models and are trained on your specific content for high accuracy. We also include testing tools to verify your bot stays on-message."
            }
          ].map(({ q, a }, i) => (
            <AccordionItem key={i} value={`item-${i}`}>
              <AccordionTrigger className="text-lg font-medium text-white">{q}</AccordionTrigger>
              <AccordionContent className="text-gray-400">{a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="mt-12 text-center">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="border-blue-600 bg-gray-800/60 hover:bg-gray-700 text-blue-400 hover:text-blue-300 transition-all duration-200">
                Contact Support
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-900 border-gray-700">
              <DialogHeader>
                <DialogTitle className="text-white">Get in Touch</DialogTitle>
              </DialogHeader>
              <form className="space-y-4 mt-4">
                <input
                  type="text"
                  placeholder="Your Name"
                  className="w-full bg-gray-800 border border-gray-600 rounded px-4 py-2 text-white"
                />
                <input
                  type="email"
                  placeholder="Email Address"
                  className="w-full bg-gray-800 border border-gray-600 rounded px-4 py-2 text-white"
                />
                <textarea
                  placeholder="How can we help?"
                  className="w-full bg-gray-800 border border-gray-600 rounded px-4 py-2 text-white"
                  rows={4}
                />
                <Button className="w-full">Send Message</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 bg-gradient-to-r from-gray-900 to-black">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div>
              <h3 className="text-lg font-semibold mb-4 text-white">Echonest.ai</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-gray-400 hover:text-blue-400 transition">About Us</a></li>
                <li><a href="#" className="text-gray-400 hover:text-blue-400 transition">Blog</a></li>
                <li><a href="#" className="text-gray-400 hover:text-blue-400 transition">Careers</a></li>
                <li><a href="#" className="text-gray-400 hover:text-blue-400 transition">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4 text-white">Product</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-gray-400 hover:text-blue-400 transition">Features</a></li>
                <li><a href="#" className="text-gray-400 hover:text-blue-400 transition">Pricing</a></li>
                <li><a href="#" className="text-gray-400 hover:text-blue-400 transition">Integrations</a></li>
                <li><a href="#" className="text-gray-400 hover:text-blue-400 transition">Changelog</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4 text-white">Resources</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-gray-400 hover:text-blue-400 transition">Documentation</a></li>
                <li><a href="#" className="text-gray-400 hover:text-blue-400 transition">Tutorials</a></li>
                <li><a href="#" className="text-gray-400 hover:text-blue-400 transition">API Reference</a></li>
                <li><a href="#" className="text-gray-400 hover:text-blue-400 transition">Community</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4 text-white">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-gray-400 hover:text-blue-400 transition">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-blue-400 transition">Terms of Service</a></li>
                <li><a href="#" className="text-gray-400 hover:text-blue-400 transition">Security</a></li>
                <li><a href="#" className="text-gray-400 hover:text-blue-400 transition">Compliance</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-6">
              <a href="#" className="text-gray-400 hover:text-blue-400 transition">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
            </div>
            
            <div className="text-sm text-gray-500">
              <p>© {new Date().getFullYear()} Echonest.ai — Built with love and LLMs.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}