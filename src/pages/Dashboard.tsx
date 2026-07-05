import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Play, 
  Square, 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  XCircle, 
  ChevronRight, 
  ArrowUpRight,
  Plus,
  Sparkles,
  Megaphone
} from 'lucide-react';
import { useEmployee } from '../context/EmployeeContext';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { 
    currentUser, 
    attendanceRecords, 
    leaveBalances, 
    leaveRequests,
    announcements,
    isPunchedIn, 
    activePunchInTime, 
    punchIn, 
    punchOut 
  } = useEmployee();

  const [currentTime, setCurrentTime] = useState(new Date());
  const [elapsedTimeStr, setElapsedTimeStr] = useState('00h 00m 00s');

  // Update calendar date/time display
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Update dynamic punch duration worked timer
  useEffect(() => {
    if (!isPunchedIn || !activePunchInTime) {
      setElapsedTimeStr('00h 00m 00s');
      return;
    }

    const updateTimer = () => {
      const start = new Date(activePunchInTime).getTime();
      const now = new Date().getTime();
      const diffMs = now - start;

      const hrs = Math.floor(diffMs / (1000 * 60 * 60));
      const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diffMs % (1000 * 60)) / 1000);

      const hrsStr = hrs.toString().padStart(2, '0');
      const minsStr = mins.toString().padStart(2, '0');
      const secsStr = secs.toString().padStart(2, '0');

      setElapsedTimeStr(`${hrsStr}h ${minsStr}m ${secsStr}s`);
    };

    updateTimer(); // run once immediately
    const durationInterval = setInterval(updateTimer, 1000);
    return () => clearInterval(durationInterval);
  }, [isPunchedIn, activePunchInTime]);

  // Derive today's attendance state
  const todayStr = new Date().toISOString().split('T')[0];
  const todayRecord = attendanceRecords.find(r => r.date === todayStr);

  // Compute attendance stats
  const totalDaysThisMonth = attendanceRecords.length;
  const presentCount = attendanceRecords.filter(r => r.status === 'present').length;
  const lateCount = attendanceRecords.filter(r => r.status === 'late').length;
  const absentCount = attendanceRecords.filter(r => r.status === 'absent').length;

  // Filter pending leave count
  const pendingLeavesCount = leaveRequests.filter(r => r.status === 'pending').length;

  return (
    <div className="space-y-6 md:space-y-8">
      {/* 1. Header Greeting Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-blue-500/10 via-purple-500/5 to-transparent p-6 rounded-2xl border border-blue-500/10 dark:border-blue-500/5 dark:from-blue-900/10 dark:via-purple-900/5">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            Welcome back, {currentUser.name.split(' ')[0]} 👋
          </h1>
          <p className="text-sm text-gray-500 dark:text-slate-450 mt-1">
            You are logged in as <strong className="text-gray-700 dark:text-slate-350">{currentUser.role}</strong>
          </p>
        </div>
        <div className="flex items-center gap-3 bg-white dark:bg-slate-800 shadow-sm border border-gray-100 dark:border-slate-700 px-4 py-2.5 rounded-xl">
          <Calendar className="w-4.5 h-4.5 text-blue-500" />
          <div className="text-right">
            <p className="text-xs font-semibold text-gray-900 dark:text-white">
              {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </p>
            <p className="text-[10px] text-gray-400 dark:text-slate-500">
              {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </p>
          </div>
        </div>
      </div>

      {/* 2. Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left/Center Column (2/3 width on large screens) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Row 1: Attendance Punch & Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Attendance Status Hero Card */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 dark:from-blue-750 dark:to-indigo-900 text-white rounded-2xl p-6 shadow-lg shadow-blue-500/10 dark:shadow-none flex flex-col justify-between min-h-[220px] relative overflow-hidden group">
              {/* Decorative backgrounds */}
              <div className="absolute right-0 bottom-0 transform translate-x-8 translate-y-8 opacity-10 group-hover:scale-110 transition-transform duration-500">
                <Clock className="w-48 h-48" />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs font-semibold uppercase tracking-wider text-blue-100">
                    Work Shift Status
                  </span>
                  {isPunchedIn ? (
                    <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      PUNCHED IN
                    </span>
                  ) : todayRecord ? (
                    <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-white/90 border border-white/20">
                      SHIFT COMPLETED
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      NOT STARTED
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  <h3 className="text-3xl font-black tracking-tight font-mono">
                    {isPunchedIn ? elapsedTimeStr : todayRecord ? 'Shift Logged' : '00h 00m 00s'}
                  </h3>
                  <p className="text-xs text-blue-100/80">
                    {isPunchedIn 
                      ? `Checked in at ${new Date(activePunchInTime!).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`
                      : todayRecord
                        ? `Logged ${todayRecord.duration} hrs worked today`
                        : 'Punch in to start recording your day'
                    }
                  </p>
                </div>
              </div>

              <div className="mt-6 flex items-center gap-4">
                {isPunchedIn ? (
                  <button
                    onClick={punchOut}
                    className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-red-500 hover:bg-red-600 active:scale-98 transition-all font-semibold text-sm cursor-pointer shadow-lg shadow-red-950/20"
                  >
                    <Square className="w-4 h-4 fill-white" />
                    Punch Out
                  </button>
                ) : (
                  <button
                    onClick={punchIn}
                    disabled={!!todayRecord}
                    className={`w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm transition-all cursor-pointer shadow-lg
                      ${todayRecord 
                        ? 'bg-white/15 text-white/50 cursor-not-allowed shadow-none' 
                        : 'bg-white text-blue-700 hover:bg-blue-50 hover:scale-[1.02] active:scale-98 shadow-blue-900/20'
                      }`}
                  >
                    <Play className="w-4 h-4 fill-current" />
                    {todayRecord ? 'Punched for Today' : 'Punch In'}
                  </button>
                )}
              </div>
            </div>

            {/* Attendance Summary Mini-grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-100 dark:border-slate-700 flex flex-col justify-between">
                <span className="text-gray-400 dark:text-slate-500 text-xs font-medium">Logged Days</span>
                <div>
                  <h4 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{totalDaysThisMonth}</h4>
                  <div className="flex items-center gap-1 text-[10px] text-emerald-500 mt-1">
                    <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{presentCount + lateCount} active shifts</span>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-100 dark:border-slate-700 flex flex-col justify-between">
                <span className="text-gray-400 dark:text-slate-500 text-xs font-medium">Late Arrivals</span>
                <div>
                  <h4 className={`text-2xl font-bold mt-2 ${lateCount > 2 ? 'text-amber-500' : 'text-gray-900 dark:text-white'}`}>{lateCount}</h4>
                  <div className="flex items-center gap-1 text-[10px] text-amber-500 mt-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>Requires review</span>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-100 dark:border-slate-700 flex flex-col justify-between">
                <span className="text-gray-400 dark:text-slate-500 text-xs font-medium">Unexcused Absences</span>
                <div>
                  <h4 className={`text-2xl font-bold mt-2 ${absentCount > 0 ? 'text-red-500' : 'text-gray-900 dark:text-white'}`}>{absentCount}</h4>
                  <div className="flex items-center gap-1 text-[10px] text-red-500 mt-1">
                    <XCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{absentCount} days absent</span>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-100 dark:border-slate-700 flex flex-col justify-between">
                <span className="text-gray-400 dark:text-slate-500 text-xs font-medium">Daily Target</span>
                <div>
                  <h4 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">8.0 hrs</h4>
                  <span className="text-[10px] text-gray-450 dark:text-slate-500 block mt-1">Standard work shift</span>
                </div>
              </div>
            </div>
          </div>

          {/* Row 2: Announcements Feed Section */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-6 space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-purple-500" />
                <h2 className="font-bold text-lg text-gray-900 dark:text-white">Announcements</h2>
              </div>
              <button 
                onClick={() => navigate('/announcements')}
                className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                View Feed <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            <div className="divide-y divide-gray-100 dark:divide-slate-700">
              {announcements.slice(0, 2).map((ann) => (
                <div key={ann.id} className="py-4 first:pt-0 last:pb-0 group">
                  <div className="flex justify-between items-start gap-4 mb-2">
                    <div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider
                        ${ann.category === 'policy' ? 'bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400' : ''}
                        ${ann.category === 'company' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' : ''}
                        ${ann.category === 'event' ? 'bg-purple-50 text-purple-600 dark:bg-purple-950/20 dark:text-purple-400' : ''}
                      `}>
                        {ann.category}
                      </span>
                      <h3 className="font-bold text-sm text-gray-900 dark:text-white mt-1.5 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {ann.title}
                      </h3>
                    </div>
                    <span className="text-[10px] text-gray-400 shrink-0 font-medium">{ann.createdAt}</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-slate-400 line-clamp-2">
                    {ann.content}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Side Column (1/3 width on large screens) */}
        <div className="space-y-6">
          
          {/* Leaves Summary Panel */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-6 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="font-bold text-lg text-gray-900 dark:text-white">Leave Summary</h2>
              <button
                onClick={() => navigate('/leaves')}
                className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline cursor-pointer"
              >
                Manage
              </button>
            </div>

            <div className="space-y-4">
              {leaveBalances.map((bal) => {
                const percent = Math.round((bal.used / bal.total) * 100);
                const barColor = 
                  bal.type === 'casual' ? 'bg-blue-500' :
                  bal.type === 'sick' ? 'bg-emerald-500' : 'bg-purple-500';

                return (
                  <div key={bal.type} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold text-gray-700 dark:text-slate-350">
                      <span className="capitalize">{bal.type} Leave</span>
                      <span>{bal.used}/{bal.total} used</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-gray-400 dark:text-slate-500">
                      <span>{percent}% allocated</span>
                      <span>{bal.available} days left</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick Action Button & Details */}
            <div className="pt-4 border-t border-gray-100 dark:border-slate-700 space-y-3">
              <button
                onClick={() => navigate('/leaves?openRequest=true')}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-98 hover:scale-[1.01] transition-all font-semibold text-sm text-white shadow-lg shadow-blue-600/10 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Request Time Off
              </button>
              {pendingLeavesCount > 0 && (
                <div className="text-center">
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 px-2.5 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                    {pendingLeavesCount} request{pendingLeavesCount > 1 ? 's' : ''} pending approval
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Shortcuts Card */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4.5 h-4.5 text-blue-400" />
              <h3 className="font-bold text-sm text-slate-100">Intranet Features</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Explore your corporate portal. Search for teammates, read detailed announcements, check leaves, or chat with our HR assistant bot below.
            </p>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button 
                onClick={() => navigate('/directory')}
                className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 text-left transition-colors cursor-pointer group"
              >
                <span className="text-xs font-semibold text-slate-200">Directory</span>
                <ArrowUpRight className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
              </button>
              <button 
                onClick={() => navigate('/profile')}
                className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 text-left transition-colors cursor-pointer group"
              >
                <span className="text-xs font-semibold text-slate-200">My Profile</span>
                <ArrowUpRight className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
