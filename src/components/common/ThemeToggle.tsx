import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative p-2 rounded-lg border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        light:bg-gray-100 light:border-gray-200 light:text-gray-700 light:hover:bg-gray-200
        dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-700
        hover:scale-105 active:scale-95 cursor-pointer"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      <div className="relative w-5 h-5 overflow-hidden">
        {/* Sun Icon */}
        <span
          className={`absolute inset-0 transform transition-transform duration-300 flex items-center justify-center
            ${theme === 'dark' ? 'translate-y-8 rotate-45' : 'translate-y-0 rotate-0'}`}
        >
          <Sun className="w-5 h-5 text-amber-500" />
        </span>
        {/* Moon Icon */}
        <span
          className={`absolute inset-0 transform transition-transform duration-300 flex items-center justify-center
            ${theme === 'light' ? '-translate-y-8 -rotate-45' : 'translate-y-0 rotate-0'}`}
        >
          <Moon className="w-5 h-5 text-indigo-400" />
        </span>
      </div>
    </button>
  );
};
