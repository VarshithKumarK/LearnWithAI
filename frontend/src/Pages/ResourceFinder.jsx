import React, { useState, useEffect } from 'react';
import api from '../api';
import { useSnackbar } from 'notistack';
import { BookOpen, Search, Star, ExternalLink, Loader2, BookmarkPlus, Trash2, Bookmark } from 'lucide-react';

const ResourceFinder = () => {
  const [topic, setTopic] = useState('');
  const [resources, setResources] = useState([]);
  const [savedResources, setSavedResources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [activeTab, setActiveTab] = useState('discover');
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    if (activeTab === 'saved') {
      fetchSavedResources();
    }
  }, [activeTab]);

  const fetchResources = async (e) => {
    e.preventDefault();
    setLoading(true);
    setHasSearched(true);
    try {
      const res = await api.post(`/resources/recommend`, {
        topic,
        history: ['react basics', 'js frontend'],
      });
      setResources(res.data.resources || []);
    } catch (error) {
      enqueueSnackbar('Failed to fetch resources', { variant: 'error' });
    }
    setLoading(false);
  };

  const fetchSavedResources = async () => {
    try {
      const res = await api.get('/resources/saved');
      setSavedResources(res.data);
    } catch (error) {
      enqueueSnackbar('Failed to fetch saved resources', { variant: 'error' });
    }
  };

  const handleSaveResource = async (res) => {
    try {
      await api.post('/resources/save', {
        title: res.title,
        url: res.url,
        rating: res.rating || 4.5,
        topic: topic
      });
      enqueueSnackbar('Resource saved!', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar('Failed to save resource', { variant: 'error' });
    }
  };

  const handleDeleteResource = async (id) => {
    if (!window.confirm('Are you sure you want to delete this saved resource?')) return;
    try {
      await api.delete(`/resources/${id}`);
      enqueueSnackbar('Resource deleted', { variant: 'info' });
      fetchSavedResources();
    } catch (error) {
      enqueueSnackbar('Failed to delete resource', { variant: 'error' });
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 pb-4 border-b border-slate-200">
        <div className="flex items-center space-x-3 mb-4 sm:mb-0">
          <div className="p-3 bg-amber-100 rounded-xl text-amber-600">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Resource Finder</h1>
            <p className="text-slate-500 text-sm mt-1">Smart recommendations based on your learning history</p>
          </div>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button 
            onClick={() => setActiveTab('discover')}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === 'discover' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'}`}
          >
            Discover
          </button>
          <button 
            onClick={() => setActiveTab('saved')}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === 'saved' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'}`}
          >
            Saved Items
          </button>
        </div>
      </div>
      
      {activeTab === 'discover' && (
        <>
          <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200 mb-10 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-50 rounded-full blur-3xl -mr-20 -mt-20 z-0"></div>
            <div className="relative z-10">
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {resources.map((res, idx) => (
              <div key={idx} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full group">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-amber-100 group-hover:text-amber-600 transition-colors">
                    <BookOpen className="h-6 w-6" />
                  </div>
                  <div className="flex space-x-2">
                    <div className="flex items-center space-x-1 bg-amber-50 px-2 py-1 rounded-lg h-8">
                      <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                      <span className="text-sm font-bold text-amber-700">{res.rating}</span>
                    </div>
                    <button 
                      onClick={() => handleSaveResource(res)}
                      className="h-8 w-8 flex items-center justify-center bg-slate-100 hover:bg-amber-100 text-slate-500 hover:text-amber-600 rounded-lg transition-colors"
                      title="Save Resource"
                    >
                      <BookmarkPlus className="h-5 w-5" />
                    </button>
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
        </>
      )}

      {activeTab === 'saved' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {savedResources.map((res) => (
            <div key={res._id} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 hover:shadow-lg transition-all duration-300 flex flex-col h-full group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50 rounded-full blur-2xl -mr-10 -mt-10 z-0"></div>
              
              <div className="relative z-10 flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
                  <Bookmark className="h-6 w-6" />
                </div>
                <div className="flex space-x-2">
                  <div className="flex items-center space-x-1 bg-amber-50 px-2 py-1 rounded-lg h-8">
                    <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                    <span className="text-sm font-bold text-amber-700">{res.rating || '4.5'}</span>
                  </div>
                  <button 
                    onClick={() => handleDeleteResource(res._id)}
                    className="h-8 w-8 flex items-center justify-center bg-slate-100 hover:bg-red-100 text-slate-500 hover:text-red-600 rounded-lg transition-colors"
                    title="Delete Saved Resource"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
              
              <div className="relative z-10 mb-2">
                <span className="inline-block px-2 py-1 bg-slate-100 text-slate-500 text-xs font-semibold rounded-md mb-2 capitalize">{res.topic}</span>
                <h3 className="text-xl font-bold text-slate-900 line-clamp-2">{res.title}</h3>
              </div>
              
              <div className="mt-auto pt-6 relative z-10">
                <a 
                  href={res.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-flex items-center justify-center w-full py-2.5 px-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 transition-colors group-hover:border-amber-200 group-hover:text-amber-700"
                >
                  Visit Link <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </div>
            </div>
          ))}

          {savedResources.length === 0 && (
            <div className="col-span-full py-16 text-center bg-white rounded-3xl border border-dashed border-slate-300">
              <Bookmark className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900">No saved resources yet</h3>
              <p className="text-slate-500 mt-1 max-w-sm mx-auto">Discover new topics and click the bookmark icon to save resources here for later.</p>
              <button 
                onClick={() => setActiveTab('discover')} 
                className="mt-6 bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-2 rounded-xl text-sm font-semibold transition-colors"
              >
                Go to Discover
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ResourceFinder;
