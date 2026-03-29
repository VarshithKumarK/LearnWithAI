import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { AuthContext } from '../context/AuthContext';
import {
  Users, Search, UserPlus, Send, Activity, MessageSquare,
  Sparkles, ArrowRight, Flame, BookOpen, Target, Loader2,
  Check, X, UserCheck, Clock, Inbox, ArrowUpRight, Zap
} from 'lucide-react';

const Social = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Connections state
  const [connections, setConnections] = useState([]);

  // Connecting state (per-user connect buttons)
  const [connectingTo, setConnectingTo] = useState(null);

  // Accept/Reject loading
  const [actionLoading, setActionLoading] = useState(null);

  // Tab
  const [activeTab, setActiveTab] = useState('discover');

  useEffect(() => {
    fetchConnections();
  }, []);

  const fetchConnections = async () => {
    try {
      const res = await api.get('/connections');
      setConnections(res.data);
    } catch (error) {
      console.error('Failed to fetch connections');
    }
  };

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setHasSearched(false);
      return;
    }

    const timer = setTimeout(() => {
      performSearch(searchQuery);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const performSearch = async (query) => {
    if (!query.trim()) return;
    setSearchLoading(true);
    setHasSearched(true);
    try {
      const res = await api.get(`/user/search?query=${encodeURIComponent(query.trim())}`);
      setSearchResults(res.data);
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
    }
    setSearchLoading(false);
  };

  const handleConnect = async (targetId, sharedTopic) => {
    setConnectingTo(targetId);
    try {
      await api.post('/connections', {
        targetUserId: targetId,
        topic: sharedTopic || 'Learning Together',
      });
      fetchConnections();
    } catch (error) {
      console.error('Connection failed:', error?.response?.data?.message);
    }
    setConnectingTo(null);
  };

  const handleAccept = async (connectionId) => {
    setActionLoading(connectionId);
    try {
      await api.put(`/connections/${connectionId}/accept`);
      fetchConnections();
    } catch (error) {
      console.error('Accept failed:', error?.response?.data?.message);
    }
    setActionLoading(null);
  };

  const handleReject = async (connectionId) => {
    setActionLoading(connectionId);
    try {
      await api.put(`/connections/${connectionId}/reject`);
      fetchConnections();
    } catch (error) {
      console.error('Reject failed:', error?.response?.data?.message);
    }
    setActionLoading(null);
  };

  // Find mutual interests between current user and a result user
  const getMutualInterests = (resultUser) => {
    const myInterests = [...(user?.interests || []), ...(user?.goals || [])].map(i => i.toLowerCase());
    const theirInterests = [...(resultUser.interests || []), ...(resultUser.goals || [])].map(i => i.toLowerCase());
    return theirInterests.filter(i => myInterests.includes(i));
  };

  // Check if user is already connected
  const isConnected = (userId) => {
    return connections.some(
      conn =>
        (conn.userId?._id === userId || conn.targetUserId?._id === userId) ||
        (conn.userId === userId || conn.targetUserId === userId)
    );
  };

  // Categorize connections
  const incomingRequests = connections.filter(
    conn => conn.status === 'pending' && conn.targetUserId?._id === user?._id
  );
  const sentRequests = connections.filter(
    conn => conn.status === 'pending' && conn.userId?._id === user?._id
  );
  const activeConnections = connections.filter(conn => conn.status === 'accepted');

  // Helper to get the "other" user from a connection
  const getOtherUser = (conn) => {
    if (conn.userId?._id === user?._id) return conn.targetUserId;
    return conn.userId;
  };

  const totalPendingIncoming = incomingRequests.length;

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">

      {/* Header */}
      <div className="flex items-center space-x-3 mb-8 pb-4 border-b border-slate-200">
        <div className="p-3 bg-gradient-to-br from-rose-100 to-pink-100 rounded-xl text-rose-600">
          <Users className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Social Discovery</h1>
          <p className="text-slate-500 text-sm mt-1">Find and connect with learners who share your interests</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-slate-100 rounded-2xl p-1.5 mb-8 max-w-md">
        <button
          onClick={() => setActiveTab('discover')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
            activeTab === 'discover'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Search className="h-4 w-4" />
          Discover
        </button>
        <button
          onClick={() => setActiveTab('network')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
            activeTab === 'network'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Activity className="h-4 w-4" />
          Network
          {(activeConnections.length + totalPendingIncoming) > 0 && (
            <span className="bg-indigo-100 text-indigo-700 text-xs font-bold rounded-full px-2 py-0.5">
              {activeConnections.length}
              {totalPendingIncoming > 0 && (
                <span className="text-rose-600 ml-0.5">+{totalPendingIncoming}</span>
              )}
            </span>
          )}
        </button>
      </div>

      {/* ===== DISCOVER TAB ===== */}
      {activeTab === 'discover' && (
        <div className="space-y-8">

          {/* Search Bar */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              id="social-search-input"
              type="text"
              placeholder="Search by name, topic, or interest (e.g., Python, Machine Learning)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-13 pr-5 py-4 bg-white border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm text-base"
            />
            {searchLoading && (
              <div className="absolute inset-y-0 right-0 pr-5 flex items-center">
                <Loader2 className="h-5 w-5 text-indigo-500 animate-spin" />
              </div>
            )}
          </div>

          {/* Search Results */}
          {searchLoading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="h-8 w-8 text-indigo-500 animate-spin mb-3" />
              <p className="text-slate-500 font-medium">Searching learners...</p>
            </div>
          ) : hasSearched && searchResults.length === 0 ? (
            <div className="py-16 text-center bg-white rounded-3xl border border-dashed border-slate-300">
              <Users className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900">No learners found</h3>
              <p className="text-slate-500 max-w-sm mx-auto mt-2">
                Try a different search term like "React", "Data Science", or a learner's name.
              </p>
            </div>
          ) : searchResults.length > 0 ? (
            <div>
              <p className="text-sm font-medium text-slate-500 mb-4">
                Found <span className="text-indigo-600 font-bold">{searchResults.length}</span> learner{searchResults.length !== 1 ? 's' : ''}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {searchResults.map((person) => {
                  const mutual = getMutualInterests(person);
                  const connected = isConnected(person._id);

                  return (
                    <div
                      key={person._id}
                      className="bg-white rounded-3xl border border-slate-200 p-6 hover:shadow-lg hover:border-slate-300 transition-all duration-300 group"
                    >
                      {/* Top row: avatar + name */}
                      <div className="flex items-start justify-between mb-4">
                        <div
                          className="flex items-center space-x-3 cursor-pointer"
                          onClick={() => navigate(`/user/${person._id}`)}
                        >
                          {person.profilePic ? (
                            <img
                              src={person.profilePic}
                              alt={person.name}
                              className="h-12 w-12 rounded-full object-cover border-2 border-slate-100"
                            />
                          ) : (
                            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg shrink-0">
                              {person.name?.charAt(0).toUpperCase() || '?'}
                            </div>
                          )}
                          <div>
                            <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                              {person.name}
                            </h3>
                            {person.streak > 0 && (
                              <div className="flex items-center text-xs text-amber-600 mt-0.5">
                                <Flame className="h-3 w-3 mr-1" />
                                {person.streak} day streak
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Connect / Connected badge */}
                        {connected ? (
                          <span className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 rounded-full border border-emerald-200">
                            <Users className="h-3 w-3" /> Connected
                          </span>
                        ) : (
                          <button
                            onClick={() => handleConnect(person._id, mutual[0] || (person.interests?.[0]) || 'Learning')}
                            disabled={connectingTo === person._id}
                            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-sm hover:shadow-md disabled:opacity-60"
                          >
                            {connectingTo === person._id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <UserPlus className="h-3.5 w-3.5" />
                            )}
                            Connect
                          </button>
                        )}
                      </div>

                      {/* Interests */}
                      {person.interests?.length > 0 && (
                        <div className="mb-3">
                          <div className="flex items-center text-xs font-semibold text-slate-500 mb-1.5">
                            <BookOpen className="h-3 w-3 mr-1" /> Interests
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {person.interests.map((interest, i) => (
                              <span
                                key={i}
                                className="px-2.5 py-1 text-xs font-medium rounded-lg bg-blue-50 text-blue-700 border border-blue-100"
                              >
                                {interest}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Goals */}
                      {person.goals?.length > 0 && (
                        <div className="mb-3">
                          <div className="flex items-center text-xs font-semibold text-slate-500 mb-1.5">
                            <Target className="h-3 w-3 mr-1" /> Goals
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {person.goals.map((goal, i) => (
                              <span
                                key={i}
                                className="px-2.5 py-1 text-xs font-medium rounded-lg bg-purple-50 text-purple-700 border border-purple-100"
                              >
                                {goal}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Mutual interests */}
                      {mutual.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-slate-100">
                          <div className="flex items-center text-xs font-semibold text-emerald-600 mb-1.5">
                            <Sparkles className="h-3 w-3 mr-1" /> {mutual.length} Mutual Interest{mutual.length !== 1 ? 's' : ''}
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {mutual.map((m, i) => (
                              <span
                                key={i}
                                className="px-2.5 py-1 text-xs font-medium rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100"
                              >
                                {m}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* View profile link */}
                      <div className="mt-4 pt-3 border-t border-slate-100">
                        <button
                          onClick={() => navigate(`/user/${person._id}`)}
                          className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 flex items-center transition-colors"
                        >
                          View Profile
                          <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Empty state - no search yet */
            <div className="py-16 text-center bg-white rounded-3xl border border-dashed border-slate-200">
              <div className="mx-auto w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mb-4">
                <Search className="h-8 w-8 text-indigo-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Discover Learners</h3>
              <p className="text-slate-500 max-w-sm mx-auto mt-2">
                Search by name, topic, or interest to find learners on similar paths.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ===== NETWORK TAB ===== */}
      {activeTab === 'network' && (
        <div className="space-y-8">

          {/* Incoming Requests Section */}
          {incomingRequests.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-rose-100 rounded-lg">
                  <Inbox className="h-4 w-4 text-rose-600" />
                </div>
                <h2 className="text-lg font-bold text-slate-900">
                  Incoming Requests
                </h2>
                <span className="bg-rose-100 text-rose-700 text-xs font-bold rounded-full px-2.5 py-0.5">
                  {incomingRequests.length}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {incomingRequests.map((conn) => {
                  const otherUser = getOtherUser(conn);
                  if (!otherUser) return null;

                  return (
                    <div key={conn._id} className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md hover:border-rose-200 transition-all group">
                      <div className="flex items-start gap-3 mb-4">
                        {otherUser.profilePic ? (
                          <img src={otherUser.profilePic} alt={otherUser.name} className="h-12 w-12 rounded-xl object-cover border-2 border-slate-100 shrink-0" />
                        ) : (
                          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white font-bold text-lg shrink-0">
                            {otherUser.name?.charAt(0).toUpperCase() || '?'}
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <h3 className="font-bold text-slate-900 truncate">{otherUser.name || otherUser.email}</h3>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="px-2 py-0.5 text-xs font-medium rounded-md bg-amber-50 text-amber-700 border border-amber-100">
                              {conn.topic}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Interests preview */}
                      {otherUser.interests?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-4">
                          {otherUser.interests.slice(0, 3).map((interest, i) => (
                            <span key={i} className="px-2 py-0.5 text-xs font-medium rounded-md bg-blue-50 text-blue-600 border border-blue-50">
                              {interest}
                            </span>
                          ))}
                          {otherUser.interests.length > 3 && (
                            <span className="px-2 py-0.5 text-xs font-medium rounded-md bg-slate-50 text-slate-500">
                              +{otherUser.interests.length - 3}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Accept / Reject Buttons */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAccept(conn._id)}
                          disabled={actionLoading === conn._id}
                          className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-sm disabled:opacity-60"
                        >
                          {actionLoading === conn._id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Check className="h-4 w-4" />
                          )}
                          Accept
                        </button>
                        <button
                          onClick={() => handleReject(conn._id)}
                          disabled={actionLoading === conn._id}
                          className="flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all disabled:opacity-60"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Sent Requests */}
          {sentRequests.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <Clock className="h-4 w-4 text-amber-600" />
                </div>
                <h2 className="text-lg font-bold text-slate-900">
                  Sent Requests
                </h2>
                <span className="bg-amber-100 text-amber-700 text-xs font-bold rounded-full px-2.5 py-0.5">
                  {sentRequests.length}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {sentRequests.map((conn) => {
                  const otherUser = getOtherUser(conn);
                  if (!otherUser) return null;

                  return (
                    <div key={conn._id} className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md transition-all group opacity-80">
                      <div className="flex items-start gap-3">
                        {otherUser.profilePic ? (
                          <img src={otherUser.profilePic} alt={otherUser.name} className="h-11 w-11 rounded-xl object-cover border-2 border-slate-100 shrink-0" />
                        ) : (
                          <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold shrink-0">
                            {otherUser.name?.charAt(0).toUpperCase() || '?'}
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <h3 className="font-bold text-slate-900 truncate text-sm">{otherUser.name || otherUser.email}</h3>
                          <p className="text-xs text-slate-500 mt-0.5">{conn.topic}</p>
                        </div>
                        <span className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-amber-700 bg-amber-50 rounded-lg border border-amber-100 shrink-0">
                          <Clock className="h-3 w-3" /> Pending
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Active Connections */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <UserCheck className="h-4 w-4 text-emerald-600" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">
                Your Connections
              </h2>
              {activeConnections.length > 0 && (
                <span className="bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full px-2.5 py-0.5">
                  {activeConnections.length}
                </span>
              )}
            </div>

            {activeConnections.length === 0 ? (
              <div className="py-16 text-center bg-white rounded-3xl border border-dashed border-slate-200">
                <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center mb-4">
                  <Users className="h-8 w-8 text-emerald-300" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">No connections yet</h3>
                <p className="text-slate-500 max-w-sm mx-auto mt-2">
                  Search for peers in the Discover tab and send connection requests to start building your network.
                </p>
                <button
                  onClick={() => setActiveTab('discover')}
                  className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-all shadow-sm hover:shadow-md"
                >
                  <Search className="h-4 w-4" />
                  Discover Learners
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeConnections.map((conn) => {
                  const otherUser = getOtherUser(conn);
                  if (!otherUser) return null;

                  return (
                    <div
                      key={conn._id}
                      className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-lg hover:border-emerald-200 transition-all group cursor-pointer"
                      onClick={() => navigate(`/user/${otherUser._id}`)}
                    >
                      <div className="flex items-start gap-3 mb-3">
                        {otherUser.profilePic ? (
                          <img src={otherUser.profilePic} alt={otherUser.name} className="h-12 w-12 rounded-xl object-cover border-2 border-emerald-50 shrink-0" />
                        ) : (
                          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-lg shrink-0">
                            {otherUser.name?.charAt(0).toUpperCase() || '?'}
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <h3 className="font-bold text-slate-900 truncate group-hover:text-emerald-700 transition-colors">
                            {otherUser.name || otherUser.email}
                          </h3>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
                              <Zap className="h-3 w-3" /> Connected
                            </span>
                          </div>
                        </div>
                        <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          <ArrowUpRight className="h-4 w-4 text-slate-400" />
                        </div>
                      </div>

                      {/* Topic */}
                      <div className="mb-3">
                        <span className="px-2.5 py-1 text-xs font-medium rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100">
                          {conn.topic}
                        </span>
                      </div>

                      {/* Other user interests preview */}
                      {otherUser.interests?.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {otherUser.interests.slice(0, 3).map((interest, i) => (
                            <span key={i} className="px-2 py-0.5 text-xs font-medium rounded-md bg-slate-50 text-slate-600 border border-slate-100">
                              {interest}
                            </span>
                          ))}
                          {otherUser.interests.length > 3 && (
                            <span className="px-2 py-0.5 text-xs font-medium rounded-md bg-slate-50 text-slate-400">
                              +{otherUser.interests.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Show empty state if absolutely no connections of any kind */}
          {connections.length === 0 && (
            <div className="py-16 text-center bg-white rounded-3xl border border-dashed border-slate-200 -mt-8">
              <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center mb-4">
                <Sparkles className="h-8 w-8 text-indigo-300" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Your network is empty</h3>
              <p className="text-slate-500 max-w-sm mx-auto mt-2">
                Start by discovering learners with shared interests and send them a connection request.
              </p>
              <button
                onClick={() => setActiveTab('discover')}
                className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-all shadow-sm hover:shadow-md"
              >
                <Search className="h-4 w-4" />
                Start Discovering
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Social;
