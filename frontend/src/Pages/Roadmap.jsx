import React, { useState, useEffect } from 'react';
import api from '../api';
import { useSnackbar } from 'notistack';
import { Map, Loader2, Target, Clock, Zap, Trash2, Download, Save, ChevronLeft, Calendar, BookOpen } from 'lucide-react';
import { jsPDF } from "jspdf";

const Roadmap = () => {
  const [roadmaps, setRoadmaps] = useState([]);
  const [goal, setGoal] = useState('');
  const [skillLevel, setSkillLevel] = useState('Beginner');
  const [timeAvailability, setTimeAvailability] = useState('10 hours/week');
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeRoadmap, setActiveRoadmap] = useState(null);

  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    fetchRoadmaps();
  }, []);

  const fetchRoadmaps = async () => {
    try {
      const res = await api.get('/roadmap');
      setRoadmaps(res.data);
    } catch (error) {
      enqueueSnackbar('Failed to fetch roadmaps', { variant: 'error' });
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setActiveRoadmap(null);
    try {
      const res = await api.post('/roadmap/generate', { goal, skillLevel, timeAvailability });
      setActiveRoadmap({
        ...res.data,
        isDraft: true // indicates it hasn't been saved yet
      });
      setGoal('');
      enqueueSnackbar('Draft roadmap generated! You can now save or download it.', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar('Failed to generate roadmap', { variant: 'error' });
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!activeRoadmap || !activeRoadmap.isDraft) return;
    setSaving(true);
    try {
      const res = await api.post('/roadmap', {
        goal: activeRoadmap.goal,
        milestones: activeRoadmap.milestones
      });
      
      const newSavedRoadmap = res.data;
      setRoadmaps([newSavedRoadmap, ...roadmaps]);
      setActiveRoadmap(newSavedRoadmap); // Now it's saved, no longer a draft
      
      enqueueSnackbar('Roadmap saved to your profile!', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar('Failed to save roadmap', { variant: 'error' });
    }
    setSaving(false);
  };

  const handleDownload = () => {
    if (!activeRoadmap) return;
    
    const doc = new jsPDF();
    const margin = 15;
    let y = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const maxWidth = pageWidth - margin * 2;
    
    // Title
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    const mainTitle = doc.splitTextToSize(`Learning Roadmap: ${activeRoadmap.goal.toUpperCase()}`, maxWidth);
    doc.text(mainTitle, margin, y);
    y += (mainTitle.length * 10) + 6;
    
    // Metadata
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Total Modules: ${activeRoadmap.milestones.length}`, margin, y);
    y += 8;
    if (!activeRoadmap.isDraft) {
      doc.text(`Generated / Saved: ${new Date(activeRoadmap.createdAt).toLocaleDateString()}`, margin, y);
      y += 8;
    }
    
    y += 4;
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageWidth - margin, y);
    y += 12;

    activeRoadmap.milestones.forEach((ms, idx) => {
      // Check if we need a new page for the title
      if (y > doc.internal.pageSize.getHeight() - 20) {
        doc.addPage();
        y = 20;
      }
      
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      const title = `Module ${idx + 1}: ${ms.title || ms.topic}`;
      const titleLines = doc.splitTextToSize(title, maxWidth);
      doc.text(titleLines, margin, y);
      y += (titleLines.length * 7) + 4;
      
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      const descriptionLines = doc.splitTextToSize(ms.description || '', maxWidth);
      
      // Check page breaks midway into description
      for (let i = 0; i < descriptionLines.length; i++) {
        if (y > doc.internal.pageSize.getHeight() - 15) {
          doc.addPage();
          y = 20;
        }
        doc.text(descriptionLines[i], margin, y);
        y += 6;
      }
      y += 8; // spacing between modules
    });

    doc.save(`${activeRoadmap.goal.replace(/\\s+/g, '_')}_Roadmap.pdf`);
    enqueueSnackbar('Download as PDF started!', { variant: 'info' });
  };

  const handleUpdateRoadmap = async (roadmapId, roadmapGoal) => {
    const feedback = prompt('Provide feedback to adapt this roadmap (e.g. "too hard", "add more React basics"):');
    if (!feedback) return;
    
    const originalActive = activeRoadmap; // in case we need to restore
    setLoading(true);
    try {
      const res = await api.put(`/roadmap/${roadmapId}/progress`, {
        goal: roadmapGoal,
        level: skillLevel,
        progress: { completionPercentage: 0 },
        feedback
      });
      enqueueSnackbar('Roadmap adapted with AI!', { variant: 'success' });
      await fetchRoadmaps();
      // If we are currently viewing this roadmap, refresh the view
      if (activeRoadmap && activeRoadmap._id === roadmapId) {
        setActiveRoadmap(res.data);
      }
    } catch (error) {
      enqueueSnackbar('Failed to adapt roadmap. Please try again.', { variant: 'error' });
    }
    setLoading(false);
  };

  const handleDeleteRoadmap = async (roadmapId) => {
    if (!window.confirm('Are you sure you want to delete this roadmap?')) return;
    setLoading(true);
    try {
      await api.delete(`/roadmap/${roadmapId}`);
      enqueueSnackbar('Roadmap deleted', { variant: 'info' });
      if (activeRoadmap && activeRoadmap._id === roadmapId) {
        setActiveRoadmap(null);
      }
      fetchRoadmaps();
    } catch (error) {
      enqueueSnackbar('Failed to delete roadmap', { variant: 'error' });
    }
    setLoading(false);
  };

  // View: Active Roadmap (Detailed View)
  if (activeRoadmap) {
    return (
      <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
        
        {/* Navigation & Actions Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 border-b border-slate-200 pb-4">
          <button 
            onClick={() => setActiveRoadmap(null)}
            className="flex items-center text-slate-500 hover:text-slate-900 transition-colors font-medium"
          >
            <ChevronLeft className="h-5 w-5 mr-1" /> Back to Generator
          </button>
          
          <div className="flex items-center space-x-3 w-full sm:w-auto">
            {activeRoadmap.isDraft && (
              <button 
                onClick={handleSave}
                disabled={saving}
                className="flex-1 sm:flex-none flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all disabled:opacity-70 shadow-sm"
              >
                {saving ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Save className="h-5 w-5 mr-2" />}
                Save to Profile
              </button>
            )}
            <button 
              onClick={handleDownload}
              className="flex-1 sm:flex-none flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-2.5 rounded-xl font-bold transition-all border border-slate-200 shadow-sm"
            >
              <Download className="h-5 w-5 mr-2" /> Download
            </button>
          </div>
        </div>

        {/* Roadmap Display */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-[0_4px_24px_rgba(0,0,0,0.04)] border border-slate-200">
          <div className="mb-10 text-center">
            {activeRoadmap.isDraft && (
              <span className="inline-block px-3 py-1 bg-amber-100 text-amber-800 text-xs font-bold uppercase tracking-wider rounded-lg mb-4">
                Unsaved Draft
              </span>
            )}
            <h2 className="text-3xl sm:text-4xl font-black text-indigo-950 capitalize leading-tight">
              {activeRoadmap.goal} <span className="text-indigo-500">Roadmap</span>
            </h2>
            <p className="text-slate-500 mt-3 font-medium flex items-center justify-center">
              <Map className="h-4 w-4 mr-1.5" /> 
              {activeRoadmap.milestones.length} milestones generated
            </p>
          </div>

          <div className="space-y-6 relative before:absolute before:inset-0 before:ml-6 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-1 before:bg-gradient-to-b before:from-indigo-100 before:via-indigo-300 before:to-indigo-50">
            {activeRoadmap.milestones.map((ms, idx) => (
              <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-12 h-12 rounded-full border-4 border-white bg-indigo-100 group-[.is-active]:bg-indigo-600 text-indigo-600 group-[.is-active]:text-white shadow-md shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 text-lg font-bold z-10 transition-colors">
                  {idx + 1}
                </div>
                
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group-[.is-active]:border-indigo-100 group-[.is-active]:ring-1 group-[.is-active]:ring-indigo-100">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                    <div className="font-bold text-lg text-slate-900">{ms.title || ms.topic}</div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-600 self-start sm:self-auto uppercase tracking-wide">
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
      </div>
    );
  }

  // View: Generator and List of Saved Roadmaps
  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
      
      {/* Title */}
      <div className="flex items-center space-x-3 mb-8 pb-4 border-b border-slate-200">
        <div className="p-3 bg-indigo-100 rounded-xl text-indigo-600">
          <Map className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Learning Roadmaps</h1>
          <p className="text-slate-500 text-sm mt-1">AI-generated paths tailored to your skills and time</p>
        </div>
      </div>
      
      {/* Generator Form */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-[0_4px_24px_rgba(0,0,0,0.03)] border border-slate-200 mb-12 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -mr-20 -mt-20 z-0"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-purple-50 rounded-full blur-2xl -ml-10 -mb-10 z-0"></div>
        
        <div className="relative z-10 flex flex-col items-center max-w-2xl mx-auto text-center">
          <Zap className="h-10 w-10 text-indigo-500 mb-4" />
          <h2 className="text-2xl font-black mb-2 text-slate-900">
            Generate a New Path
          </h2>
          <p className="text-slate-500 mb-8 font-medium">
            Enter a topic, and AI will build a step-by-step masterclass just for you. Preview it before saving.
          </p>
          
          <form onSubmit={handleGenerate} className="w-full space-y-4">
            <div className="text-left">
              <label className="block text-sm font-bold text-slate-700 mb-2">
                What do you want to learn?
              </label>
              <input 
                type="text" 
                placeholder="e.g. Master ReactJS, Data Science Fundamentals" 
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-5 py-4 text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all placeholder:text-slate-400 shadow-inner"
                value={goal} onChange={(e) => setGoal(e.target.value)} required
              />
            </div>
            
            <div className="text-left">
              <label className="block text-sm font-bold text-slate-700 mb-2">Your Current Level</label>
              <select 
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-5 py-4 font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors shadow-sm" 
                value={skillLevel} onChange={(e) => setSkillLevel(e.target.value)}
              >
                <option value="Beginner">Beginner (No prior knowledge)</option>
                <option value="Intermediate">Intermediate (Some basics)</option>
                <option value="Advanced">Advanced (Looking for deep dives)</option>
              </select>
            </div>
            
            <div className="pt-4">
              <button 
                disabled={loading} 
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black text-lg py-4 px-6 rounded-xl transition-all shadow-[0_4px_14px_rgba(79,70,229,0.3)] hover:shadow-[0_6px_20px_rgba(79,70,229,0.4)] hover:-translate-y-0.5 disabled:bg-indigo-400 disabled:shadow-none disabled:transform-none flex justify-center items-center"
              >
                {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : 'Map My Journey ✨'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Saved Roadmaps Grid */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
          <Map className="h-6 w-6 mr-2 text-indigo-500" />
          Your Saved Roadmaps
        </h2>
        
        {roadmaps.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-300 shadow-sm">
            <BookOpen className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-800">No roadmaps saved yet</h3>
            <p className="text-slate-500 max-w-sm mx-auto mt-2">Generate a roadmap above and save it to track your learning journey over time.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {roadmaps.map((map) => (
              <div key={map._id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-lg transition-all flex flex-col h-full group">
                <div className="flex-grow">
                  <div className="flex justify-between items-start mb-4">
                    <div className="h-12 w-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center font-black text-xl group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                      {map.goal.charAt(0).toUpperCase()}
                    </div>
                    
                    {/* Delete logic */}
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDeleteRoadmap(map._id); }}
                      className="text-slate-400 hover:text-red-500 p-2 rounded-xl hover:bg-slate-50 transition-colors"
                      title="Delete profile"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <h3 className="text-xl font-bold text-slate-900 capitalize mb-2 line-clamp-2 leading-tight">
                    {map.goal}
                  </h3>
                  
                  <div className="flex items-center text-sm font-medium text-slate-500 mb-6">
                    <Target className="h-4 w-4 mr-1.5" /> 
                    {map.milestones.length} Modules
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-slate-100 flex gap-2">
                  <button
                    onClick={() => setActiveRoadmap(map)}
                    className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl transition-colors text-sm"
                  >
                    View Roadmap
                  </button>
                  <button
                    onClick={() => handleUpdateRoadmap(map._id, map.goal)}
                    className="flex-none bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold px-4 py-2.5 rounded-xl transition-colors text-sm"
                    title="Adapt with AI"
                  >
                    ✨ Adapt
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
    </div>
  );
};

export default Roadmap;
