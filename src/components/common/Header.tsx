import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Menu, User, Settings, LogOut, ChevronDown, Sparkles } from 'lucide-react';
import { useEmployee } from '../../context/EmployeeContext';
import { ThemeToggle } from './ThemeToggle';

interface HeaderProps {
  onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const { currentUser, employees, switchUser } = useEmployee();
  const [showNotifications, setShowNotifications] = useState(false);


  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const notificationsRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  const mockNotifications = [
    { id: 1, title: 'Leave Request Approved', desc: 'Your Earned Leave request for August has been approved.', time: '2h ago', unread: true },
    { id: 2, title: 'Q2 Town Hall Meeting', desc: 'Join the Zoom meeting tomorrow at 10:00 AM EST.', time: '5h ago', unread: true },
    { id: 3, title: 'Punch reminder', desc: 'Don\'t forget to punch out at the end of the day.', time: '1d ago', unread: false }
  ];

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = mockNotifications.filter(n => n.unread).length;

  return (
    <header className="sticky top-0 z-40 w-full h-16 border-b transition-colors duration-300 backdrop-blur-md
      bg-white/80 border-gray-200 dark:bg-slate-900/80 dark:border-slate-800">
      <div className="flex items-center justify-between h-full px-4 md:px-6">

        {/* Left Side: Hamburger & Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="p-1.5 rounded-lg border cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-800 border-gray-200 dark:border-slate-700 md:hidden text-gray-600 dark:text-slate-300"
            aria-label="Toggle Sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link to="/" className="flex items-center gap-2 font-bold text-lg text-gray-900 dark:text-white hover:opacity-90">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-500 to-purple-600 text-white">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="hidden sm:inline bg-gradient-to-r from-blue-600 to-purple-500 bg-clip-text text-transparent dark:from-blue-400 dark:to-purple-300">
              RPSPortal
            </span>
          </Link>
        </div>

        {/* Center: Desktop Quick Info */}
        <div className="hidden md:flex items-center gap-2 text-sm text-gray-500 dark:text-slate-400">
          <span>{new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
          <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-slate-600"></span>
          <span>Active Session: <strong className="text-gray-700 dark:text-slate-200">{currentUser.name}</strong></span>
        </div>

        {/* Right Side: Tools, Notification, User Profile */}
        <div className="flex items-center gap-4">
          <ThemeToggle />

          {/* Notifications Center */}
          <div className="relative" ref={notificationsRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg border text-gray-600 dark:text-slate-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-800 border-gray-200 dark:border-slate-700"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex w-2.5 h-2.5 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-900"></span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 rounded-xl border shadow-xl bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 overflow-hidden transition-all animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="p-3 border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 flex justify-between items-center">
                  <h3 className="font-semibold text-sm text-gray-900 dark:text-white">Notifications</h3>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-medium">
                    {unreadCount} new
                  </span>
                </div>
                <div className="max-h-64 overflow-y-auto divide-y divide-gray-150 dark:divide-slate-700">
                  {mockNotifications.map(notif => (
                    <div key={notif.id} className={`p-3 transition-colors hover:bg-gray-50 dark:hover:bg-slate-500 ${notif.unread ? 'bg-blue-50/20 dark:bg-blue-900/10' : ''}`}>
                      <div className="flex justify-between items-start gap-2 mb-1">
                        <span className={`text-xs font-semibold ${notif.unread ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-slate-300'}`}>
                          {notif.title}
                        </span>
                        <span className="text-[10px] text-gray-400 shrink-0">{notif.time}</span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-slate-400 line-clamp-2">{notif.desc}</p>
                    </div>
                  ))}
                </div>
                <div className="p-2 text-center border-t border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900">
                  <button className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline cursor-pointer">
                    Clear all notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Account Dropdown */}
          <div className="relative" ref={userDropdownRef}>
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center gap-2 p-1.5 rounded-lg border cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300"
            >
              <img
                src={currentUser.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&q=80'}
                alt={currentUser.name}
                className="w-6 h-6 rounded-full object-cover"
              />
              <span className="hidden sm:inline text-xs font-medium max-w-[100px] truncate">{currentUser.name}</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-60" />
            </button>

            {showUserDropdown && (
              <div className="absolute right-0 mt-2 w-52 rounded-xl border shadow-xl bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 py-1 overflow-hidden transition-all animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="p-3 border-b border-gray-100 dark:border-slate-750">
                  <p className="text-xs font-bold text-gray-900 dark:text-white truncate">{currentUser.name}</p>
                  <p className="text-[10px] text-gray-500 dark:text-slate-400 truncate">{currentUser.email}</p>
                </div>
                <Link
                  to="/profile"
                  onClick={() => setShowUserDropdown(false)}
                  className="flex items-center gap-2 px-4 py-2 text-xs text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <User className="w-4 h-4 opacity-70" />
                  My Profile
                </Link>
                <div
                  className="flex items-center gap-2 px-4 py-2 text-xs text-gray-400 dark:text-slate-500 cursor-not-allowed"
                >
                  <Settings className="w-4 h-4 opacity-50" />
                  Settings
                </div>

                {/* Switch Profile Sub-menu */}
                <div className="border-t border-gray-100 dark:border-slate-750 my-1"></div>
                <div className="px-4 py-1.5 text-[9px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">
                  Switch Profile
                </div>
                <div className="max-h-36 overflow-y-auto px-2 pb-2 space-y-1">
                  {employees.map(emp => (
                    <button
                      key={emp.id}
                      onClick={() => {
                        switchUser(emp.id);
                        setShowUserDropdown(false);
                      }}
                      className={`w-full flex items-center gap-2 px-2 py-1 rounded-lg text-left text-xs transition-colors cursor-pointer
                        ${currentUser.id === emp.id
                          ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 font-semibold'
                          : 'text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700'
                        }`}
                    >
                      <img
                        src={emp.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=24&h=24&fit=crop&q=80'}
                        alt={emp.name}
                        className="w-4.5 h-4.5 rounded-full object-cover shrink-0"
                      />
                      <span className="truncate">{emp.name.split(' ')[0]} ({emp.department})</span>
                    </button>
                  ))}
                </div>

                <div className="border-t border-gray-100 dark:border-slate-750 my-1"></div>
                <button
                  onClick={() => {
                    setShowUserDropdown(false);
                    alert("Logout is disabled in mock mode.");
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors cursor-pointer text-left"
                >
                  <LogOut className="w-4 h-4 opacity-70" />
                  Logout
                </button>
              </div>

            )}
          </div>

        </div>

      </div>
    </header>
  );
};
