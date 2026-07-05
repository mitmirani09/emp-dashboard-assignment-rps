import React, { useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  ArrowLeft, 
  Edit3, 
  Check, 
  X, 
  Hierarchy,
  Briefcase,
  Users,
  Copy,
  ChevronRight
} from 'lucide-react';
import { useEmployee } from '../context/EmployeeContext';
import { Employee } from '../types';
import { toast } from 'sonner';

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { employees, currentUser, updateProfile } = useEmployee();

  // Determine which profile to display (query param ?id=emp-x)
  const profileId = searchParams.get('id');
  const isOwnProfile = !profileId || profileId === currentUser.id;

  const targetEmployee = useMemo(() => {
    if (isOwnProfile) return currentUser;
    return employees.find(emp => emp.id === profileId) || currentUser;
  }, [employees, currentUser, profileId, isOwnProfile]);

  // Edit Mode States
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(targetEmployee.name);
  const [editBio, setEditBio] = useState(targetEmployee.bio || '');
  const [editEmail, setEditEmail] = useState(targetEmployee.email);
  const [editPhone, setEditPhone] = useState(targetEmployee.phone);
  const [editLocation, setEditLocation] = useState(targetEmployee.location);
  const [editAvatar, setEditAvatar] = useState(targetEmployee.avatar || '');

  // Reset edit form if target changes
  React.useEffect(() => {
    setEditName(targetEmployee.name);
    setEditBio(targetEmployee.bio || '');
    setEditEmail(targetEmployee.email);
    setEditPhone(targetEmployee.phone);
    setEditLocation(targetEmployee.location);
    setEditAvatar(targetEmployee.avatar || '');
    setIsEditing(false);
  }, [targetEmployee]);

  // Copy contact details click helper
  const handleCopyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  // Profile Save
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) {
      toast.error('Name cannot be empty.');
      return;
    }
    if (!editEmail.trim() || !editEmail.includes('@')) {
      toast.error('Please enter a valid email.');
      return;
    }

    updateProfile({
      name: editName,
      bio: editBio,
      email: editEmail,
      phone: editPhone,
      location: editLocation,
      avatar: editAvatar
    });

    setIsEditing(false);
    toast.success('Profile details updated successfully!');
  };

  // Derive Org Chart relationships
  const manager = useMemo(() => {
    if (!targetEmployee.reportingTo) return null;
    return employees.find(emp => emp.name === targetEmployee.reportingTo) || null;
  }, [employees, targetEmployee]);

  const peers = useMemo(() => {
    if (!targetEmployee.reportingTo) return [];
    return employees.filter(
      emp => emp.reportingTo === targetEmployee.reportingTo && emp.id !== targetEmployee.id
    );
  }, [employees, targetEmployee]);

  const directReports = useMemo(() => {
    return employees.filter(emp => emp.reportingTo === targetEmployee.name);
  }, [employees, targetEmployee]);

  // Color code based on department
  const getDeptColor = (dept: string) => {
    const d = dept.toLowerCase();
    if (d === 'engineering') return 'bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400';
    if (d === 'design') return 'bg-purple-50 text-purple-600 dark:bg-purple-950/20 dark:text-purple-400';
    if (d === 'hr') return 'bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400';
    return 'bg-gray-50 text-gray-600 dark:bg-slate-800 dark:text-slate-400';
  };

  return (
    <div className="space-y-6 md:space-y-8">
      {/* 1. Header Navigation Bar */}
      <div className="flex items-center gap-3">
        {!isOwnProfile && (
          <button
            onClick={() => navigate(-1)}
            className="p-2 border rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 cursor-pointer transition-colors"
          >
            <ArrowLeft className="w-4.5 h-4.5" />
          </button>
        )}
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            {isOwnProfile ? 'My Profile' : `${targetEmployee.name.split(' ')[0]}'s Profile`}
          </h1>
          <p className="text-xs text-gray-500 dark:text-slate-400">
            {isOwnProfile ? 'Manage your own contact info, bio and avatar.' : 'View teammate profile details and organization chart.'}
          </p>
        </div>
      </div>

      {/* 2. Main Page Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (Profile card & Contact detail) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main profile presentation */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-150 dark:border-slate-700 shadow-sm overflow-hidden p-6 relative">
            
            {/* Action edit button (Only if own profile) */}
            {isOwnProfile && !isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="absolute top-6 right-6 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold hover:bg-gray-50 border-gray-205 text-gray-600 dark:border-slate-700 dark:hover:bg-slate-700 dark:text-slate-200 cursor-pointer transition-all"
              >
                <Edit3 className="w-3.5 h-3.5" />
                Edit Profile
              </button>
            )}

            {isEditing ? (
              // EDIT PROFILE MODE FORM
              <form onSubmit={handleSave} className="space-y-4">
                <div className="flex flex-col sm:flex-row items-center gap-4 border-b border-gray-100 dark:border-slate-700/50 pb-5">
                  <div className="w-20 h-20 rounded-full animate-pulse bg-gray-100 dark:bg-slate-700 flex items-center justify-center shrink-0 overflow-hidden">
                    {editAvatar ? (
                      <img src={editAvatar} alt="preview" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1 w-full space-y-2">
                    <label className="text-[10px] font-bold uppercase text-gray-400">Avatar Image URL</label>
                    <input
                      type="url"
                      value={editAvatar}
                      onChange={(e) => setEditAvatar(e.target.value)}
                      placeholder="https://images.unsplash.com/photo-..."
                      className="w-full h-9 px-3 rounded-lg border bg-gray-50 dark:bg-slate-850 text-xs focus:ring-2 focus:ring-blue-500 border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-gray-400">Display Name</label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full h-9 px-3 rounded-lg border bg-white dark:bg-slate-850 text-xs focus:ring-2 focus:ring-blue-500 border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-gray-400">Email Address</label>
                    <input
                      type="email"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      className="w-full h-9 px-3 rounded-lg border bg-white dark:bg-slate-850 text-xs focus:ring-2 focus:ring-blue-500 border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-gray-400">Phone Number</label>
                    <input
                      type="text"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      className="w-full h-9 px-3 rounded-lg border bg-white dark:bg-slate-850 text-xs focus:ring-2 focus:ring-blue-500 border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-gray-400">Office Location</label>
                    <input
                      type="text"
                      value={editLocation}
                      onChange={(e) => setEditLocation(e.target.value)}
                      className="w-full h-9 px-3 rounded-lg border bg-white dark:bg-slate-850 text-xs focus:ring-2 focus:ring-blue-500 border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-gray-400">Bio/About Me</label>
                  <textarea
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    rows={4}
                    placeholder="Describe yourself, your interests, tech stack, etc..."
                    className="w-full p-3 rounded-lg border bg-white dark:bg-slate-850 text-xs focus:ring-2 focus:ring-blue-500 border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white resize-none"
                  />
                </div>

                {/* Edit forms action triggers */}
                <div className="flex justify-end gap-3 text-xs pt-4 border-t border-gray-100 dark:border-slate-700/50">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      // Reset values
                      setEditName(targetEmployee.name);
                      setEditBio(targetEmployee.bio || '');
                      setEditEmail(targetEmployee.email);
                      setEditPhone(targetEmployee.phone);
                      setEditLocation(targetEmployee.location);
                      setEditAvatar(targetEmployee.avatar || '');
                    }}
                    className="px-4 py-2 rounded-lg border hover:bg-gray-50 border-gray-200 dark:border-slate-750 dark:hover:bg-slate-700 text-gray-600 dark:text-slate-300 font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center gap-1 cursor-pointer shadow-lg shadow-blue-500/10"
                  >
                    <Check className="w-4 h-4" />
                    Save Changes
                  </button>
                </div>
              </form>
            ) : (
              // VIEWING PROFILE MODE DETAILS
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row items-center gap-5 border-b border-gray-100 dark:border-slate-700/50 pb-5">
                  <img
                    src={targetEmployee.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=128&h=128&fit=crop&q=80'}
                    alt={targetEmployee.name}
                    className="w-20 h-20 rounded-full object-cover border-2 border-gray-100 dark:border-slate-700 shrink-0"
                  />
                  <div className="text-center sm:text-left space-y-1">
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white leading-tight">
                      {targetEmployee.name}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-slate-400 font-medium">
                      {targetEmployee.role}
                    </p>
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1.5">
                      <span className={`text-[9px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full
                        ${getDeptColor(targetEmployee.department)}`}>
                        {targetEmployee.department}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/10">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                        Active
                      </span>
                    </div>
                  </div>
                </div>

                {/* About Bio Section */}
                <div className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">About</h3>
                  <p className="text-xs text-gray-650 dark:text-slate-350 leading-relaxed">
                    {targetEmployee.bio || 'This employee hasn\'t added a biography yet. Edit your profile to create one!'}
                  </p>
                </div>

                {/* Contact and Metadata stats grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-gray-100 dark:border-slate-700/50 pt-5">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50/50 dark:bg-slate-850 border border-gray-100/50 dark:border-slate-750/30">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Mail className="w-4 h-4 text-blue-500 shrink-0" />
                        <div className="min-w-0">
                          <span className="block text-[10px] text-gray-400 font-semibold uppercase">Email</span>
                          <span className="text-xs font-semibold text-gray-700 dark:text-slate-300 truncate block font-mono">
                            {targetEmployee.email}
                          </span>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleCopyText(targetEmployee.email, 'Email')}
                        className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-white cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50/50 dark:bg-slate-850 border border-gray-100/50 dark:border-slate-750/30">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Phone className="w-4 h-4 text-emerald-500 shrink-0" />
                        <div className="min-w-0">
                          <span className="block text-[10px] text-gray-400 font-semibold uppercase">Phone</span>
                          <span className="text-xs font-semibold text-gray-700 dark:text-slate-300 truncate block font-mono">
                            {targetEmployee.phone}
                          </span>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleCopyText(targetEmployee.phone, 'Phone')}
                        className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-white cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-2.5 p-3 rounded-xl bg-gray-50/50 dark:bg-slate-850 border border-gray-100/50 dark:border-slate-750/30">
                      <MapPin className="w-4.5 h-4.5 text-purple-500 shrink-0" />
                      <div>
                        <span className="block text-[10px] text-gray-400 font-semibold uppercase">Office Location</span>
                        <span className="text-xs font-semibold text-gray-700 dark:text-slate-300">
                          {targetEmployee.location}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 p-3 rounded-xl bg-gray-50/50 dark:bg-slate-850 border border-gray-100/50 dark:border-slate-750/30">
                      <Calendar className="w-4.5 h-4.5 text-indigo-500 shrink-0" />
                      <div>
                        <span className="block text-[10px] text-gray-400 font-semibold uppercase">Joined Date</span>
                        <span className="text-xs font-semibold text-gray-700 dark:text-slate-300 font-mono">
                          {targetEmployee.joinDate}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Right Column (Organization Chart / reporting info) */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-150 dark:border-slate-700 shadow-sm p-6 space-y-6">
            <div>
              <h3 className="font-bold text-base text-gray-900 dark:text-white">Organization Hierarchy</h3>
              <p className="text-xs text-gray-400">Reporting line for {targetEmployee.name.split(' ')[0]}</p>
            </div>

            {/* Manager Card */}
            {manager ? (
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Manager</span>
                <div 
                  onClick={() => navigate(`/profile?id=${manager.id}`)}
                  className="flex items-center justify-between p-3 rounded-xl border border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-850 cursor-pointer transition-colors group"
                >
                  <div className="flex items-center gap-2.5">
                    <img 
                      src={manager.avatar} 
                      alt={manager.name} 
                      className="w-10 h-10 rounded-full object-cover shrink-0"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {manager.name}
                      </h4>
                      <p className="text-[10px] text-gray-450 dark:text-slate-450">{manager.role}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-50" />
                </div>
              </div>
            ) : (
              <div className="p-3 bg-gray-50 dark:bg-slate-850 rounded-xl border border-dashed border-gray-200 dark:border-slate-700 text-center text-xs text-gray-400">
                No direct manager listed (CEO/Executive level).
              </div>
            )}

            {/* Peers / Team list */}
            {peers.length > 0 && (
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Team Peers ({peers.length})</span>
                <div className="max-h-52 overflow-y-auto divide-y divide-gray-100 dark:divide-slate-700 pr-1">
                  {peers.map(peer => (
                    <div 
                      key={peer.id}
                      onClick={() => navigate(`/profile?id=${peer.id}`)}
                      className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0 hover:bg-gray-50/50 dark:hover:bg-slate-850/50 cursor-pointer group"
                    >
                      <div className="flex items-center gap-2.5">
                        <img 
                          src={peer.avatar} 
                          alt={peer.name} 
                          className="w-8 h-8 rounded-full object-cover shrink-0"
                        />
                        <div>
                          <h4 className="text-xs font-semibold text-gray-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {peer.name}
                          </h4>
                          <p className="text-[9px] text-gray-400 dark:text-slate-500">{peer.role}</p>
                        </div>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 opacity-40" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Direct Reports */}
            {directReports.length > 0 && (
              <div className="space-y-2 border-t border-gray-100 dark:border-slate-700/50 pt-4">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Direct Reports ({directReports.length})</span>
                <div className="max-h-44 overflow-y-auto divide-y divide-gray-100 dark:divide-slate-700 pr-1">
                  {directReports.map(report => (
                    <div 
                      key={report.id}
                      onClick={() => navigate(`/profile?id=${report.id}`)}
                      className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0 hover:bg-gray-50/50 dark:hover:bg-slate-850/50 cursor-pointer group"
                    >
                      <div className="flex items-center gap-2.5">
                        <img 
                          src={report.avatar} 
                          alt={report.name} 
                          className="w-8 h-8 rounded-full object-cover shrink-0"
                        />
                        <div>
                          <h4 className="text-xs font-semibold text-gray-850 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {report.name}
                          </h4>
                          <p className="text-[9px] text-gray-400 dark:text-slate-500">{report.role}</p>
                        </div>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 opacity-40" />
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
};
