import React, { useContext, useState, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import {
  User, Mail, Phone, Lock, Save, Camera, AlertCircle, CheckCircle,
  BookOpen, Target, X, Plus, Sparkles, Shield, Flame, Award
} from 'lucide-react';
import api from '../api';

const Profile = () => {
  const { user, setUser } = useContext(AuthContext);
  const [name, setName] = useState(user?.name || '');
  const [contactInfo, setContactInfo] = useState(user?.contactInfo || '');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Goals & Interests
  const [interests, setInterests] = useState(user?.interests || []);
  const [goals, setGoals] = useState(user?.goals || []);
  const [newInterest, setNewInterest] = useState('');
  const [newGoal, setNewGoal] = useState('');

  const fileInputRef = useRef(null);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      const payload = { name, contactInfo, interests, goals };
      if (password) payload.password = password;

      const { data } = await api.put('/user/profile', payload);
      setUser(data);
      setMessage({ text: 'Profile updated successfully!', type: 'success' });
      setPassword('');
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Failed to update profile.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setMessage({ text: '', type: '' });
    const formData = new FormData();
    formData.append('image', file);

    try {
      const { data } = await api.put('/user/profile-pic', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setUser({ ...user, profilePic: data.profilePic });
      setMessage({ text: 'Profile picture updated!', type: 'success' });
    } catch (err) {
      setMessage({ text: 'Failed to upload profile picture.', type: 'error' });
    } finally {
      setUploading(false);
    }
  };

  const addInterest = () => {
    const trimmed = newInterest.trim();
    if (trimmed && !interests.includes(trimmed)) {
      setInterests([...interests, trimmed]);
    }
    setNewInterest('');
  };

  const removeInterest = (index) => {
    setInterests(interests.filter((_, i) => i !== index));
  };

  const addGoal = () => {
    const trimmed = newGoal.trim();
    if (trimmed && !goals.includes(trimmed)) {
      setGoals([...goals, trimmed]);
    }
    setNewGoal('');
  };

  const removeGoal = (index) => {
    setGoals(goals.filter((_, i) => i !== index));
  };

  const handleInterestKeyDown = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); addInterest(); }
  };

  const handleGoalKeyDown = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); addGoal(); }
  };

  if (!user) return null;

  const avatarLetter = user.name ? user.name.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase() || 'U';

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Gradient Banner */}
      <div className="relative h-48 sm:h-56 bg-gradient-to-r from-indigo-50/80 via-transparent to-blue-50/80 overflow-hidden border-b border-slate-100">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%236366f1' fill-opacity='1'%3E%3Cpath d='M36 34h-2v-4h-4v-2h4v-4h2v4h4v2h-4v4zm0-30h-2V0h-4V-2h4V-6h2v4h4v2h-4v4z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
        <div className="absolute bottom-6 left-0 right-0 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 flex items-end justify-between">
          <div className="flex items-end gap-5">
            {/* Avatar */}
            <div className="relative group">
              <div className={`h-28 w-28 sm:h-32 sm:w-32 rounded-2xl overflow-hidden border-4 border-white shadow-xl flex items-center justify-center bg-gradient-to-br from-indigo-500 to-indigo-700 text-white font-black text-4xl ${uploading ? 'opacity-60' : ''}`}>
                {user.profilePic ? (
                  <img src={user.profilePic} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  avatarLetter
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="absolute -bottom-1 -right-1 h-9 w-9 bg-white rounded-xl flex items-center justify-center text-indigo-600 border-2 border-indigo-100 hover:bg-indigo-50 transition-all shadow-lg disabled:opacity-50 cursor-pointer"
              >
                <Camera className="h-4 w-4" />
              </button>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
            </div>
            <div className="pb-2 hidden sm:block">
              <h1 className="text-2xl font-black text-slate-900">{user.name}</h1>
              <p className="text-slate-600 text-sm z-10">{user.email}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4 pb-12">

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-8">
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm text-center hover:shadow-md transition-shadow">
            <div className="mx-auto w-10 h-10 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center mb-2">
              <Flame className="h-5 w-5 text-amber-500" />
            </div>
            <p className="text-2xl font-black text-slate-900">{user.streak || 0}</p>
            <p className="text-xs font-medium text-slate-500">Day Streak</p>
          </div>
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm text-center hover:shadow-md transition-shadow">
            <div className="mx-auto w-10 h-10 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center mb-2">
              <BookOpen className="h-5 w-5 text-blue-500" />
            </div>
            <p className="text-2xl font-black text-slate-900">{interests.length}</p>
            <p className="text-xs font-medium text-slate-500">Interests</p>
          </div>
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm text-center hover:shadow-md transition-shadow">
            <div className="mx-auto w-10 h-10 rounded-xl bg-gradient-to-br from-purple-50 to-fuchsia-50 flex items-center justify-center mb-2">
              <Target className="h-5 w-5 text-purple-500" />
            </div>
            <p className="text-2xl font-black text-slate-900">{goals.length}</p>
            <p className="text-xs font-medium text-slate-500">Goals</p>
          </div>
        </div>

        {/* Status Message */}
        {message.text && (
          <div className={`mb-6 rounded-2xl p-4 flex items-start shadow-sm ${
            message.type === 'error'
              ? 'bg-red-50 border border-red-100 text-red-700'
              : 'bg-emerald-50 border border-emerald-100 text-emerald-700'
          }`}>
            {message.type === 'error'
              ? <AlertCircle className="h-5 w-5 mt-0.5 mr-3 flex-shrink-0" />
              : <CheckCircle className="h-5 w-5 mt-0.5 mr-3 flex-shrink-0" />
            }
            <p className="text-sm font-medium">{message.text}</p>
          </div>
        )}

        <form onSubmit={handleUpdateProfile}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Left Column — Profile Info */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
              <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center">
                <User className="h-5 w-5 mr-2 text-indigo-500" />
                Profile Information
              </h2>

              <div className="space-y-5">
                <div>
                  <label htmlFor="profile-name" className="block text-sm font-semibold text-slate-700 mb-2">Full Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <User className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      id="profile-name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="block w-full pl-10 pr-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="profile-email" className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Mail className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      id="profile-email"
                      type="email"
                      value={user.email}
                      disabled
                      className="block w-full pl-10 pr-4 py-3 text-sm bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed"
                    />
                  </div>
                  <p className="text-xs text-slate-400 mt-1.5">Email cannot be changed</p>
                </div>

                <div>
                  <label htmlFor="profile-contact" className="block text-sm font-semibold text-slate-700 mb-2">
                    <span className="flex items-center gap-1.5">
                      Contact Info
                      <span className="text-xs font-normal text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Shield className="h-3 w-3" /> Visible only to connections
                      </span>
                    </span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Phone className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      id="profile-contact"
                      type="text"
                      value={contactInfo}
                      onChange={(e) => setContactInfo(e.target.value)}
                      className="block w-full pl-10 pr-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                      placeholder="e.g. +91 98765 43210"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="pt-4 border-t border-slate-100">
                  <label htmlFor="profile-password" className="block text-sm font-semibold text-slate-700 mb-2">
                    Change Password
                    <span className="text-xs font-normal text-slate-400 ml-2">Leave blank to keep current</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      id="profile-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      minLength={6}
                      className="block w-full pl-10 pr-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                      placeholder="Enter new password"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column — Interests & Goals */}
            <div className="space-y-6">

              {/* Interests Section */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
                <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                  <BookOpen className="h-5 w-5 mr-2 text-blue-500" />
                  Learning Interests
                </h2>
                <p className="text-sm text-slate-500 mb-4">Add topics you're interested in learning about</p>

                {/* Add Interest Input */}
                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    value={newInterest}
                    onChange={(e) => setNewInterest(e.target.value)}
                    onKeyDown={handleInterestKeyDown}
                    placeholder="e.g. Python, Machine Learning"
                    className="flex-1 px-4 py-2.5 text-sm bg-blue-50/50 border border-blue-100 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all placeholder-slate-400"
                  />
                  <button
                    type="button"
                    onClick={addInterest}
                    disabled={!newInterest.trim()}
                    className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 shadow-sm"
                  >
                    <Plus className="h-4 w-4" /> Add
                  </button>
                </div>

                {/* Interest Tags */}
                <div className="flex flex-wrap gap-2 min-h-[44px]">
                  {interests.length === 0 && (
                    <p className="text-sm text-slate-400 italic py-2">No interests added yet. Start typing above!</p>
                  )}
                  {interests.map((interest, i) => (
                    <span
                      key={i}
                      className="group inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium rounded-xl bg-blue-50 text-blue-700 border border-blue-100 hover:bg-blue-100 transition-colors"
                    >
                      {interest}
                      <button
                        type="button"
                        onClick={() => removeInterest(i)}
                        className="h-4 w-4 rounded-full flex items-center justify-center hover:bg-blue-200 text-blue-500 hover:text-blue-700 transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Goals Section */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
                <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                  <Target className="h-5 w-5 mr-2 text-purple-500" />
                  Learning Goals
                </h2>
                <p className="text-sm text-slate-500 mb-4">What do you want to achieve in your learning journey?</p>

                {/* Add Goal Input */}
                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    value={newGoal}
                    onChange={(e) => setNewGoal(e.target.value)}
                    onKeyDown={handleGoalKeyDown}
                    placeholder="e.g. Build a full-stack app, Learn AI"
                    className="flex-1 px-4 py-2.5 text-sm bg-purple-50/50 border border-purple-100 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all placeholder-slate-400"
                  />
                  <button
                    type="button"
                    onClick={addGoal}
                    disabled={!newGoal.trim()}
                    className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 shadow-sm"
                  >
                    <Plus className="h-4 w-4" /> Add
                  </button>
                </div>

                {/* Goal Tags */}
                <div className="flex flex-wrap gap-2 min-h-[44px]">
                  {goals.length === 0 && (
                    <p className="text-sm text-slate-400 italic py-2">No goals added yet. What are you working towards?</p>
                  )}
                  {goals.map((goal, i) => (
                    <span
                      key={i}
                      className="group inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium rounded-xl bg-purple-50 text-purple-700 border border-purple-100 hover:bg-purple-100 transition-colors"
                    >
                      {goal}
                      <button
                        type="button"
                        onClick={() => removeGoal(i)}
                        className="h-4 w-4 rounded-full flex items-center justify-center hover:bg-purple-200 text-purple-500 hover:text-purple-700 transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end mt-8">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center py-3 px-8 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-all hover:shadow-xl"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </span>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save All Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
