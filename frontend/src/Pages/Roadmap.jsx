import React, { useState, useEffect } from 'react';
import api from '../api';
import { Map, Loader2, Target, Clock, Zap } from 'lucide-react';

const Roadmap = () => {
  const [roadmaps, setRoadmaps] = useState([]);
  const [goal, setGoal] = useState('');
  const [skillLevel, setSkillLevel] = useState('Beginner');
  const [timeAvailability, setTimeAvailability] = useState('10 hours/week');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRoadmaps();
  }, []);

  const fetchRoadmaps = async () => {
    try {
      const res = await api.get('/roadmap');
      setRoadmaps(res.data);
    } catch (error) {
      console.error('Failed to fetch roadmaps');
    }
  };

  const generateRoadmap = async (e) => {
    e.preventDefault();
    setLoading(true);
    console.log('[FRONTEND] Sending generation request:', { goal, skillLevel, timeAvailability });
    try {
      const resp = await api.post('/roadmap', { goal, skillLevel, timeAvailability });
      console.log('[FRONTEND] Generation response received:', resp.data);
      setGoal('');
      fetchRoadmaps();
    } catch (error) {
      console.error('Failed to generate roadmap');
    }
    setLoading(false);
  };

  const handleUpdateRoadmap = async (roadmapId, roadmapGoal) => {
    const feedback = prompt('Provide feedback to adapt this roadmap (e.g. "too hard", "add more React basics"):');
    if (!feedback) return;
    setLoading(true);
    console.log(`[FRONTEND] Sending adapt request for ${roadmapId}:`, { roadmapGoal, skillLevel, feedback });
    try {
      const resp = await api.put(`/roadmap/${roadmapId}/progress`, {
        goal: roadmapGoal,
        level: skillLevel,
        feedback
      });
      console.log(`[FRONTEND] Adapt response received:`, resp.data);
      fetchRoadmaps();
    } catch (error) {
      console.error('Failed to update roadmap');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
      
      <div className="flex items-center space-x-3 mb-8 pb-4 border-b border-slate-200">
        <div className="p-3 bg-indigo-100 rounded-xl text-indigo-600">
          <Map className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Learning Roadmaps</h1>
          <p className="text-slate-500 text-sm mt-1">AI-generated paths tailored to your skills and time</p>
        </div>
      </div>
      
      <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200 mb-10 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -mr-20 -mt-20 z-0"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-purple-50 rounded-full blur-2xl -ml-10 -mb-10 z-0"></div>
        
        <div className="relative z-10">
          <h2 className="text-xl font-bold mb-6 text-slate-800 flex items-center">
            <Zap className="h-5 w-5 text-indigo-500 mr-2" />
            Generate New Path
          </h2>
          
          <form onSubmit={generateRoadmap} className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center">
                <Target className="h-4 w-4 mr-1 text-slate-400"/> What do you want to learn?
              </label>
              <input 
                type="text" 
                placeholder="e.g. Master ReactJS, Data Science Fundamentals" 
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                value={goal} onChange={(e) => setGoal(e.target.value)} required
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Skill Level</label>
              <select 
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" 
                value={skillLevel} onChange={(e) => setSkillLevel(e.target.value)}
              >
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
              </select>
            </div>
            
            <div>
              <button 
                disabled={loading} 
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-md hover:shadow-lg disabled:bg-indigo-400 disabled:shadow-none flex justify-center items-center h-[50px]"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Generate UI ✨'}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="space-y-8">
        {roadmaps.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-300">
            <Map className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900">No roadmaps yet</h3>
            <p className="text-slate-500 max-w-sm mx-auto mt-2">Generate your first AI learning path above to jumpstart your journey.</p>
          </div>
        ) : (
          roadmaps.map((map) => (
            <div key={map._id} className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200">
              <div className="mb-8 border-b border-slate-100 pb-4 flex justify-between items-center">
                <h3 className="text-2xl font-black text-indigo-900 tracking-tight capitalize">
                  {map.goal} Roadmap
                </h3>
                <button 
                  onClick={() => handleUpdateRoadmap(map._id, map.goal)}
                  className="bg-indigo-100 hover:bg-indigo-200 text-indigo-700 text-sm font-semibold py-2 px-4 rounded-lg transition-colors"
                  disabled={loading}
                >
                  Adapt with AI ✨
                </button>
              </div>
              
              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-1 before:bg-gradient-to-b before:from-indigo-100 before:via-indigo-300 before:to-transparent">
                {map.milestones.map((ms, idx) => (
                  <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full border-4 border-white bg-indigo-100 group-[.is-active]:bg-indigo-600 text-indigo-600 group-[.is-active]:text-white shadow-md shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 text-lg font-bold z-10 transition-colors">
                      {idx + 1}
                    </div>
                    
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group-[.is-active]:border-indigo-100 group-[.is-active]:ring-1 group-[.is-active]:ring-indigo-100">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                        <div className="font-bold text-lg text-slate-900">{ms.title || ms.topic}</div>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 self-start sm:self-auto">
                          Module {idx + 1}
                        </span>
                      </div>
                      <div className="text-slate-600 text-sm leading-relaxed">
                        {ms.description}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Roadmap;
