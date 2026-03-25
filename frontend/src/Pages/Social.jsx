import React, { useState, useEffect } from 'react';
import api from '../api';
import { Users, UserPlus, Send, Activity, MessageSquare } from 'lucide-react';

const Social = () => {
  const [connections, setConnections] = useState([]);
  const [targetUserId, setTargetUserId] = useState('');
  const [topic, setTopic] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

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

  const sendRequest = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      await api.post('/connections', { targetUserId, topic });
      setMessage('Connection request sent successfully!');
      setTargetUserId('');
      setTopic('');
      fetchConnections();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to send request');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
      
      <div className="flex items-center space-x-3 mb-8 pb-4 border-b border-slate-200">
        <div className="p-3 bg-rose-100 rounded-xl text-rose-600">
          <Users className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Social Learning</h1>
          <p className="text-slate-500 text-sm mt-1">Connect with peers studying similar topics</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Send Request Form */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center">
              <UserPlus className="h-5 w-5 text-rose-500 mr-2" />
              Add Connection
            </h2>
            
            {message && (
              <div className={`mb-6 p-4 rounded-xl text-sm ${message.includes('success') ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                {message}
              </div>
            )}
            
            <form onSubmit={sendRequest} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Target User ID</label>
                <input 
                  type="text" 
                  placeholder="Paste ID here"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-colors"
                  value={targetUserId} onChange={(e) => setTargetUserId(e.target.value)} required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Topic of Interest</label>
                <input 
                  type="text" 
                  placeholder="e.g. Python, Machine Learning"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-colors"
                  value={topic} onChange={(e) => setTopic(e.target.value)} required
                />
              </div>
              <button 
                disabled={loading || !targetUserId || !topic} 
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-md hover:shadow-lg disabled:bg-slate-300 disabled:shadow-none flex justify-center items-center mt-6"
              >
                {loading ? 'Sending...' : <><Send className="mr-2 h-4 w-4" /> Send Request</>}
              </button>
            </form>
          </div>
        </div>

        {/* Connections List */}
        <div className="lg:col-span-2">
          <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200 h-full">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
              <Activity className="h-5 w-5 text-indigo-500 mr-2" />
              Your Network
            </h2>
            
            {connections.length === 0 ? (
              <div className="py-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 h-[300px] flex flex-col justify-center items-center">
                <Users className="h-12 w-12 text-slate-300 mb-4" />
                <h3 className="text-lg font-medium text-slate-900">No connections yet</h3>
                <p className="text-slate-500 max-w-sm mt-1">Send a request to a peer to start collaborating.</p>
              </div>
            ) : (
              <ul className="space-y-4">
                {connections.map((conn) => (
                  <li key={conn._id} className="p-5 border border-slate-200 rounded-2xl hover:border-slate-300 hover:shadow-md transition-all bg-white group">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start space-x-4">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center font-bold text-indigo-700 shrink-0">
                          {conn.topic.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-lg leading-tight">{conn.topic}</p>
                          <p className="text-sm text-slate-500 mt-0.5 font-mono bg-slate-100 px-2 py-0.5 rounded inline-block mt-1">
                            ID: {conn._id.substring(0, 8)}...
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto mt-2 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-0 border-slate-100">
                        <span className={`px-3 py-1 text-xs font-bold uppercase rounded-full ${
                          conn.status === 'accepted' ? 'bg-emerald-100 text-emerald-700' :
                          conn.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {conn.status}
                        </span>
                        <button className="text-slate-400 hover:text-indigo-600 transition-colors p-2 hover:bg-indigo-50 rounded-full">
                          <MessageSquare className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Social;
