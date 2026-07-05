import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Calendar from 'react-calendar';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip 
} from 'recharts';
import { 
  Plus, 
  X, 
  AlertCircle, 
  CheckCircle2, 
  Calendar as CalendarIcon
} from 'lucide-react';
import { useEmployee } from '../context/EmployeeContext';
import { toast } from 'sonner';



export const LeavesPage: React.FC = () => {
  const { 
    leaveBalances, 
    leaveRequests, 
    submitLeaveRequest 
  } = useEmployee();

  const [searchParams, setSearchParams] = useSearchParams();

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form Fields
  const [leaveType, setLeaveType] = useState<'casual' | 'sick' | 'earned'>('casual');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Query parameter to open modal automatically (e.g. from Dashboard click)
  useEffect(() => {
    if (searchParams.get('openRequest') === 'true') {
      setIsModalOpen(true);
      // Clear parameter so it doesn't reopen
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

  // Compute total days between two dates (inclusive)
  const requestedDaysCount = useMemo(() => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end < start) return 0;
    
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  }, [startDate, endDate]);

  // Available balance check
  const activeBalance = useMemo(() => {
    return leaveBalances.find(b => b.type === leaveType);
  }, [leaveBalances, leaveType]);

  const hasSufficientBalance = useMemo(() => {
    if (!activeBalance) return false;
    return activeBalance.available >= requestedDaysCount;
  }, [activeBalance, requestedDaysCount]);

  // Pie chart data: Used leaves breakdown
  const pieData = useMemo(() => {
    return leaveBalances.map(b => ({
      name: b.type.charAt(0).toUpperCase() + b.type.slice(1),
      value: b.used,
      color: b.type === 'casual' ? '#3b82f6' : b.type === 'sick' ? '#10b981' : '#8b5cf6'
    }));
  }, [leaveBalances]);

  // Map approved leave dates to color code in calendar
  const approvedLeaveDates = useMemo(() => {
    const dates: Record<string, { type: string; id: string }> = {};
    leaveRequests
      .filter(r => r.status === 'approved')
      .forEach(req => {
        let current = new Date(req.startDate);
        const last = new Date(req.endDate);
        while (current <= last) {
          const dateStr = current.toISOString().split('T')[0];
          dates[dateStr] = { type: req.leaveType, id: req.id };
          current.setDate(current.getDate() + 1);
        }
      });
    return dates;
  }, [leaveRequests]);

  // Calendar tile styling for approved blocks
  const tileClassName = ({ date, view }: { date: Date; view: string }) => {
    if (view !== 'month') return null;
    const dateStr = date.toISOString().split('T')[0];
    const match = approvedLeaveDates[dateStr];
    if (match) {
      if (match.type === 'casual') return 'bg-blue-500/20 text-blue-700 font-bold border-l-4 border-blue-500';
      if (match.type === 'sick') return 'bg-emerald-500/20 text-emerald-700 font-bold border-l-4 border-emerald-500';
      if (match.type === 'earned') return 'bg-purple-500/20 text-purple-700 font-bold border-l-4 border-purple-500';
    }
    return null;
  };

  // Form submit validation and submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!startDate) errors.startDate = 'Start date is required';
    if (!endDate) errors.endDate = 'End date is required';
    if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
      errors.endDate = 'End date cannot be before start date';
    }
    if (startDate && new Date(startDate) < new Date(new Date().setHours(0, 0, 0, 0))) {
      errors.startDate = 'Date cannot be in the past';
    }
    if (reason.trim().length < 10) {
      errors.reason = 'Reason must be at least 10 characters';
    }
    if (!hasSufficientBalance) {
      errors.balance = 'Insufficient leave balance';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      toast.error('Please correct the validation errors before submitting.');
      return;
    }

    // Attempt request submission
    const success = submitLeaveRequest({
      startDate,
      endDate,
      leaveType,
      reason
    });

    if (success) {
      toast.success('Leave request submitted and auto-approved!');
      setIsModalOpen(false);
      // Reset Form
      setStartDate('');
      setEndDate('');
      setReason('');
      setFormErrors({});
    } else {
      toast.error('Failed to submit leave request. Check your balance.');
    }
  };

  return (
    <div className="space-y-6 md:space-y-8">
      
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            Time Off & Leaves
          </h1>
          <p className="text-sm text-gray-500 dark:text-slate-400">
            Request vacation days, view balance charts, and track request history.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm hover:scale-[1.01] active:scale-98 transition-all shadow-lg shadow-blue-500/10 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Request New Leave
        </button>
      </div>

      {/* 1. Leaves Summary & Pie Chart Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Progress bar cards */}
        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {leaveBalances.map((bal) => {
              const themeColor = 
                bal.type === 'casual' ? 'text-blue-500 border-blue-500' :
                bal.type === 'sick' ? 'text-emerald-500 border-emerald-500' : 'text-purple-500 border-purple-500';
              const bgBadge =
                bal.type === 'casual' ? 'bg-blue-50 dark:bg-blue-950/20' :
                bal.type === 'sick' ? 'bg-emerald-50 dark:bg-emerald-950/20' : 'bg-purple-50 dark:bg-purple-950/20';

              const percent = Math.round((bal.used / bal.total) * 100);

              return (
                <div 
                  key={bal.type} 
                  className={`bg-white dark:bg-slate-800 p-5 rounded-2xl border border-gray-100 dark:border-slate-700 flex flex-col justify-between min-h-[150px] relative overflow-hidden`}
                >
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">
                      {bal.type} Leave
                    </span>
                    <span className={`text-[10px] font-extrabold uppercase tracking-wide px-2 py-0.5 rounded-full ${bgBadge} ${themeColor}`}>
                      {bal.available} available
                    </span>
                  </div>
                  <div>
                    <h3 className="text-3xl font-black text-gray-900 dark:text-white mt-4">{bal.used}/{bal.total}</h3>
                    <p className="text-[10px] text-gray-450 dark:text-slate-450 mt-1">Days Used</p>
                    <div className="w-full h-1.5 bg-gray-100 dark:bg-slate-700 rounded-full mt-3 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500
                          ${bal.type === 'casual' ? 'bg-blue-500' : bal.type === 'sick' ? 'bg-emerald-500' : 'bg-purple-500'}`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick instructions card */}
          <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-slate-800 dark:to-slate-800/40 border border-indigo-100/50 dark:border-slate-700 p-6 rounded-2xl flex items-start gap-4">
            <CalendarIcon className="w-6 h-6 text-indigo-500 shrink-0" />
            <div>
              <h3 className="font-bold text-sm text-gray-900 dark:text-white">Leave Guidelines</h3>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                Sick leaves can be booked dynamically and are auto-approved. Casual and Earned leaves should be applied for at least 3 days in advance to allow proper workload distribution within engineering sprints. Unused Casual leaves carry over up to 5 days.
              </p>
            </div>
          </div>
        </div>

        {/* Recharts Pie Chart of Leaves */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-5 flex flex-col justify-between min-h-[300px]">
          <div>
            <h2 className="font-bold text-base text-gray-900 dark:text-white">Allocation Distribution</h2>
            <p className="text-xs text-gray-400">Used leave shares by category</p>
          </div>
          <div className="w-full h-44 my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '11px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 text-[10px] text-gray-400 font-medium">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Casual</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Sick</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-purple-500" /> Earned</span>
          </div>
        </div>
      </div>

      {/* 2. Interactive Calendar & Sidebar Log */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Leave blocker Calendar */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-5 space-y-4">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-indigo-500" />

            <h2 className="font-bold text-base text-gray-900 dark:text-white">Leave Calendar</h2>
          </div>
          <p className="text-xs text-gray-400">Highlighted blocks indicate dates with approved leaves.</p>
          <div className="pt-2">
            <Calendar
              tileClassName={tileClassName}
              calendarType="gregory"
              minDetail="month"
            />
          </div>
        </div>

        {/* Shaded blocks Legend / Info */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-6 flex flex-col justify-between">
          <div>
            <h2 className="font-bold text-base text-gray-900 dark:text-white">Calendar Key</h2>
            <p className="text-xs text-gray-400 mt-1">Status indications displayed on calendar tiles.</p>
            
            <div className="mt-6 space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-50/50 dark:bg-blue-900/10 border border-blue-150/20">
                <div className="w-4 h-4 rounded bg-blue-500" />
                <div>
                  <h4 className="text-xs font-bold text-gray-900 dark:text-white">Casual Leave Block</h4>
                  <p className="text-[10px] text-gray-450 dark:text-slate-400">Personal errands or brief breaks</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-150/20">
                <div className="w-4 h-4 rounded bg-emerald-500" />
                <div>
                  <h4 className="text-xs font-bold text-gray-900 dark:text-white">Sick Leave Block</h4>
                  <p className="text-[10px] text-gray-450 dark:text-slate-400">Medical checks or recuperations</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-purple-50/50 dark:bg-purple-900/10 border border-purple-150/20">
                <div className="w-4 h-4 rounded bg-purple-500" />
                <div>
                  <h4 className="text-xs font-bold text-gray-900 dark:text-white">Earned Leave Block</h4>
                  <p className="text-[10px] text-gray-450 dark:text-slate-400">Extended vacations & holiday leaves</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-[10px] text-gray-400 border-t border-gray-100 dark:border-slate-700/50 pt-4 mt-6">
            Hover over calendar tile highlights to view the assigned employee details block.
          </div>
        </div>
      </div>

      {/* 3. Leave Request History */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden shadow-sm">
        <div className="p-5 border-b border-gray-100 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-900/50">
          <h2 className="font-bold text-base text-gray-900 dark:text-white">Time Off Request History</h2>
        </div>

        {/* Table logs */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-gray-200 dark:border-slate-700 text-gray-400 bg-gray-50/50 dark:bg-slate-850/50 font-bold uppercase tracking-wider">
                <th className="p-4 pl-6">Leave Type</th>
                <th className="p-4">Duration Range</th>
                <th className="p-4">Submission Reason</th>
                <th className="p-4">Date Applied</th>
                <th className="p-4 pr-6 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-150 dark:divide-slate-700 text-gray-700 dark:text-slate-300">
              {leaveRequests.map((req) => (
                <tr key={req.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-850/50 transition-colors">
                  <td className="p-4 pl-6">
                    <span className="capitalize font-semibold text-gray-900 dark:text-white">{req.leaveType}</span>
                  </td>
                  <td className="p-4 font-mono font-medium text-gray-600 dark:text-slate-400">
                    {req.startDate} to {req.endDate}
                  </td>
                  <td className="p-4 max-w-xs truncate" title={req.reason}>
                    {req.reason}
                  </td>
                  <td className="p-4 font-mono text-gray-400">{req.createdAt}</td>
                  <td className="p-4 pr-6 text-right">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider
                      ${req.status === 'approved' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400' : ''}
                      ${req.status === 'pending' ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400' : ''}
                      ${req.status === 'rejected' ? 'bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400' : ''}
                    `}>
                      {req.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Request Leave Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-sm transition-opacity animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl border border-gray-100 dark:border-slate-700 shadow-2xl overflow-hidden transform transition-all scale-100 animate-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="flex justify-between items-center p-5 border-b border-gray-150 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-blue-500" />

                <h3 className="font-bold text-base text-gray-900 dark:text-white">Request Time Off</h3>
              </div>
              <button 
                onClick={() => { setIsModalOpen(false); setFormErrors({}); }}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {/* Leave Type Select */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700 dark:text-slate-350">Leave Type</label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value as any)}
                  className="w-full h-10 px-3 rounded-lg border bg-white dark:bg-slate-850 text-xs focus:ring-2 focus:ring-blue-500 border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white"
                >
                  <option value="casual">Casual Leave</option>
                  <option value="sick">Sick Leave</option>
                  <option value="earned">Earned Leave</option>
                </select>
                {activeBalance && (
                  <p className="text-[10px] text-gray-450 dark:text-slate-400">
                    Remaining balance: <strong className="text-blue-500">{activeBalance.available} days</strong> (Used: {activeBalance.used}/{activeBalance.total})
                  </p>
                )}
              </div>

              {/* Date Pickers */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700 dark:text-slate-350">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border bg-white dark:bg-slate-850 text-xs focus:ring-2 focus:ring-blue-500 border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white"
                  />
                  {formErrors.startDate && (
                    <p className="text-[10px] text-red-500 font-medium">{formErrors.startDate}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700 dark:text-slate-350">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border bg-white dark:bg-slate-850 text-xs focus:ring-2 focus:ring-blue-500 border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white"
                  />
                  {formErrors.endDate && (
                    <p className="text-[10px] text-red-500 font-medium">{formErrors.endDate}</p>
                  )}
                </div>
              </div>

              {/* Total Requested Days Tracker */}
              {requestedDaysCount > 0 && (
                <div className={`p-3 rounded-xl border flex items-center gap-2 text-xs font-semibold
                  ${hasSufficientBalance 
                    ? 'bg-blue-50/50 border-blue-200 text-blue-800 dark:bg-blue-900/10 dark:border-blue-800/30 dark:text-blue-300' 
                    : 'bg-red-50/50 border-red-200 text-red-800 dark:bg-red-950/15 dark:border-red-900/30 dark:text-red-300'
                  }`}
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>
                    Requesting {requestedDaysCount} day{requestedDaysCount > 1 ? 's' : ''} of {leaveType} leave.
                    {!hasSufficientBalance && ' Insufficient balance!'}
                  </span>
                </div>
              )}

              {/* Reason Description */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-gray-700 dark:text-slate-350">Reason</label>
                  <span className="text-[10px] text-gray-400">{reason.length}/500</span>
                </div>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value.slice(0, 500))}
                  placeholder="Provide details about your time off request..."
                  rows={4}
                  className="w-full p-3 rounded-lg border bg-white dark:bg-slate-850 text-xs focus:ring-2 focus:ring-blue-500 border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white resize-none"
                />
                {formErrors.reason && (
                  <p className="text-[10px] text-red-500 font-medium">{formErrors.reason}</p>
                )}
              </div>

              {/* Action buttons */}
              <div className="pt-2 flex justify-end gap-3 text-xs">
                <button
                  type="button"
                  onClick={() => { setIsModalOpen(false); setFormErrors({}); }}
                  className="px-4 py-2.5 rounded-lg border hover:bg-gray-50 border-gray-200 dark:border-slate-750 dark:hover:bg-slate-700 text-gray-600 dark:text-slate-350 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!hasSufficientBalance && requestedDaysCount > 0}
                  className={`px-5 py-2.5 rounded-lg text-white font-semibold flex items-center gap-1.5 cursor-pointer shadow-lg
                    ${!hasSufficientBalance && requestedDaysCount > 0
                      ? 'bg-blue-600/50 cursor-not-allowed shadow-none opacity-60'
                      : 'bg-blue-600 hover:bg-blue-700 active:scale-98 shadow-blue-500/10'
                    }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
