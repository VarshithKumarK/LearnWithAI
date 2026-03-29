import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { AuthContext } from '../context/AuthContext';
import {
  User, ArrowLeft, Flame, BookOpen, Target, Clock,
  UserPlus, Users, Sparkles, Loader2, Calendar, Phone,
  Mail, Shield, Lock, Zap
} from 'lucide-react';

const UserProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useContext(AuthContext);

  const [profileUser, setProfileUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(null);

  useEffect(() => {
    fetchUserProfile();
    checkConnection();
  }, [id]);

  const fetchUserProfile = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/user/${id}`);
      setProfileUser(res.data);
      setConnected(res.data.isConnected || false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load profile');
    }
    setLoading(false);
  };

  const checkConnection = async () => {
    try {
      const res = await api.get('/connections');
      const conn = res.data.find(
        conn =>
          (conn.userId?._id === id || conn.targetUserId?._id === id) ||
          (conn.userId === id || conn.targetUserId === id)
      );
      if (conn) {
        setConnectionStatus(conn.status);
        setConnected(conn.status === 'accepted');
      }
    } catch (err) {
      // ignore
    }
  };

  const handleConnect = async () => {
    setConnecting(true);
    try {
      const sharedTopic = profileUser?.interests?.[0] || profileUser?.goals?.[0] || 'Learning Together';
      await api.post('/connections', {
        targetUserId: id,
        topic: sharedTopic,
      });
      setConnectionStatus('pending');
    } catch (err) {
      console.error('Connect failed:', err?.response?.data?.message);
    }
    setConnecting(false);
  };

  const getMutualInterests = () => {
    if (!currentUser || !profileUser) return [];
    const mine = [...(currentUser.interests || []), ...(currentUser.goals || [])].map(i => i.toLowerCase());
    const theirs = [...(profileUser.interests || []), ...(profileUser.goals || [])].map(i => i.toLowerCase());
    return theirs.filter(i => mine.includes(i));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-10 w-10 text-indigo-500 animate-spin mb-4" />
        <p className="text-slate-500 font-medium">Loading profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-8 text-center">
        <div className="bg-red-50 border border-red-200 rounded-3xl p-10">
          <User className="h-12 w-12 text-red-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-red-700 mb-2">Profile not found</h2>
          <p className="text-red-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/social')}
            className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-colors"
          >
            Back to Social
          </button>
        </div>
      </div>
    );
  }

  const mutual = getMutualInterests();
  const isOwnProfile = currentUser?._id === id;

  const lastActiveLabel = profileUser.lastActive
    ? new Date(profileUser.lastActive).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Unknown';

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 lg:p-8">

      {/* Back button */}
      <button
        onClick={() => navigate('/social')}
        className="flex items-center text-sm font-semibold text-slate-500 hover:text-slate-900 mb-6 transition-colors group"
      >
        <ArrowLeft className="h-4 w-4 mr-1.5 group-hover:-translate-x-0.5 transition-transform" />
        Back to Social
      </button>

      {/* Profile Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-visible">

        {/* Banner */}
        <div className="h-40 sm:h-48 bg-gradient-to-r from-indigo-50/80 via-transparent to-blue-50/80 rounded-t-3xl relative border-b border-slate-100">
          <div className="absolute inset-0 rounded-t-3xl bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM2MzY2ZjEiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRoLTJ2LTRoLTR2LTJoNHYtNGgydjRoNHYyaC00djR6bTAtMzBoLTJ2LTRoLTR2LTJoNHYtNGgydjRoNHYyaC00djR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />
        </div>

        {/* Content area */}
        <div className="px-6 sm:px-8 pb-8 -mt-16 relative z-10">

          {/* Avatar + Name + Action Row */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-6">
            <div className="flex items-end gap-4">
              {/* Avatar */}
              {profileUser.profilePic ? (
                <img
                  src={profileUser.profilePic}
                  alt={profileUser.name}
                  className="h-28 w-28 rounded-2xl object-cover border-4 border-white shadow-xl flex-shrink-0"
                />
              ) : (
                <div className="h-28 w-28 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white font-black text-4xl border-4 border-white shadow-xl flex-shrink-0">
                  {profileUser.name?.charAt(0).toUpperCase() || '?'}
                </div>
              )}
              {/* Name + meta (below avatar on mobile, beside on desktop) */}
              <div className="pb-1 min-w-0">
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 truncate">{profileUser.name}</h1>
                <div className="flex items-center text-sm text-slate-500 mt-1">
                  <Calendar className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
                  <span>Active {lastActiveLabel}</span>
                </div>
              </div>
            </div>

            {/* Action button */}
            <div className="mt-4 sm:mt-0 flex-shrink-0">
              {isOwnProfile ? (
                <button
                  onClick={() => navigate('/profile')}
                  className="px-5 py-2.5 text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  Edit Profile
                </button>
              ) : connected ? (
                <span className="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <Users className="h-4 w-4" /> Connected
                </span>
              ) : connectionStatus === 'pending' ? (
                <span className="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded-xl">
                  <Clock className="h-4 w-4" /> Request Pending
                </span>
              ) : (
                <button
                  onClick={handleConnect}
                  disabled={connecting}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-sm hover:shadow-md disabled:opacity-60"
                >
                  {connecting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <UserPlus className="h-4 w-4" />
                  )}
                  Connect
                </button>
              )}
            </div>
          </div>

          {/* Stats bar */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-8">
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-4 text-center border border-amber-100">
              <Flame className="h-6 w-6 text-amber-500 mx-auto mb-1" />
              <p className="text-2xl font-black text-slate-900">{profileUser.streak || 0}</p>
              <p className="text-xs font-medium text-slate-500">Day Streak</p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-4 text-center border border-blue-100">
              <BookOpen className="h-6 w-6 text-blue-500 mx-auto mb-1" />
              <p className="text-2xl font-black text-slate-900">{profileUser.interests?.length || 0}</p>
              <p className="text-xs font-medium text-slate-500">Interests</p>
            </div>
            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl p-4 text-center border border-indigo-100">
              <Target className="h-6 w-6 text-indigo-500 mx-auto mb-1" />
              <p className="text-2xl font-black text-slate-900">{profileUser.goals?.length || 0}</p>
              <p className="text-xs font-medium text-slate-500">Goals</p>
            </div>
          </div>

          {/* Contact Info — Only shown if not own profile */}
          {!isOwnProfile && (
            <div className="mb-6 p-5 rounded-2xl border border-slate-200 bg-slate-50/80">
              <h3 className="flex items-center text-sm font-bold text-slate-700 mb-3">
                <Phone className="h-4 w-4 mr-2 text-indigo-400" />
                Contact Information
              </h3>
              {connected && profileUser.contactInfo ? (
                <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-xl border border-slate-100">
                  <Zap className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                  <span className="text-sm text-slate-700 font-medium">{profileUser.contactInfo}</span>
                </div>
              ) : connected && !profileUser.contactInfo ? (
                <p className="text-sm text-slate-400 italic px-1">This user hasn't added contact information yet.</p>
              ) : (
                <div className="flex items-center gap-2 text-sm text-slate-400 bg-white px-4 py-2.5 rounded-xl border border-dashed border-slate-200">
                  <Lock className="h-4 w-4 flex-shrink-0" />
                  <span>Connect with this learner to view their contact info</span>
                </div>
              )}
            </div>
          )}

          {/* Interests section */}
          {profileUser.interests?.length > 0 && (
            <div className="mb-6">
              <h3 className="flex items-center text-sm font-bold text-slate-700 mb-3">
                <BookOpen className="h-4 w-4 mr-2 text-blue-500" />
                Learning Interests
              </h3>
              <div className="flex flex-wrap gap-2">
                {profileUser.interests.map((interest, i) => (
                  <span
                    key={i}
                    className="px-3.5 py-1.5 text-sm font-medium rounded-xl bg-blue-50 text-blue-700 border border-blue-100"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Goals section */}
          {profileUser.goals?.length > 0 && (
            <div className="mb-6">
              <h3 className="flex items-center text-sm font-bold text-slate-700 mb-3">
                <Target className="h-4 w-4 mr-2 text-indigo-500" />
                Learning Goals
              </h3>
              <div className="flex flex-wrap gap-2">
                {profileUser.goals.map((goal, i) => (
                  <span
                    key={i}
                    className="px-3.5 py-1.5 text-sm font-medium rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-100"
                  >
                    {goal}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Mutual interests */}
          {!isOwnProfile && mutual.length > 0 && (
            <div className="mt-6 pt-6 border-t border-slate-100">
              <h3 className="flex items-center text-sm font-bold text-emerald-700 mb-3">
                <Sparkles className="h-4 w-4 mr-2 text-emerald-500" />
                {mutual.length} Shared Interest{mutual.length !== 1 ? 's' : ''} with You
              </h3>
              <div className="flex flex-wrap gap-2">
                {mutual.map((m, i) => (
                  <span
                    key={i}
                    className="px-3.5 py-1.5 text-sm font-medium rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100"
                  >
                    {m}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Empty state */}
          {(!profileUser.interests || profileUser.interests.length === 0) &&
           (!profileUser.goals || profileUser.goals.length === 0) && (
            <div className="py-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <BookOpen className="h-10 w-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">This learner hasn't added any interests or goals yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
