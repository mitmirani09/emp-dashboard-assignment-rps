import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Grid, 
  List, 
  Mail, 
  Phone, 
  MapPin, 
  X, 
  Users, 
  Filter,
  RefreshCw
} from 'lucide-react';
import { useEmployee } from '../context/EmployeeContext';

export const DirectoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { employees } = useEmployee();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedLoc, setSelectedLoc] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isLoading, setIsLoading] = useState(true);

  // Simulate loading state on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  // Filter Categories Lists
  const departments = useMemo(() => {
    const depts = new Set(employees.map(emp => emp.department));
    return ['All', ...Array.from(depts)];
  }, [employees]);

  const locations = useMemo(() => {
    const locs = new Set(employees.map(emp => emp.location));
    return ['All', ...Array.from(locs)];
  }, [employees]);

  // Main Filter Logic
  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      const matchSearch = 
        emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.department.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchDept = selectedDept === 'All' || emp.department === selectedDept;
      const matchLoc = selectedLoc === 'All' || emp.location === selectedLoc;

      return matchSearch && matchDept && matchLoc;
    });
  }, [employees, searchQuery, selectedDept, selectedLoc]);

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedDept('All');
    setSelectedLoc('All');
  };

  // Color code based on department
  const getDeptColor = (dept: string) => {
    const d = dept.toLowerCase();
    if (d === 'engineering') return 'bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400';
    if (d === 'design') return 'bg-purple-50 text-purple-600 dark:bg-purple-950/20 dark:text-purple-400';
    if (d === 'hr') return 'bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-405';
    return 'bg-gray-50 text-gray-600 dark:bg-slate-800 dark:text-slate-400';
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            Team Directory
          </h1>
          <p className="text-sm text-gray-500 dark:text-slate-400">
            Search and filter coworker contacts and check office locations.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-slate-400 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 px-3.5 py-2 rounded-xl shadow-sm">
          <Users className="w-4 h-4 text-blue-500" />
          <span>{filteredEmployees.length} teammates showing</span>
        </div>
      </div>

      {/* 2. Search & Filters Panel */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-gray-100 dark:border-slate-700 space-y-4 shadow-sm">
        <div className="flex flex-col md:flex-row gap-3">
          
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search coworkers by name, role, email, or department..."
              className="w-full h-10 pl-9 pr-9 rounded-xl border bg-gray-50/50 dark:bg-slate-850 text-xs focus:ring-2 focus:ring-blue-500 border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-650 cursor-pointer"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            )}
          </div>

          {/* Department filter */}
          <div className="relative w-full md:w-44">
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full h-10 px-3 pr-8 rounded-xl border bg-gray-50/50 dark:bg-slate-850 text-xs focus:ring-2 focus:ring-blue-500 border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white appearance-none cursor-pointer"
            >
              <option value="All">All Departments</option>
              {departments.filter(d => d !== 'All').map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400">
              <Filter className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Location filter */}
          <div className="relative w-full md:w-44">
            <select
              value={selectedLoc}
              onChange={(e) => setSelectedLoc(e.target.value)}
              className="w-full h-10 px-3 pr-8 rounded-xl border bg-gray-50/50 dark:bg-slate-850 text-xs focus:ring-2 focus:ring-blue-500 border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white appearance-none cursor-pointer"
            >
              <option value="All">All Locations</option>
              {locations.filter(l => l !== 'All').map(l => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400">
              <MapPin className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* View Toggles (Desktop only) */}
          <div className="hidden sm:flex border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden p-0.5 shrink-0 bg-gray-55/20">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg cursor-pointer transition-colors ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-gray-700 dark:text-slate-400'}`}
              title="Grid View"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg cursor-pointer transition-colors ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-gray-700 dark:text-slate-400'}`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* Clear Filters indicator */}
        {(searchQuery || selectedDept !== 'All' || selectedLoc !== 'All') && (
          <div className="flex justify-between items-center bg-blue-50/30 dark:bg-blue-950/10 px-3 py-2 rounded-xl text-xs text-blue-700 dark:text-blue-450 border border-blue-100/30">
            <span>Filtering out results based on custom parameters</span>
            <button
              onClick={handleClearFilters}
              className="flex items-center gap-1 font-bold hover:underline cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" /> Clear filters
            </button>
          </div>
        )}
      </div>

      {/* 3. Grid / List View mapping with Skeletons */}
      {isLoading ? (
        // Loading State: Shimmer Skeletons
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6' : 'space-y-4'}>
          {Array.from({ length: 8 }).map((_, idx) => (
            <div 
              key={idx} 
              className={`bg-white dark:bg-slate-800 rounded-2xl border border-gray-150 dark:border-slate-700 p-5 overflow-hidden
                ${viewMode === 'grid' ? 'flex flex-col items-center text-center space-y-4' : 'flex items-center gap-4'}`}
            >
              {/* Avatar circle skeleton */}
              <div className="w-16 h-16 rounded-full animate-shimmer shrink-0" />
              
              <div className="flex-1 w-full space-y-2">
                {/* Name line */}
                <div className="h-4 w-1/2 mx-auto sm:mx-0 animate-shimmer rounded" />
                {/* Title line */}
                <div className="h-3 w-1/3 mx-auto sm:mx-0 animate-shimmer rounded" />
                {/* Dept badge line */}
                <div className="h-5 w-1/4 mx-auto sm:mx-0 animate-shimmer rounded-full" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredEmployees.length === 0 ? (
        // Empty State
        <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 text-center space-y-4 min-h-[350px]">
          <div className="w-16 h-16 rounded-full bg-gray-50 dark:bg-slate-900/50 flex items-center justify-center text-gray-400">
            <Search className="w-8 h-8" />
          </div>
          <div className="max-w-md">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white">No coworkers found</h3>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1 leading-relaxed">
              We couldn't find any team members matching "{searchQuery || selectedDept || selectedLoc}". Check for typos or reset your active filters.
            </p>
          </div>
          <button
            onClick={handleClearFilters}
            className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 active:scale-97 text-white rounded-xl transition-all shadow-md shadow-blue-500/10 cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        // Grid Layout View
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredEmployees.map((emp) => (
            <div
              key={emp.id}
              onClick={() => navigate(`/profile?id=${emp.id}`)}
              className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 p-5 rounded-2xl flex flex-col items-center text-center justify-between min-h-[280px] shadow-sm hover:shadow-md hover:scale-[1.01] hover:border-gray-200 dark:hover:border-slate-600 cursor-pointer transition-all group"
            >
              <div className="flex flex-col items-center">
                {/* Profile Pic */}
                <div className="relative">
                  <img
                    src={emp.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=128&h=128&fit=crop&q=80'}
                    alt={emp.name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-gray-100 dark:border-slate-700"
                  />
                  <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-800"></span>
                </div>

                {/* Info details */}
                <h3 className="font-extrabold text-sm text-gray-900 dark:text-white mt-4 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {emp.name}
                </h3>
                <p className="text-[11px] text-gray-400 dark:text-slate-450 mt-0.5">{emp.role}</p>
                
                <span className={`inline-block text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full mt-3
                  ${getDeptColor(emp.department)}`}>
                  {emp.department}
                </span>
              </div>

              {/* Action Contacts Footer */}
              <div className="w-full mt-6 pt-4 border-t border-gray-100 dark:border-slate-700/50 flex justify-center gap-4 text-gray-400 dark:text-slate-500 text-xs">
                <a 
                  href={`mailto:${emp.email}`} 
                  onClick={(e) => e.stopPropagation()}
                  className="p-2 hover:bg-blue-50 dark:hover:bg-blue-950/20 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg transition-colors"
                  title={emp.email}
                >
                  <Mail className="w-4.5 h-4.5" />
                </a>
                <a 
                  href={`tel:${emp.phone}`} 
                  onClick={(e) => e.stopPropagation()}
                  className="p-2 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-lg transition-colors"
                  title={emp.phone}
                >
                  <Phone className="w-4.5 h-4.5" />
                </a>
                <div className="p-2 flex items-center gap-1 text-[10px]" title={emp.location}>
                  <MapPin className="w-3.5 h-3.5 opacity-60" />
                  <span className="truncate max-w-[80px] text-gray-400">{emp.location.split(',')[0]}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // List Layout View
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden shadow-sm divide-y divide-gray-100 dark:divide-slate-700">
          {filteredEmployees.map((emp) => (
            <div
              key={emp.id}
              onClick={() => navigate(`/profile?id=${emp.id}`)}
              className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-gray-50/50 dark:hover:bg-slate-850/50 cursor-pointer transition-colors group"
            >
              <div className="flex items-center gap-3.5">
                <img
                  src={emp.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=128&h=128&fit=crop&q=80'}
                  alt={emp.name}
                  className="w-12 h-12 rounded-full object-cover shrink-0"
                />
                <div>
                  <h3 className="font-bold text-sm text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {emp.name}
                  </h3>
                  <p className="text-xs text-gray-400 dark:text-slate-450">{emp.role}</p>
                </div>
              </div>

              {/* Department, contact information, and location */}
              <div className="w-full sm:w-auto flex flex-wrap items-center gap-3 md:gap-6 text-xs text-gray-500 dark:text-slate-400">
                <span className={`text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full
                  ${getDeptColor(emp.department)}`}>
                  {emp.department}
                </span>
                
                <span className="font-mono">{emp.email}</span>
                <span className="font-mono text-gray-400">{emp.phone}</span>

                <div className="flex items-center gap-1 text-[11px] text-gray-400 shrink-0">
                  <MapPin className="w-3.5 h-3.5 opacity-60" />
                  <span>{emp.location}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
