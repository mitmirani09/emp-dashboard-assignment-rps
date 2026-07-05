import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HelpCircle, Home, ArrowLeft } from 'lucide-react';

export const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4 space-y-6">
      <div className="w-20 h-20 rounded-full bg-blue-50 dark:bg-slate-900 flex items-center justify-center text-blue-500 animate-bounce">
        <HelpCircle className="w-10 h-10" />
      </div>
      
      <div className="max-w-md space-y-2">
        <h1 className="text-4xl font-black text-gray-900 dark:text-white">404 - Page Not Found</h1>
        <p className="text-xs text-gray-500 dark:text-slate-450 leading-relaxed">
          The corporate portal page you are looking for doesn't exist, has been archived, or was moved. Double check the URL address path.
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-3 text-xs pt-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg border hover:bg-gray-50 border-gray-200 dark:border-slate-750 dark:hover:bg-slate-700 text-gray-650 dark:text-slate-200 font-semibold cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Go Back
        </button>
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold cursor-pointer shadow-lg shadow-blue-500/10"
        >
          <Home className="w-4 h-4" /> Back to Dashboard
        </button>
      </div>
    </div>
  );
};
