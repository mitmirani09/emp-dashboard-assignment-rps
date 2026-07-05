import React, { useState, useMemo } from 'react';
import { 
  Sparkles, 
  Calendar, 
  User, 
  Search,
  BookOpen,
  ArrowUpDown
} from 'lucide-react';
import { useEmployee } from '../context/EmployeeContext';
import type { Announcement } from '../types';
import { generateSummaryFromGemini } from '../utils/gemini';




export const AnnouncementsPage: React.FC = () => {
  const { announcements } = useEmployee();

  // Filter & Search states
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [searchQuery, setSearchQuery] = useState('');

  // Track expanded card IDs for full content read
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});
  // Track loaded summaries (collapsible section)
  const [visibleSummaries, setVisibleSummaries] = useState<Record<string, boolean>>({});
  // Track mock loading skeletons per summary ID
  const [loadingSummaries, setLoadingSummaries] = useState<Record<string, boolean>>({});
  // Store pre-generated summaries
  const [aiSummaries, setAiSummaries] = useState<Record<string, string>>({});

  const categories = ['all', 'company', 'hr', 'event', 'policy'];

  const toggleExpandCard = (id: string) => {
    setExpandedCards(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Mock AI Summaries generator
  const getAISummary = (ann: Announcement): string => {
    if (ann.id === 'ann-1') {
      return "Starting Q3 next month, all employees are encouraged to visit office hubs in NY and Austin at least two days a week, enjoying new collaborative rooms and free catered lunches on Tuesdays and Thursdays.";
    }
    if (ann.id === 'ann-2') {
      return "Starting this fiscal year, unused Casual Leave rollover is capped at 5 days, while Sick Leave resets to 10 days without rollover on Dec 31st. Staff are advised to plan leaves in advance.";
    }
    if (ann.id === 'ann-3') {
      return "Registration is now open for the Central Park summer picnic on Aug 14th and the 24-hr AI-themed Hackathon starting Aug 13th. Register teams of up to 4 before July 31st.";
    }
    if (ann.id === 'ann-4') {
      return "The Q2 Town Hall Zoom call is scheduled for Wednesday, July 8th at 10 AM EST, featuring corporate metrics updates, roadmap goals, and a live client analytics dashboard showcase.";
    }
    // Generic fallback if user replaces mock JSON data later
    return ann.content.split('.').slice(0, 2).join('.') + '.';
  };

  const handleToggleSummary = async (id: string, ann: Announcement) => {
    // If summary is already open, just collapse it
    if (visibleSummaries[id]) {
      setVisibleSummaries(prev => ({ ...prev, [id]: false }));
      return;
    }

    // Otherwise, check if summary has been loaded before. If not, trigger loading skeleton
    if (!aiSummaries[id]) {
      setLoadingSummaries(prev => ({ ...prev, [id]: true }));
      setVisibleSummaries(prev => ({ ...prev, [id]: true }));

      const hasGeminiKey = !!import.meta.env.VITE_GEMINI_API_KEY;

      if (hasGeminiKey) {
        try {
          const summary = await generateSummaryFromGemini(ann.title, ann.content);
          setAiSummaries(prev => ({ ...prev, [id]: summary }));
        } catch (error) {
          console.warn("Failed to generate summary using Gemini API, falling back to mock summary.", error);
          setAiSummaries(prev => ({ ...prev, [id]: getAISummary(ann) }));
        } finally {
          setLoadingSummaries(prev => ({ ...prev, [id]: false }));
        }
      } else {
        // Simulate AI latency check for fallback
        setTimeout(() => {
          setAiSummaries(prev => ({ ...prev, [id]: getAISummary(ann) }));
          setLoadingSummaries(prev => ({ ...prev, [id]: false }));
        }, 1000);
      }
    } else {
      setVisibleSummaries(prev => ({ ...prev, [id]: true }));
    }
  };


  // Search & Filter computation
  const filteredAnnouncements = useMemo(() => {
    let result = announcements.filter(ann => {
      const matchCategory = selectedCategory === 'all' || ann.category === selectedCategory;
      const matchSearch = 
        ann.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ann.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ann.author.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchCategory && matchSearch;
    });

    // Sort order
    return result.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });
  }, [announcements, selectedCategory, sortOrder, searchQuery]);

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            Company Announcements
          </h1>
          <p className="text-sm text-gray-500 dark:text-slate-400">
            Stay up to date with HR announcements, corporate updates, and social events.
          </p>
        </div>
      </div>

      {/* Filters & search panel */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
          
          {/* Category Pill Buttons */}
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-200 cursor-pointer
                  ${selectedCategory === cat
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/10'
                    : 'bg-gray-50 text-gray-650 hover:bg-gray-100 dark:bg-slate-850 dark:text-slate-400 dark:hover:bg-slate-700/50'
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-stretch gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search announcements..."
                className="w-full sm:w-60 h-9 pl-9 pr-8 rounded-lg border bg-gray-50/50 dark:bg-slate-850 text-xs focus:ring-2 focus:ring-blue-500 border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white"
              />
            </div>

            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as any)}
                className="w-full sm:w-36 h-9 px-3 pr-8 rounded-lg border bg-gray-50/50 dark:bg-slate-850 text-xs focus:ring-2 focus:ring-blue-500 border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white appearance-none cursor-pointer"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400">
                <ArrowUpDown className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Feed Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredAnnouncements.map((ann) => {
          const isExpanded = expandedCards[ann.id] || false;
          const isSummaryVisible = visibleSummaries[ann.id] || false;
          const isSummaryLoading = loadingSummaries[ann.id] || false;


          return (
            <article 
              key={ann.id} 
              className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              {/* Optional announcement image */}
              {ann.imageUrl && (
                <div className="w-full h-44 overflow-hidden relative">
                  <img
                    src={ann.imageUrl}
                    alt={ann.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {ann.importance === 'high' && (
                    <span className="absolute top-4 left-4 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-red-500 text-white shadow">
                      URGENT
                    </span>
                  )}
                </div>
              )}

              {/* Text Context Body */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center text-[10px] text-gray-400 font-semibold mb-3">
                    <span className={`px-2 py-0.5 rounded-full uppercase tracking-wider
                      ${ann.category === 'policy' ? 'bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400' : ''}
                      ${ann.category === 'company' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' : ''}
                      ${ann.category === 'event' ? 'bg-purple-50 text-purple-600 dark:bg-purple-950/20 dark:text-purple-400' : ''}
                    `}>
                      {ann.category}
                    </span>
                    
                    <span className="flex items-center gap-1 font-mono">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      {ann.createdAt}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-base text-gray-900 dark:text-white leading-tight">
                    {ann.title}
                  </h3>

                  <p className={`text-xs text-gray-650 dark:text-slate-350 leading-relaxed mt-3
                    ${!isExpanded ? 'line-clamp-3' : ''}`}>
                    {ann.content}
                  </p>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-50 dark:border-slate-700/50">
                  <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                    
                    {/* Author Signature */}
                    <div className="flex items-center gap-1.5 text-gray-400">
                      <User className="w-4 h-4 shrink-0" />
                      <span className="text-[10px] font-medium truncate max-w-[120px]">{ann.author}</span>
                    </div>

                    {/* Footer CTAs */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleSummary(ann.id, ann)}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border text-[11px] font-bold cursor-pointer transition-all duration-200
                          ${isSummaryVisible
                            ? 'bg-blue-50 border-blue-200 text-blue-600 dark:bg-blue-950/30 dark:border-blue-800'
                            : 'hover:bg-gray-50 border-gray-200 text-gray-650 dark:border-slate-700 dark:hover:bg-slate-700 dark:text-slate-300'
                          }`}
                      >
                        <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                        {isSummaryVisible ? 'Hide AI Summary' : 'AI Summary'}
                      </button>

                      <button
                        onClick={() => toggleExpandCard(ann.id)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-gray-50 border border-gray-200 text-gray-650 dark:border-slate-700 dark:hover:bg-slate-700 dark:text-slate-300 text-[11px] font-bold cursor-pointer transition-colors"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        {isExpanded ? 'Collapse' : 'Read Full'}
                      </button>
                    </div>

                  </div>

                  {/* AI Summary Collapse Container */}
                  {isSummaryVisible && (
                    <div className="mt-4 p-3 rounded-xl bg-blue-50/20 dark:bg-blue-900/10 border border-blue-100/30 dark:border-blue-950/25 transition-all duration-300">
                      <div className="flex items-center gap-1 text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-2">
                        <Sparkles className="w-3 h-3 text-blue-500 animate-pulse" />
                        <span>AI Summary Output</span>
                      </div>
                      
                      {isSummaryLoading ? (
                        // Loading shimmer
                        <div className="space-y-1.5 py-1">
                          <div className="h-3 w-full animate-shimmer rounded" />
                          <div className="h-3 w-5/6 animate-shimmer rounded" />
                        </div>
                      ) : (
                        <p className="text-xs italic text-blue-900 dark:text-blue-200 leading-relaxed font-medium">
                          "{aiSummaries[ann.id]}"
                        </p>
                      )}
                    </div>
                  )}

                </div>
              </div>
            </article>
          );
        })}
      </div>

    </div>
  );
};
