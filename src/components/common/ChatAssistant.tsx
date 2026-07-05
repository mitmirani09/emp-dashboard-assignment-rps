import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageSquare, 
  X, 
  Send, 
  Minus,
  Bot,
  ArrowRight
} from 'lucide-react';
import { useEmployee } from '../../context/EmployeeContext';
import type { Message } from '../../types';
import { generateChatResponseFromGemini } from '../../utils/gemini';

export const ChatAssistant: React.FC = () => {
  const { currentUser, leaveBalances, attendanceRecords } = useEmployee();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Reset chat welcome message when active profile changes
  useEffect(() => {
    setMessages([
      {
        id: 'welcome',
        text: `Hi ${currentUser.name.split(' ')[0]}! 👋 I am your virtual HR Assistant. Ask me anything about leaves, check-ins, or company policies!`,
        sender: 'bot',
        createdAt: new Date().toISOString()
      }
    ]);
  }, [currentUser.id]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const suggestions = [
    'What is my leave balance?',
    'How do I request leave?',
    'Who is my manager?',
    'How do I punch in?'
  ];

  // Match keyword answers (Local Fallback Engine)
  const generateBotResponse = (text: string): string => {
    const query = text.toLowerCase();

    // 1. Leave Balance
    if (query.includes('leave balance') || query.includes('remaining leave') || query.includes('how many leaves') || query.includes('sick leave') || query.includes('casual leave')) {
      const casual = leaveBalances.find(b => b.type === 'casual')?.available || 0;
      const sick = leaveBalances.find(b => b.type === 'sick')?.available || 0;
      const earned = leaveBalances.find(b => b.type === 'earned')?.available || 0;
      return `Your current available leave balances are:\n- **Casual Leave**: ${casual} days\n- **Sick Leave**: ${sick} days\n- **Earned Leave**: ${earned} days\n\nYou can apply for leaves in the **Leaves** tab.`;
    }

    // 2. Request Leave
    if (query.includes('request leave') || query.includes('time off') || query.includes('apply for leave') || query.includes('vacation')) {
      return "To request time off, go to the **Leaves** page and click the **'Request New Leave'** button. Choose your dates, leave type, and submit. Your manager will be notified immediately.";
    }

    // 3. Manager Details
    if (query.includes('manager') || query.includes('reporting') || query.includes('boss') || query.includes('who do i report to')) {
      if (currentUser.reportingTo) {
        return `Your designated reporting manager is **${currentUser.reportingTo}**. You can view their details in the **Team Directory** or on your profile.`;
      }
      return "You do not report to anyone listed in the portal (CEO/Executive level).";
    }

    // 4. Punching In / Attendance
    if (query.includes('punch') || query.includes('check in') || query.includes('check out') || query.includes('attendance') || query.includes('hours worked')) {
      const todayStr = new Date().toISOString().split('T')[0];
      const todayRecord = attendanceRecords.find(r => r.date === todayStr);

      if (todayRecord) {
        return `Today (${todayRecord.date}), you punched in at **${todayRecord.checkIn}** and checked out at **${todayRecord.checkOut}** (Worked: ${todayRecord.duration} hrs).`;
      }
      return "Use the **Attendance Status Card** on your main **Dashboard** homepage to check in or out. Simply click 'Punch In' to start your shift.";
    }

    // Default Fallback
    return `I couldn't find a direct answer to "${text}". You can ask me about:
- Your leave balances
- How to apply for leaves
- Who your manager is
- Your check-in attendance logs

Alternatively, contact HR Operations at **hr@company.com**.`;
  };

  const handleSendMessage = async (messageText: string) => {
    if (!messageText.trim()) return;

    // User Message
    const userMsg: Message = {
      id: `msg-${Date.now()}-user`,
      text: messageText,
      sender: 'user',
      createdAt: new Date().toISOString()
    };

    // Prepend user message immediately to the view
    setMessages(prev => [...prev, userMsg]);
    setInputVal('');
    setIsTyping(true);

    const hasGeminiKey = !!import.meta.env.VITE_GEMINI_API_KEY;

    if (hasGeminiKey) {
      try {
        // Compile context strings dynamically based on switched profile
        const balancesStr = leaveBalances
          .map(b => `- ${b.type.toUpperCase()}: total ${b.total}, used ${b.used}, available ${b.available}`)
          .join('\n');
        
        const attendanceStr = attendanceRecords
          .slice(0, 5)
          .map(r => `- ${r.date}: status ${r.status} (Punch: ${r.checkIn} to ${r.checkOut}, worked ${r.duration} hours)`)
          .join('\n');

        const context = {
          userName: currentUser.name,
          userRole: currentUser.role,
          userDepartment: currentUser.department,
          managerName: currentUser.reportingTo || 'None',
          leaveBalances: balancesStr || 'No leaves on file.',
          recentAttendance: attendanceStr || 'No check-in history found.'
        };

        // Format history for Gemini call (exclude current userMsg since it is passed separately)
        const chatHistory = messages
          .filter(m => m.id !== 'welcome')
          .map(m => ({ sender: m.sender, text: m.text }));

        const botReply = await generateChatResponseFromGemini(messageText, chatHistory, context);

        const botMsg: Message = {
          id: `msg-${Date.now()}-bot`,
          text: botReply,
          sender: 'bot',
          createdAt: new Date().toISOString()
        };
        setMessages(prev => [...prev, botMsg]);
      } catch (error) {
        console.warn("Failed to generate chat response using Gemini API, falling back to mock reply.", error);
        
        const botMsg: Message = {
          id: `msg-${Date.now()}-bot`,
          text: generateBotResponse(messageText),
          sender: 'bot',
          createdAt: new Date().toISOString()
        };
        setMessages(prev => [...prev, botMsg]);
      } finally {
        setIsTyping(false);
      }
    } else {
      // Simulate typing delay for fallback mock engine
      setTimeout(() => {
        const botMsg: Message = {
          id: `msg-${Date.now()}-bot`,
          text: generateBotResponse(messageText),
          sender: 'bot',
          createdAt: new Date().toISOString()
        };
        setMessages(prev => [...prev, botMsg]);
        setIsTyping(false);
      }, 1000);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage(inputVal);
    }
  };


  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end">
      
      {/* 1. Chat Widget Window (Visible when open) */}
      {isOpen && (
        <div className="mb-4 w-[340px] h-[450px] rounded-2xl border shadow-2xl overflow-hidden flex flex-col justify-between transition-all duration-300 animate-in fade-in slide-in-from-bottom-4
          bg-white border-gray-200 dark:bg-slate-800 dark:border-slate-700">
          
          {/* Header */}
          <div className="h-14 px-4 bg-gradient-to-r from-blue-600 to-indigo-650 text-white flex justify-between items-center shadow">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                <Bot className="w-4.5 h-4.5 text-blue-100" />
              </div>
              <div>
                <h3 className="font-bold text-xs tracking-wide">HR Assistant</h3>
                <span className="flex items-center gap-1 text-[9px] text-emerald-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Online
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-white/10 rounded text-white/80 hover:text-white cursor-pointer"
              >
                <Minus className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-white/10 rounded text-white/80 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages viewable container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/50 dark:bg-slate-900/50">
            {messages.map((msg) => (
              <div 
                key={msg.id}
                className={`flex flex-col max-w-[85%] space-y-1 
                  ${msg.sender === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'}`}
              >
                <div 
                  className={`p-3 rounded-2xl text-xs leading-relaxed whitespace-pre-line shadow-sm
                    ${msg.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-tr-none'
                      : 'bg-white text-gray-800 border border-gray-150 rounded-tl-none dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200'
                    }`}
                >
                  {msg.text}
                </div>
                <span className="text-[9px] text-gray-400 px-1">
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}

            {/* Typing status dots */}
            {isTyping && (
              <div className="flex flex-col max-w-[80%] items-start space-y-1">
                <div className="p-3 bg-white border border-gray-150 rounded-2xl rounded-tl-none dark:bg-slate-800 dark:border-slate-700 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggestions footer */}
          {messages.length === 1 && !isTyping && (
            <div className="px-4 py-2 border-t border-gray-100 dark:border-slate-700 bg-gray-50/20 dark:bg-slate-900/10">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1.5">Common Queries</p>
              <div className="flex flex-wrap gap-1.5">
                {suggestions.map((sug) => (
                  <button
                    key={sug}
                    onClick={() => handleSendMessage(sug)}
                    className="flex items-center gap-0.5 px-2.5 py-1 rounded-full border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 text-[10px] font-semibold text-gray-600 dark:text-slate-350 cursor-pointer transition-colors"
                  >
                    {sug} <ArrowRight className="w-2.5 h-2.5 opacity-50" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Form input field */}
          <div className="p-3 border-t border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex gap-2">
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask about leaves, shift logs..."
              className="flex-1 h-9 px-3 rounded-xl border bg-gray-50 dark:bg-slate-850 text-xs focus:ring-2 focus:ring-blue-500 border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white"
            />
            <button
              onClick={() => handleSendMessage(inputVal)}
              disabled={!inputVal.trim()}
              className={`p-2 rounded-xl text-white transition-all cursor-pointer flex items-center justify-center shrink-0
                ${inputVal.trim() 
                  ? 'bg-blue-600 hover:bg-blue-700 active:scale-95 shadow-md shadow-blue-500/10' 
                  : 'bg-gray-100 text-gray-400 dark:bg-slate-700 dark:text-slate-500 cursor-not-allowed'
                }`}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 2. Floating Action Bubble Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-650 hover:from-blue-750 hover:to-indigo-750 text-white flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 cursor-pointer transition-all relative border border-white/10"
        aria-label="Toggle HR Assistant"
      >
        {isOpen ? (
          <X className="w-5 h-5" />
        ) : (
          <>
            <MessageSquare className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-slate-950"></span>
          </>
        )}
      </button>

    </div>
  );
};
