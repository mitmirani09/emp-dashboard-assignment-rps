import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Clock, 
  CalendarDays, 
  Users, 
  Megaphone, 
  User,
  Settings,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react';


interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, 
  onClose, 
  isCollapsed, 
  onToggleCollapse 
}) => {
  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Attendance', path: '/attendance', icon: Clock },
    { name: 'Leaves', path: '/leaves', icon: CalendarDays },
    { name: 'Team Directory', path: '/directory', icon: Users },
    { name: 'Announcements', path: '/announcements', icon: Megaphone },
    { name: 'My Profile', path: '/profile', icon: User }
  ];

  const sidebarWidthClass = isCollapsed ? 'w-20' : 'w-64';

  return (
    <>
      {/* Mobile Sidebar Backdrop */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:sticky top-0 md:top-16 bottom-0 left-0 z-40 h-full md:h-[calc(100vh-64px)] border-r transition-all duration-300 flex flex-col justify-between
          bg-white border-gray-200 text-gray-700
          dark:bg-slate-900 dark:border-slate-800 dark:text-slate-350
          ${sidebarWidthClass}
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Mobile Header with brand logo & close button */}
        <div className="flex md:hidden justify-between items-center px-4 py-4 border-b border-gray-150 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center text-white text-[11px] font-black font-mono">Co</span>
            <span className="font-extrabold text-sm text-gray-900 dark:text-white">CoPortal</span>
          </div>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-400 hover:text-gray-600 dark:hover:text-white rounded-lg transition-colors cursor-pointer"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Section */}
        <div className="flex-1 py-4 overflow-y-auto px-3 space-y-1">

          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-[1.01] group
                ${isActive 
                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' 
                  : 'hover:bg-gray-50 text-gray-600 hover:text-gray-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white'
                }
              `}
            >
              <item.icon className={`w-5 h-5 shrink-0 transition-colors duration-200 
                ${isCollapsed ? 'mx-auto' : ''}
              `} />
              {!isCollapsed && (
                <span className="truncate transition-opacity duration-200">
                  {item.name}
                </span>
              )}
              {/* Tooltip for collapsed mode */}
              {isCollapsed && (
                <div className="absolute left-16 hidden group-hover:block bg-slate-900 text-white text-xs py-1 px-2 rounded shadow-lg whitespace-nowrap z-50">
                  {item.name}
                </div>
              )}
            </NavLink>
          ))}
        </div>

        {/* Footer Panel */}
        <div className="p-3 border-t border-gray-200 dark:border-slate-800 space-y-2">
          {/* Settings Placeholder */}
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-400 dark:text-slate-500 cursor-not-allowed">
            <Settings className="w-5 h-5 shrink-0" />
            {!isCollapsed && <span className="text-xs">System Settings</span>}
          </div>

          {/* Collapse Controller for Desktop */}
          <button
            onClick={onToggleCollapse}
            className="hidden md:flex w-full items-center justify-center p-2 rounded-lg border text-gray-500 hover:bg-gray-50 border-gray-200 dark:border-slate-800 dark:hover:bg-slate-850 dark:text-slate-400 cursor-pointer transition-colors"
            aria-label={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
      </aside>
    </>
  );
};
