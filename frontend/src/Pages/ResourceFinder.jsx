import React, { useState } from 'react';
import api from '../api';
import { BookOpen, Search, Star, ExternalLink, Loader2 } from 'lucide-react';

const ResourceFinder = () => {
  const [topic, setTopic] = useState('');
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const fetchResources = async (e) => {
    e.preventDefault();
    setLoading(true);
    setHasSearched(true);
    console.log('[FRONTEND] Sending fetch resources request:', { topic });
    try {
      const res = await api.post(`/resources/recommend`, {
        topic,
        history: ['react basics', 'js frontend'], // In a real app this would come from user profile
      });
      console.log('[FRONTEND] Resource response received:', res.data);
      setResources(res.data.resources || []);
    } catch (error) {
      console.error('Failed to fetch resources');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
      
      <div className="flex items-center space-x-3 mb-8 pb-4 border-b border-slate-200">
        <div className="p-3 bg-amber-100 rounded-xl text-amber-600">
          <BookOpen className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Resource Finder</h1>
          <p className="text-slate-500 text-sm mt-1">Smart recommendations based on your learning history</p>
        </div>
      </div>
      
      <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200 mb-10">
        <form onSubmit={fetchResources} className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input 
              type="text" 
              placeholder="What do you want to learn about? (e.g. Advanced TypeScript)" 
              className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-11 pr-4 py-4 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors text-lg"
              value={topic} onChange={(e) => setTopic(e.target.value)} required
            />
          </div>
          <button 
            disabled={loading || !topic} 
            className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-4 px-8 rounded-xl transition-all shadow-md hover:shadow-lg disabled:bg-amber-300 disabled:shadow-none flex items-center justify-center min-w-[160px]"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Find Resources'}
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {resources.map((res, idx) => (
          <div key={idx} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full group">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-amber-100 group-hover:text-amber-600 transition-colors">
                <BookOpen className="h-6 w-6" />
              </div>
              <div className="flex items-center space-x-1 bg-amber-50 px-2 py-1 rounded-lg">
                <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                <span className="text-sm font-bold text-amber-700">{res.rating}</span>
              </div>
            </div>
            
            <h3 className="text-xl font-bold text-slate-900 mb-2 line-clamp-2">{res.title}</h3>
            
            <div className="mt-auto pt-6">
              <a 
                href={res.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="inline-flex items-center justify-center w-full py-2.5 px-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 transition-colors group-hover:border-amber-200 group-hover:text-amber-700"
              >
                View Resource <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </div>
          </div>
        ))}
        
        {!loading && hasSearched && resources.length === 0 && (
          <div className="col-span-full py-12 text-center bg-white rounded-3xl border border-dashed border-slate-300">
            <Search className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900">No resources found</h3>
            <p className="text-slate-500 mt-1">Try searching for a different topic.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResourceFinder;
