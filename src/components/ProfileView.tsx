import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import {
  User as UserIcon,
  Mail,
  GraduationCap,
  Phone,
  ShieldCheck,
  LogOut,
  FolderHeart,
  Sparkles,
  CheckCircle2,
  Bell,
} from 'lucide-react';

interface ProfileViewProps {
  onNavigate: (view: string) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ onNavigate }) => {
  const { currentUser, items, claims, logoutUser } = useApp();

  const [department, setDepartment] = useState(currentUser?.department || 'Computer Science');
  const [phone, setPhone] = useState(currentUser?.phone || '(555) 321-7890');
  const [saved, setSaved] = useState(false);

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center space-y-4">
        <UserIcon className="w-12 h-12 text-slate-300 mx-auto" />
        <h2 className="text-xl font-bold text-slate-800">Not Signed In</h2>
        <p className="text-xs text-slate-500">Please sign in to view your campus profile.</p>
        <button
          onClick={() => onNavigate('landing')}
          className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold"
        >
          Return Home
        </button>
      </div>
    );
  }

  const userItems = items.filter(i => i.ownerId === currentUser.uid);
  const resolvedItems = userItems.filter(i => i.status === 'returned');
  const activeClaims = claims.filter(
    c => c.claimantId === currentUser.uid || c.reporterId === currentUser.uid
  );

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Profile Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-700 to-indigo-500 text-white font-bold text-2xl flex items-center justify-center shadow-md shadow-indigo-200">
            {currentUser.displayName.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                {currentUser.displayName}
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase">
                Campus Verified
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{currentUser.email}</p>
            {currentUser.campusId && (
              <p className="text-[11px] text-indigo-600 font-mono mt-1 font-semibold">
                Student ID: {currentUser.campusId}
              </p>
            )}
          </div>
        </div>

        <button
          onClick={logoutUser}
          className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5 text-slate-500" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
            Reports Authored
          </span>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">{userItems.length}</div>
          <p className="text-[11px] text-slate-500 mt-0.5">Active & historical campus listings</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
            Reunited Items
          </span>
          <div className="text-2xl font-extrabold text-emerald-600 mt-1">
            {resolvedItems.length}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">Successfully returned to owner</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
            Active Claims
          </span>
          <div className="text-2xl font-extrabold text-indigo-600 mt-1">
            {activeClaims.length}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">Claims filed & received</p>
        </div>
      </div>

      {/* Edit Profile Details */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div>
          <h3 className="text-base font-bold text-slate-900">Student Profile & Settings</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Your contact information is only shared after an ownership claim is explicitly accepted.
          </p>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                disabled
                value={currentUser.displayName}
                className="w-full px-3 py-2 text-xs bg-slate-100 border border-slate-200 rounded-xl text-slate-600 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Campus Email</label>
              <input
                type="email"
                disabled
                value={currentUser.email}
                className="w-full px-3 py-2 text-xs bg-slate-100 border border-slate-200 rounded-xl text-slate-600 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Department / Major
              </label>
              <input
                type="text"
                value={department}
                onChange={e => setDepartment(e.target.value)}
                placeholder="e.g. Computer Science, Mechanical Eng"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Contact Phone (Optional)
              </label>
              <input
                type="text"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="e.g. (555) 321-7890"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between">
            {saved ? (
              <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Profile changes saved
              </span>
            ) : (
              <span></span>
            )}

            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-2xs transition-colors"
            >
              Save Profile Preferences
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
