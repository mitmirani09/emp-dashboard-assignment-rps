import React, { useState, useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { 
  Calendar as CalendarIcon, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  ChevronLeft, 
  ChevronRight, 
  ArrowUpDown,
  Search,
  Filter
} from 'lucide-react';
import { useEmployee } from '../context/EmployeeContext';
import { AttendanceRecord } from '../types';

export const AttendancePage: React.FC = () => {
  const { attendanceRecords } = useEmployee();
  
  // States
  const [selectedMonth, setSelectedMonth] = useState(6); // July (0-indexed base, so June = 5, July = 6)
  const [selectedYear, setSelectedYear] = useState(2026);
  const [sortAsc, setSortAsc] = useState(false); // Newest first by default

  const monthsList = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Adjust month navigator
  const handlePrevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(prev => prev - 1);
    } else {
      setSelectedMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(prev => prev + 1);
    } else {
      setSelectedMonth(prev => prev + 1);
    }
  };

  // Compute stat aggregates
  const stats = useMemo(() => {
    // Total shifts tracked
    const total = attendanceRecords.length;
    const present = attendanceRecords.filter(r => r.status === 'present').length;
    const late = attendanceRecords.filter(r => r.status === 'late').length;
    const absent = attendanceRecords.filter(r => r.status === 'absent').length;
    const onTime = present; // present counts as onTime in our status classification

    return {
      total,
      presentPercent: total > 0 ? Math.round((present / total) * 100) : 0,
      latePercent: total > 0 ? Math.round((late / total) * 100) : 0,
      absentPercent: total > 0 ? Math.round((absent / total) * 100) : 0,
      onTimePercent: total > 0 ? Math.round((onTime / total) * 100) : 0,
      presentCount: present,
      lateCount: late,
      absentCount: absent,
      onTimeCount: onTime
    };
  }, [attendanceRecords]);

  // Recharts Chart Data (last 6 months trend)
  const chartData = [
    { name: 'Jan', days: 20 },
    { name: 'Feb', days: 19 },
    { name: 'Mar', days: 22 },
    { name: 'Apr', days: 21 },
    { name: 'May', days: 18 },
    { name: 'Jun', days: 20 },
    { name: 'Jul', days: presentCount + lateCount }
  ];

  // Helper for actual present count
  const presentCount = attendanceRecords.filter(
    r => r.date.startsWith('2026-07') && (r.status === 'present' || r.status === 'late')
  ).length;

  // Generate calendar heatmap days for selected month (June/July 2026)
  const heatmapDays = useMemo(() => {
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    const firstDayIndex = new Date(selectedYear, selectedMonth, 1).getDay(); // Sunday = 0
    
    const days = [];
    
    // Add empty padding slots for preceding month days
    for (let i = 0; i < firstDayIndex; i++) {
      days.push({ dayNum: null, status: 'empty', dateStr: '' });
    }

    // Add actual days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${selectedYear}-${(selectedMonth + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      const record = attendanceRecords.find(r => r.date === dateStr);
      
      const checkDayOfWeek = new Date(selectedYear, selectedMonth, day).getDay();
      const isWeekend = checkDayOfWeek === 0 || checkDayOfWeek === 6;

      let status: 'present' | 'absent' | 'late' | 'weekend' | 'unlogged' = 'unlogged';
      if (record) {
        status = record.status;
      } else if (isWeekend) {
        status = 'weekend';
      }

      days.push({
        dayNum: day,
        status,
        dateStr,
        record
      });
    }

    return days;
  }, [selectedMonth, selectedYear, attendanceRecords]);

  // Sortable Log records
  const sortedRecords = useMemo(() => {
    return [...attendanceRecords].sort((a, b) => {
      const timeA = new Date(a.date).getTime();
      const timeB = new Date(b.date).getTime();
      return sortAsc ? timeA - timeB : timeB - timeA;
    });
  }, [attendanceRecords, sortAsc]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            Attendance Log
          </h1>
          <p className="text-sm text-gray-500 dark:text-slate-400">
            View detailed stats, charts, heatmaps, and punch card logs.
          </p>
        </div>

        {/* Date Month Selector */}
        <div className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 px-3 py-1.5 rounded-xl shadow-sm">
          <button 
            onClick={handlePrevMonth}
            className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-md cursor-pointer transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-semibold text-gray-700 dark:text-slate-200 min-w-[100px] text-center">
            {monthsList[selectedMonth]} {selectedYear}
          </span>
          <button 
            onClick={handleNextMonth}
            className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-md cursor-pointer transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 1. Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Present card */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-gray-100 dark:border-slate-700 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center text-emerald-500 shrink-0">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-gray-400 dark:text-slate-500 text-xs font-semibold uppercase tracking-wider">Present</p>
            <h3 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white mt-0.5">{stats.presentCount} days</h3>
            <span className="text-[10px] text-emerald-500 font-bold">{stats.presentPercent}% presence rate</span>
          </div>
        </div>

        {/* Late card */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-gray-100 dark:border-slate-700 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center text-amber-500 shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-gray-400 dark:text-slate-500 text-xs font-semibold uppercase tracking-wider">Late Arrivals</p>
            <h3 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white mt-0.5">{stats.lateCount} days</h3>
            <span className="text-[10px] text-amber-500 font-bold">{stats.latePercent}% delay rate</span>
          </div>
        </div>

        {/* Absent card */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-gray-100 dark:border-slate-700 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-50 dark:bg-red-950/30 flex items-center justify-center text-red-500 shrink-0">
            <XCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-gray-400 dark:text-slate-500 text-xs font-semibold uppercase tracking-wider">Absent</p>
            <h3 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white mt-0.5">{stats.absentCount} days</h3>
            <span className="text-[10px] text-red-500 font-bold">{stats.absentPercent}% absenteeism</span>
          </div>
        </div>

        {/* On Time card */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-gray-100 dark:border-slate-700 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center text-blue-500 shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-gray-400 dark:text-slate-500 text-xs font-semibold uppercase tracking-wider">On Time</p>
            <h3 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white mt-0.5">{stats.onTimeCount} days</h3>
            <span className="text-[10px] text-blue-500 font-bold">{stats.onTimePercent}% on time rate</span>
          </div>
        </div>
      </div>

      {/* 2. Visual Layer Grid (Chart & Heatmap Calendar) */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Attendance Bar Chart (3/5 width on desktop) */}
        <div className="lg:col-span-3 bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-5 space-y-4">
          <h2 className="font-bold text-base text-gray-900 dark:text-white">Attendance Trend (Last 6 Months)</h2>
          <div className="w-full h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" className="dark:stroke-slate-750" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis domain={[0, 25]} stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip 
                  cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }}
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="days" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={index === chartData.length - 1 ? '#8b5cf6' : '#3b82f6'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Heatmap Calendar (2/5 width on desktop) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-5 space-y-4 flex flex-col justify-between">
          <div>
            <h2 className="font-bold text-base text-gray-900 dark:text-white">Monthly Heatmap</h2>
            <p className="text-xs text-gray-400">Color-coded daily status logs.</p>
          </div>

          <div className="grid grid-cols-7 gap-1.5 text-center mt-4">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
              <span key={d} className="text-[10px] font-bold text-gray-450 dark:text-slate-500 py-1">{d}</span>
            ))}
            
            {heatmapDays.map((day, idx) => {
              if (day.dayNum === null) {
                return <div key={`empty-${idx}`} className="aspect-square" />;
              }

              let tileColor = 'bg-gray-100 dark:bg-slate-700/50 text-gray-400'; // unlogged
              if (day.status === 'present') tileColor = 'bg-emerald-500 text-white font-bold';
              else if (day.status === 'late') tileColor = 'bg-amber-500 text-white font-bold';
              else if (day.status === 'absent') tileColor = 'bg-red-500 text-white font-bold';
              else if (day.status === 'weekend') tileColor = 'bg-gray-50 dark:bg-slate-800 text-gray-300 dark:text-slate-650';

              return (
                <div
                  key={`day-${day.dayNum}`}
                  className={`aspect-square rounded-md flex items-center justify-center text-xs transition-all relative group
                    ${tileColor}`}
                >
                  <span>{day.dayNum}</span>
                  
                  {/* Tooltip on Hover */}
                  {day.status !== 'weekend' && day.status !== 'unlogged' && day.record && (
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1.5 hidden group-hover:block bg-slate-950 text-white text-[10px] py-1.5 px-2 rounded-lg shadow-xl z-55 whitespace-nowrap">
                      <p className="font-bold uppercase tracking-wider text-[9px]">
                        {day.status}
                      </p>
                      <p className="opacity-80">
                        {day.record.checkIn} - {day.record.checkOut}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Heatmap Legend */}
          <div className="flex justify-between items-center gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-slate-700/50 text-[10px] text-gray-400">
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded bg-emerald-500"></span>
              <span>Present</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded bg-amber-500"></span>
              <span>Late</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded bg-red-500"></span>
              <span>Absent</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded bg-gray-200 dark:bg-slate-700"></span>
              <span>Off-day</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Log Table (Responsive cards on mobile) */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden shadow-sm">
        <div className="p-5 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center bg-gray-50/50 dark:bg-slate-900/50">
          <h2 className="font-bold text-base text-gray-900 dark:text-white">Recent Attendance Logs</h2>
          <button
            onClick={() => setSortAsc(!sortAsc)}
            className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline cursor-pointer"
          >
            Sort by Date <ArrowUpDown className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Table layout (visible on tablet and desktop) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-gray-200 dark:border-slate-700 text-gray-400 bg-gray-50/50 dark:bg-slate-850/50 font-bold uppercase tracking-wider">
                <th className="p-4 pl-6">Date</th>
                <th className="p-4">Check-in Time</th>
                <th className="p-4">Check-out Time</th>
                <th className="p-4">Work Duration</th>
                <th className="p-4 pr-6">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-150 dark:divide-slate-700 text-gray-700 dark:text-slate-300">
              {sortedRecords.map((record) => (
                <tr key={record.date} className="hover:bg-gray-50/50 dark:hover:bg-slate-850/50 transition-colors">
                  <td className="p-4 pl-6 font-semibold font-mono text-gray-900 dark:text-white">{record.date}</td>
                  <td className="p-4">{record.checkIn}</td>
                  <td className="p-4">{record.checkOut}</td>
                  <td className="p-4">{record.duration > 0 ? `${record.duration} hours` : '-'}</td>
                  <td className="p-4 pr-6">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider
                      ${record.status === 'present' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400' : ''}
                      ${record.status === 'late' ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400' : ''}
                      ${record.status === 'absent' ? 'bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400' : ''}
                    `}>
                      {record.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile card view (visible on phone screens) */}
        <div className="block md:hidden divide-y divide-gray-150 dark:divide-slate-700 p-4">
          {sortedRecords.map((record) => (
            <div key={record.date} className="py-4 first:pt-0 last:pb-0 flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <span className="font-semibold font-mono text-gray-900 dark:text-white">{record.date}</span>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider
                  ${record.status === 'present' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400' : ''}
                  ${record.status === 'late' ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400' : ''}
                  ${record.status === 'absent' ? 'bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400' : ''}
                `}>
                  {record.status}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-[11px] text-gray-500 dark:text-slate-400">
                <div>
                  <span className="block text-[10px] text-gray-400">In Time</span>
                  <span className="font-semibold text-gray-700 dark:text-slate-300">{record.checkIn}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-gray-400">Out Time</span>
                  <span className="font-semibold text-gray-700 dark:text-slate-300">{record.checkOut}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-gray-400">Duration</span>
                  <span className="font-semibold text-gray-700 dark:text-slate-300">{record.duration > 0 ? `${record.duration}h` : '-'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};
