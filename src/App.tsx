/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  Copy, 
  ExternalLink, 
  User, 
  AtSign, 
  MapPin, 
  Briefcase, 
  Terminal,
  Shield,
  FileCode,
  Share2,
  Check,
  Filter,
  Info,
  Trash2,
  History,
  Zap,
  Globe,
  Database,
  Lock,
  ChevronRight,
  Sparkles,
  Loader2,
  AlertCircle,
  Bug,
  MessageSquare,
  Download,
  Moon,
  Sun,
  Plus,
  Save
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { generateAdvancedDorks, AIDork } from './services/geminiService';

interface Dork {
  label: string;
  description: string;
  getQuery: (params: FormParams) => string;
  tags: string[];
}

interface DorkSection {
  title: string;
  category: string;
  icon: React.ReactNode;
  dorks: Dork[];
  isAI?: boolean;
}

interface FormParams {
  firstName: string;
  lastName: string;
  username: string;
  location: string;
  business: string;
  role: string;
}

const DORK_CONFIG: DorkSection[] = [
  {
    title: "Primary Recon",
    category: "General",
    icon: <Globe className="w-4 h-4" />,
    dorks: [
      { label: "Basic Pivot", description: "Name/State pivot", getQuery: (p) => `"${p.firstName} ${p.lastName}" AND "state"`, tags: ["recon", "general"] },
      { label: "Location Pivot", description: "City-specific targeting", getQuery: (p) => `"${p.firstName} ${p.lastName}" AND "location" - cities`, tags: ["recon", "location"] },
      { label: "Corporate Link", description: "Business/Employer association", getQuery: (p) => `"${p.firstName} ${p.lastName}" AND "${p.business || "business/employer"}"`, tags: ["recon", "business"] },
      { label: "Title/Role Link", description: "Search by professional title", getQuery: (p) => `"${p.firstName} ${p.lastName}" AND "${p.role || "position/role"}"`, tags: ["recon", "pro"] },
      { label: "Identity Sync", description: "Link name to handle", getQuery: (p) => `"${p.firstName} ${p.lastName}" AND "${p.username || "username"}"`, tags: ["recon", "alias"] },
      { label: "Global Footprint", description: "High-density combination", getQuery: (p) => `("${p.firstName} ${p.lastName}" AND "state" OR "${p.firstName} ${p.lastName}" AND "location" OR "${p.firstName} ${p.lastName}" AND "${p.username || "username"}")`, tags: ["recon", "mega"] },
    ]
  },
  {
    title: "Alias Investigation",
    category: "Alias",
    icon: <AtSign className="w-4 h-4" />,
    dorks: [
      { label: "Alias Pivot", description: "Direct handle search", getQuery: (p) => `"${p.username || "username"}"`, tags: ["alias"] },
      { label: "Text Extraction", description: "Handle mentioned in text", getQuery: (p) => `intext:"${p.username || "username"}"`, tags: ["alias", "intext"] },
      { label: "URL Discovery", description: "Handle in path/address", getQuery: (p) => `inurl:${p.username || "username"}`, tags: ["alias", "inurl"] },
      { label: "Alias + GEO", description: "Handle tied to location", getQuery: (p) => `"${p.username || "username"}" AND "${p.location || "location"}"`, tags: ["alias", "location"] },
      { label: "Identity Umbrella", description: "Comprehensive handle scan", getQuery: (p) => `("${p.username || "username"}" OR intext:"${p.username || "username"}" OR inurl:${p.username || "username"} OR "${p.username || "username"}" AND "${p.location || "location"}")`, tags: ["alias", "mega"] }
    ]
  },
  {
    title: "Document Leaks",
    category: "Data",
    icon: <FileCode className="w-4 h-4" />,
    dorks: [
      { label: "PDF Intelligence", description: "Target PDF docs", getQuery: (p) => `filetype:pdf "${p.firstName} ${p.lastName}"`, tags: ["file", "pdf"] },
      { label: "GEO-tagged PDFs", description: "PDFs with city/state", getQuery: (p) => `filetype:pdf "${p.firstName} ${p.lastName}" AND "${p.location || "location"}"`, tags: ["file", "pdf", "location"] },
      { label: "Office Docs", description: "Target MS Word files", getQuery: (p) => `filetype:docx "${p.firstName} ${p.lastName}"`, tags: ["file", "docx"] },
      { label: "CSV/Datasets", description: "Target spreadsheets", getQuery: (p) => `filetype:csv "${p.firstName} ${p.lastName}"`, tags: ["file", "csv"] },
      { label: "Data Siphon", description: "Multi-format file grab", getQuery: (p) => `(filetype:pdf OR filetype:docx OR filetype:csv) "${p.firstName} ${p.lastName}" AND "${p.location || "location"}"`, tags: ["file", "mega"] }
    ]
  },
  {
    title: "Meta Platforms",
    category: "Social",
    icon: <Share2 className="w-4 h-4" />,
    dorks: [
      { label: "Facebook Recon", description: "FB specific targeting", getQuery: (p) => `site:facebook.com "${p.firstName} ${p.lastName}"`, tags: ["social", "facebook"] },
      { label: "Instagram Recon", description: "IG specific targeting", getQuery: (p) => `site:instagram.com "${p.firstName} ${p.lastName}"`, tags: ["social", "instagram"] },
      { label: "Thread/X Recon", description: "X/Twitter profile hub", getQuery: (p) => `site:x.com "${p.firstName} ${p.lastName}"`, tags: ["social", "x"] },
      { label: "Meta Mega", description: "FB/IG unified search", getQuery: (p) => `(site:facebook.com OR site:instagram.com) "${p.firstName} ${p.lastName}"`, tags: ["social", "mega"] }
    ]
  },
  {
    title: "Video & Content",
    category: "Media",
    icon: <Zap className="w-4 h-4" />,
    dorks: [
      { label: "YouTube Hub", description: "Channel & comment search", getQuery: (p) => `site:youtube.com "${p.firstName} ${p.lastName}"`, tags: ["media", "youtube"] },
      { label: "TikTok Hub", description: "TikTok user profiles", getQuery: (p) => `site:tiktok.com "${p.firstName} ${p.lastName}"`, tags: ["media", "tiktok"] },
      { label: "Snap Map Hub", description: "Public Snap profiles", getQuery: (p) => `site:snapchat.com "${p.firstName} ${p.lastName}"`, tags: ["media", "snap"] },
      { label: "Board Scraper", description: "Pinterest pins/boards", getQuery: (p) => `site:pinterest.com "${p.firstName} ${p.lastName}"`, tags: ["media", "pinterest"] }
    ]
  },
  {
    title: "Financial Sifting",
    category: "Fin",
    icon: <Database className="w-4 h-4" />,
    dorks: [
      { label: "Venmo Ledger", description: "Transaction/Friend traces", getQuery: (p) => `site:venmo.com "${p.firstName} ${p.lastName}"`, tags: ["fin", "venmo"] },
      { label: "CashApp Tag", description: "Cashtag verification", getQuery: (p) => `site:cash.app "${p.firstName} ${p.lastName}"`, tags: ["fin", "cashapp"] },
      { label: "Fundraiser Scan", description: "GoFundMe campaigns", getQuery: (p) => `site:gofundme.com "${p.firstName} ${p.lastName}"`, tags: ["fin", "gofundme"] }
    ]
  },
  {
    title: "Professional Tier",
    category: "Work",
    icon: <Lock className="w-4 h-4" />,
    dorks: [
      { label: "LinkedIn Ops", description: "Professional history", getQuery: (p) => `site:linkedin.com "${p.firstName} ${p.lastName}"`, tags: ["work", "linkedin"] },
      { label: "Indeed Resumes", description: "Resume/CV discovery", getQuery: (p) => `site:indeed.com "${p.firstName} ${p.lastName}"`, tags: ["work", "indeed"] },
      { label: "Marketplace Ops", description: "Poshmark/Selling trace", getQuery: (p) => `site:poshmark.com "${p.firstName} ${p.lastName}"`, tags: ["work", "poshmark"] }
    ]
  },
  {
    title: "Geo-Activity",
    category: "GEO",
    icon: <MapPin className="w-4 h-4" />,
    dorks: [
      { label: "Strava Trails", description: "Running/Cycling paths", getQuery: (p) => `site:strava.com "${p.firstName} ${p.lastName}"`, tags: ["geo", "strava"] },
      { label: "AllTrails Logs", description: "Hiking/Nature logs", getQuery: (p) => `site:alltrails.com "${p.firstName} ${p.lastName}"`, tags: ["geo", "alltrails"] }
    ]
  },
  {
    title: "Security & Tech",
    category: "Security",
    icon: <Bug className="w-4 h-4" />,
    dorks: [
      { label: "Config Leaks", description: "Exposed .env/config files", getQuery: (p) => `(filetype:env OR filetype:yaml OR filetype:yml) "${p.business || p.username || "target"}"`, tags: ["security", "config"] },
      { label: "Log Files", description: "Exposed application logs", getQuery: (p) => `filetype:log "${p.business || "target"}" AND "error"`, tags: ["security", "logs"] },
      { label: "Git Repo Search", description: "GitHub/GitLab traces", getQuery: (p) => `(site:github.com OR site:gitlab.com) "${p.username || p.firstName + " " + p.lastName}"`, tags: ["security", "git"] },
      { label: "Admin Panels", description: "Exposed login portals", getQuery: (p) => `intitle:login "admin" "${p.business || "target"}"`, tags: ["security", "admin"] }
    ]
  },
  {
    title: "Community Threads",
    category: "Community",
    icon: <MessageSquare className="w-4 h-4" />,
    dorks: [
      { label: "Reddit Mentions", description: "Reddit discussions", getQuery: (p) => `site:reddit.com "${p.username || p.firstName + " " + p.lastName}"`, tags: ["community", "reddit"] },
      { label: "Quora Profiles", description: "Quora activity", getQuery: (p) => `site:quora.com "${p.firstName} ${p.lastName}"`, tags: ["community", "quora"] },
      { label: "StackOverflow", description: "Dev activity/questions", getQuery: (p) => `site:stackoverflow.com "${p.username || p.firstName + " " + p.lastName}"`, tags: ["community", "dev"] },
      { label: "Discord Invites", description: "Discord community links", getQuery: (p) => `site:discord.gg "${p.business || p.username || "target"}"`, tags: ["community", "discord"] }
    ]
  }
];

interface Dossier {
  id: string;
  name: string;
  params: FormParams;
  timestamp: number;
}

export default function App() {
  const [params, setParams] = useState<FormParams>(() => {
    const saved = localStorage.getItem('dorksleuth_target');
    return saved ? JSON.parse(saved) : {
      firstName: '',
      lastName: '',
      username: '',
      location: '',
      business: '',
      role: ''
    };
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('dorksleuth_theme');
    return saved === 'dark';
  });

  const [dossiers, setDossiers] = useState<Dossier[]>(() => {
    const saved = localStorage.getItem('dorksleuth_dossiers');
    return saved ? JSON.parse(saved) : [];
  });

  // AI States
  const [aiSuggestedDorks, setAiSuggestedDorks] = useState<AIDork[]>(() => {
    const saved = localStorage.getItem('dorksleuth_ai_dorks');
    return saved ? JSON.parse(saved) : [];
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Persistence
  useEffect(() => {
    localStorage.setItem('dorksleuth_target', JSON.stringify(params));
  }, [params]);

  useEffect(() => {
    localStorage.setItem('dorksleuth_ai_dorks', JSON.stringify(aiSuggestedDorks));
  }, [aiSuggestedDorks]);

  useEffect(() => {
    localStorage.setItem('dorksleuth_theme', isDarkMode ? 'dark' : 'light');
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem('dorksleuth_dossiers', JSON.stringify(dossiers));
  }, [dossiers]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const openGoogle = (query: string) => {
    const url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    window.open(url, '_blank');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setParams(prev => ({ ...prev, [name]: value }));
  };

  const clearTarget = () => {
    if (window.confirm("Clear all target data?")) {
      setParams({
        firstName: '',
        lastName: '',
        username: '',
        location: '',
        business: '',
        role: ''
      });
      setAiSuggestedDorks([]);
      setAiError(null);
    }
  };

  const saveDossier = () => {
    const name = params.firstName 
      ? `${params.firstName} ${params.lastName}` 
      : params.business || params.username || "Unnamed Target";
    
    const newDossier: Dossier = {
      id: crypto.randomUUID(),
      name,
      params: { ...params },
      timestamp: Date.now()
    };
    
    setDossiers(prev => [newDossier, ...prev]);
    setShowHistory(true);
  };

  const deleteDossier = (id: string) => {
    setDossiers(prev => prev.filter(d => d.id !== id));
  };

  const loadDossier = (dossier: Dossier) => {
    setParams(dossier.params);
    setAiSuggestedDorks([]); // Clear AI dorks for new dossier
    setShowHistory(false);
  };

  const exportData = () => {
    const data = {
      target: params,
      aiDorks: aiSuggestedDorks,
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dorksleuth_export_${params.username || params.lastName || 'osint'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleGenerateAI = async () => {
    if (!params.firstName && !params.lastName && !params.username && !params.business) {
      setAiError("Provide research data first.");
      return;
    }

    setAiError(null);
    setIsGenerating(true);
    try {
      const results = await generateAdvancedDorks(params);
      setAiSuggestedDorks(results);
    } catch (err: any) {
      setAiError(err.message || "AI engine timeout. Try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const filteredDorks = useMemo(() => {
    const term = searchQuery.toLowerCase();
    
    const sections: DorkSection[] = [...DORK_CONFIG];
    
    if (aiSuggestedDorks.length > 0) {
      sections.unshift({
        title: "AI Suggested Patterns",
        category: "AI",
        icon: <Sparkles className="w-4 h-4 text-emerald-500" />,
        isAI: true,
        dorks: aiSuggestedDorks.map(d => ({
          label: d.label,
          description: d.description,
          getQuery: () => d.query,
          tags: [...d.tags, "ai-gen"]
        }))
      });
    }

    if (!term) return sections;
    
    return sections.map(section => ({
      ...section,
      dorks: section.dorks.filter(d => 
        d.label.toLowerCase().includes(term) ||
        d.description.toLowerCase().includes(term) ||
        d.tags.some(t => t.includes(term))
      )
    })).filter(section => section.dorks.length > 0);
  }, [searchQuery, aiSuggestedDorks]);

  const isTargetPopulated = params.firstName || params.lastName || params.username;

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 ${isDarkMode ? 'bg-[#070708] text-slate-300' : 'bg-slate-50 text-slate-700'} selection:bg-indigo-100 selection:text-indigo-900`}>
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full blur-[160px] ${isDarkMode ? 'bg-indigo-600/10' : 'bg-indigo-500/5'}`} />
        <div className={`absolute bottom-[-5%] left-[-5%] w-[40%] h-[40%] rounded-full blur-[140px] ${isDarkMode ? 'bg-emerald-600/10' : 'bg-emerald-500/5'}`} />
        <div className={`absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] contrast-150 ${isDarkMode ? 'opacity-[0.1]' : 'opacity-[0.03]'}`} />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-10 md:py-16 flex flex-col gap-10">
        {/* Navbar */}
        <nav className={`flex items-center justify-between border-b pb-8 ${isDarkMode ? 'border-white/5' : 'border-slate-200'}`}>
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border shadow-sm ${isDarkMode ? 'bg-indigo-500/10 border-indigo-500/20' : 'bg-white border-slate-200'}`}>
              <Shield className={`w-6 h-6 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
            </div>
            <div>
              <h1 className={`text-2xl font-bold tracking-tight flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                DORK<span className="text-indigo-600 font-mono italic">SLEUTH</span>
              </h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">Advanced OSINT Workbench v1.3</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2.5 rounded-xl transition-colors border border-transparent ${isDarkMode ? 'hover:bg-white/5 text-slate-400 hover:border-white/5' : 'hover:bg-slate-200/50 text-slate-500 hover:border-slate-200'}`}
              title="Toggle Theme"
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button 
              onClick={exportData}
              className={`p-2.5 rounded-xl transition-colors border border-transparent ${isDarkMode ? 'hover:bg-white/5 text-slate-400 hover:border-white/5' : 'hover:bg-slate-200/50 text-slate-500 hover:border-slate-200'}`}
              title="Export Intelligence Data"
            >
              <Download className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setShowHistory(!showHistory)}
              className={`p-2.5 rounded-xl transition-colors border border-transparent ${isDarkMode ? 'hover:bg-white/5 text-slate-400 hover:border-white/5' : 'hover:bg-slate-200/50 text-slate-500 hover:border-slate-200'}`}
              title="Target Dossiers"
            >
              <History className="w-5 h-5" />
            </button>
            <button 
              onClick={clearTarget}
              className={`p-2.5 rounded-xl transition-colors border border-transparent ${isDarkMode ? 'hover:bg-red-500/10 text-slate-400 hover:text-red-400 hover:border-red-500/10' : 'hover:bg-red-50 text-slate-500 hover:text-red-600 hover:border-red-100'}`}
              title="Reset Workbench"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </nav>

        {/* Target Profile Bar */}
        <section className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <div className={`p-6 border rounded-3xl space-y-6 shadow-sm ${isDarkMode ? 'bg-slate-900/50 border-white/5' : 'bg-white border-slate-200'}`}>
              <div className="flex items-center justify-between">
                <h2 className={`text-xs font-bold uppercase tracking-widest flex items-center gap-2 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>
                  <User className="w-3" /> Target Metrics
                </h2>
                {isTargetPopulated && <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />}
              </div>
              
              <div className="space-y-4">
                {[
                  { name: 'firstName', icon: <User />, label: 'First Name', placeholder: 'John' },
                  { name: 'lastName', icon: <User />, label: 'Last Name', placeholder: 'Doe' },
                  { name: 'username', icon: <AtSign />, label: 'Alias', placeholder: 'jdoe' },
                  { name: 'location', icon: <MapPin />, label: 'Location', placeholder: 'CA' },
                  { name: 'business', icon: <Briefcase />, label: 'Business', placeholder: 'Acme' },
                  { name: 'role', icon: <Shield />, label: 'Role', placeholder: 'Dev' },
                ].map((input) => (
                  <div key={input.name} className="group relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                      {React.cloneElement(input.icon as React.ReactElement, { size: 14 })}
                    </div>
                    <input
                      type="text"
                      name={input.name}
                      autoComplete="off"
                      placeholder={input.placeholder}
                      value={(params as any)[input.name]}
                      onChange={handleInputChange}
                      className={`w-full border rounded-xl pl-10 pr-4 py-2.5 text-sm transition-all focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/50 ${
                        isDarkMode 
                          ? 'bg-black/40 border-white/5 text-white placeholder:text-slate-700' 
                          : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-300'
                      }`}
                    />
                  </div>
                ))}
              </div>

              <div className="pt-2 flex flex-col gap-3">
                <button
                  onClick={saveDossier}
                  disabled={!isTargetPopulated}
                  className={`w-full font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 text-sm active:scale-[0.98] ${
                    isDarkMode 
                      ? 'bg-white/5 hover:bg-white/10 text-white border border-white/10' 
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm'
                  } disabled:opacity-30 disabled:cursor-not-allowed`}
                >
                  <Save className="w-4 h-4" /> Save Dossier
                </button>
                <button
                  disabled={isGenerating}
                  onClick={handleGenerateAI}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 text-sm shadow-md shadow-indigo-500/20 active:scale-[0.98]"
                >
                  {isGenerating ? (
                    <Loader2 className="w-4 h-4 animate-spin text-white/50" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                  {isGenerating ? 'Synthesizing...' : 'Generate AI Intel'}
                </button>
                
                {aiError && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 rounded-xl text-[10px] font-bold text-red-600 border border-red-100 italic">
                    <AlertCircle className="w-3" /> {aiError}
                  </div>
                )}
              </div>
            </div>

            <div className="p-5 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-start gap-3">
              <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-1" />
              <p className="text-[11px] text-indigo-700/70 leading-relaxed font-medium">
                Target data is persisted locally in your browser. Use carefully for ethical research.
              </p>
            </div>
          </div>

          <div className="lg:col-span-3 flex flex-col gap-8">
            {/* Search & Filter */}
            <div className="flex flex-col md:flex-row items-center gap-4">
              <div className="relative flex-1 group">
                <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${isDarkMode ? 'text-slate-500 group-focus-within:text-indigo-400' : 'text-slate-400 group-focus-within:text-indigo-600'}`} />
                <input 
                  type="text"
                  placeholder="Filter dorks by platform, operator, or category..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full border rounded-2xl pl-12 pr-4 py-4 text-sm focus:outline-none focus:ring-1 transition-all font-medium shadow-sm ${
                    isDarkMode 
                      ? 'bg-slate-900/50 border-white/5 text-white focus:ring-indigo-500/50' 
                      : 'bg-white border-slate-200 text-slate-900 focus:ring-indigo-500/20'
                  }`}
                />
              </div>
              <div className={`flex items-center gap-2 px-4 py-3 border rounded-xl text-[10px] font-bold uppercase tracking-widest whitespace-nowrap shadow-sm ${
                isDarkMode 
                  ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' 
                  : 'bg-white border-slate-200 text-slate-500'
              }`}>
                <Filter className={`w-3 h-3 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`} /> {filteredDorks.reduce((acc, s) => acc + s.dorks.length, 0)} Active Patterns
              </div>
            </div>

            {/* Dorks Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <AnimatePresence mode="popLayout">
                {filteredDorks.map((section, sIndex) => (
                  <motion.div
                    layout
                    key={section.title}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex flex-col gap-4"
                  >
                    <div className="flex items-center gap-3 px-2">
                       <div className={`p-1.5 rounded-lg border shadow-sm ${
                         section.isAI 
                           ? (isDarkMode ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-emerald-50 border-emerald-100')
                           : (isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200')
                       }`}>
                         {React.cloneElement(section.icon as React.ReactElement, { 
                           className: `w-4 h-4 ${section.isAI ? 'text-emerald-500' : (isDarkMode ? 'text-indigo-400' : 'text-indigo-600')}` 
                         })}
                       </div>
                       <h3 className={`text-[11px] font-black uppercase tracking-[0.25em] ${section.isAI ? 'text-emerald-500' : (isDarkMode ? 'text-white/40' : 'text-slate-400')}`}>
                         {section.title}
                       </h3>
                    </div>

                    <div className="flex flex-col gap-3">
                      {section.dorks.map((dork, dIndex) => {
                        const query = typeof dork.getQuery === 'function' ? dork.getQuery(params) : '';
                        const uniqueId = `${section.title}-${dIndex}`;
                        const isCopied = copiedId === uniqueId;

                        return (
                          <div 
                            key={uniqueId}
                            className={`group/item relative p-4 border rounded-2xl transition-all shadow-sm ${
                              section.isAI 
                                ? (isDarkMode ? 'bg-emerald-500/5 border-emerald-500/20 hover:bg-emerald-500/10' : 'bg-emerald-50/30 border-emerald-100 hover:border-emerald-200 hover:bg-emerald-50/50') 
                                : (isDarkMode ? 'bg-slate-900/40 border-white/5 hover:border-indigo-500/20 hover:bg-indigo-500/5' : 'bg-white border-slate-200 hover:border-indigo-200 hover:bg-slate-50')
                            }`}
                          >
                            <div className="flex items-start justify-between gap-4 mb-3">
                              <div className="space-y-1">
                                <h4 className={`text-sm font-bold transition-colors ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>{dork.label}</h4>
                                <p className={`text-[10px] font-medium uppercase tracking-wider ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>{dork.description}</p>
                              </div>
                              <div className="flex items-center gap-1.5 opacity-40 group-hover/item:opacity-100 transition-opacity">
                                <button
                                  onClick={() => handleCopy(query, uniqueId)}
                                  className={`p-2 rounded-lg transition-all ${
                                    isCopied 
                                      ? (isDarkMode ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-50 text-emerald-600') 
                                      : (isDarkMode ? 'hover:bg-white/10 text-slate-500' : 'hover:bg-slate-100 text-slate-400')
                                  }`}
                                >
                                  {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                </button>
                                <button
                                  onClick={() => openGoogle(query)}
                                  className={`p-2 rounded-lg transition-all ${isDarkMode ? 'hover:bg-white/10 text-slate-500 hover:text-white' : 'hover:bg-slate-100 text-slate-400 hover:text-slate-900'}`}
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            <div className="relative group/code">
                              <div className={`absolute inset-0 rounded-xl transition-colors ${isDarkMode ? 'bg-black/40 group-hover/item:bg-black/60' : 'bg-slate-50 group-hover/item:bg-slate-100'}`} />
                              <div className={`relative p-3.5 font-mono text-[11px] break-all leading-relaxed line-clamp-2 group-hover/code:line-clamp-none transition-all cursor-text ${
                                isDarkMode ? 'text-indigo-300/80' : 'text-indigo-900/80'
                              }`}>
                                {query}
                              </div>
                            </div>
                            
                            <div className="mt-3 flex flex-wrap gap-1.5">
                              {dork.tags.map(tag => (
                                <span key={tag} className={`text-[9px] px-1.5 py-0.5 rounded-md border uppercase font-bold tracking-wider ${
                                  isDarkMode ? 'bg-white/5 text-white/20 border-white/5' : 'bg-slate-100 text-slate-400 border border-slate-200'
                                }`}>
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            
            {filteredDorks.length === 0 && (
               <div className={`flex flex-col items-center justify-center py-20 text-center gap-4 border border-dashed rounded-3xl ${
                 isDarkMode ? 'bg-slate-900/20 border-white/5' : 'bg-white border-slate-200'
               }`}>
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-white/5 text-slate-600' : 'bg-slate-50 text-slate-300'}`}>
                    <Terminal className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <h3 className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>No patterns found</h3>
                    <p className="text-xs text-slate-500">Try searching for generic terms like "mega", "fin", or "social".</p>
                  </div>
                  <button 
                    onClick={() => setSearchQuery('')}
                    className={`text-xs font-bold uppercase tracking-widest transition-colors ${isDarkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-400'}`}
                  >
                    Reset Filter
                  </button>
               </div>
            )}
          </div>
        </section>

        {/* Footer */}
        <footer className={`mt-10 pt-10 border-t flex flex-col md:flex-row items-center justify-between gap-6 ${isDarkMode ? 'border-white/5' : 'border-slate-200'}`}>
          <div className="flex items-center gap-8 text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">
            <span className="flex items-center gap-2 text-indigo-400"><Zap className="w-3 h-3" /> Low Latency Ops</span>
            <span className="flex items-center gap-2 text-emerald-400"><Check className="w-3 h-3" /> Browser Sandbox</span>
          </div>
          <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-widest text-slate-400">
            <a href="#" className={`transition-colors ${isDarkMode ? 'hover:text-white' : 'hover:text-indigo-600'}`}>Privacy</a>
            <a href="#" className={`transition-colors ${isDarkMode ? 'hover:text-white' : 'hover:text-indigo-600'}`}>OSINT Best Practices</a>
            <span className={isDarkMode ? 'text-slate-800' : 'text-slate-200'}>|</span>
            <span className="text-slate-500 italic">DorkSleuth Engineering v1.3</span>
          </div>
        </footer>
      </div>

      {/* History Slide-over */}
      <AnimatePresence>
        {showHistory && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setShowHistory(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40"
            />
            <motion.div 
              initial={{ x: '100%' }} 
              animate={{ x: 0 }} 
              exit={{ x: '100%' }}
              className={`fixed top-0 right-0 bottom-0 w-full max-w-sm border-l z-50 p-8 shadow-2xl flex flex-col gap-8 ${
                isDarkMode ? 'bg-[#0A0A0B] border-white/5' : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <h3 className={`text-lg font-bold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  <History className={`w-5 h-5 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`} /> Target Dossiers
                </h3>
                <button onClick={() => setShowHistory(false)} className="text-slate-400 hover:text-slate-900 transition-colors">
                  <ChevronRight />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                {dossiers.length > 0 ? dossiers.map(d => (
                  <div key={d.id} className={`group p-4 border rounded-2xl transition-all ${
                    isDarkMode ? 'bg-white/5 border-white/5 hover:border-indigo-500/30' : 'bg-slate-50 border-slate-200 hover:border-indigo-200'
                  }`}>
                    <div className="flex items-center justify-between gap-4 mb-2">
                      <span className={`text-sm font-bold truncate ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{d.name}</span>
                      <button 
                        onClick={() => deleteDossier(d.id)}
                        className="text-slate-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono mb-4 uppercase tracking-tighter">
                      {new Date(d.timestamp).toLocaleString()}
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => loadDossier(d)}
                        className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${
                          isDarkMode ? 'bg-indigo-500 text-white hover:bg-indigo-400' : 'bg-indigo-600 text-white hover:bg-indigo-700'
                        }`}
                      >
                        Restore Session
                      </button>
                    </div>
                  </div>
                )) : (
                  <div className="flex flex-col items-center justify-center py-20 text-center gap-4 opacity-30">
                    <Database className="w-10 h-10" />
                    <p className="text-xs font-bold uppercase tracking-widest italic">No dossiers archived</p>
                  </div>
                )}
              </div>

              <div className={`p-5 rounded-2xl flex items-start gap-3 border ${
                isDarkMode ? 'bg-indigo-500/5 border-indigo-500/10' : 'bg-indigo-50 border-indigo-100'
              }`}>
                <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-1" />
                <p className={`text-[11px] leading-relaxed font-medium ${isDarkMode ? 'text-indigo-300/60' : 'text-indigo-700/70'}`}>
                  Target dossiers allow you to pivot between multiple investigations without losing progress.
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
