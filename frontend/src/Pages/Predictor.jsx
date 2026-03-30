import React, { useState } from 'react';
import api from '../api';
import { useSnackbar } from 'notistack';
import { BrainCircuit, Loader2, User, BookOpen, Clock, Activity, BarChart, Percent, Target } from 'lucide-react';

const Predictor = () => {
  const { enqueueSnackbar } = useSnackbar();
  
  const [formData, setFormData] = useState({
    Age: 25,
    Education_Level: 'Bachelor',
    Employment_Status: 'Student',
    Time_Spent_Hours: 10.5,
    Progress_Percentage: 50.0,
    Quiz_Score_Avg: 75.0,
    App_Usage_Percentage: 60.0
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Map strings appropriately, numbers as numbers
    const processedValue = (name === 'Education_Level' || name === 'Employment_Status') 
      ? value 
      : Number(value);

    setFormData({
      ...formData,
      [name]: processedValue
    });
  };

  const handlePredict = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const res = await api.post('/prediction/course-completion', formData);
      setResult(res.data);
      enqueueSnackbar('Prediction generated successfully!', { variant: 'success' });
    } catch (error) {
      if (error.response?.status === 503) {
        enqueueSnackbar('The Machine Learning model is not trained yet. Run train_model.py first.', { variant: 'warning' });
      } else {
        enqueueSnackbar('Failed to generate prediction. Please try again.', { variant: 'error' });
      }
      console.error(error);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-8 pb-4 border-b border-slate-200">
        <div className="p-3 bg-indigo-100 rounded-xl text-indigo-600">
          <BrainCircuit className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">AI Dropout Predictor</h1>
          <p className="text-slate-500 text-sm mt-1">Predict learning success using our advanced Random Forest AI model.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Form Column */}
        <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-3xl shadow-[0_4px_24px_rgba(0,0,0,0.03)] border border-slate-200">
          <h2 className="text-xl font-bold mb-6 text-slate-800">Student Profile Metrics</h2>
          <form onSubmit={handlePredict} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Age */}
              <div>
                <label className="flex items-center text-sm font-bold text-slate-700 mb-2">
                  <User className="w-4 h-4 mr-2 text-indigo-500" /> Age
                </label>
                <input 
                  type="number" name="Age" min="10" max="100" step="1"
                  value={formData.Age} onChange={handleChange} required
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors shadow-sm"
                />
              </div>

              {/* Education Level */}
              <div>
                <label className="flex items-center text-sm font-bold text-slate-700 mb-2">
                  <BookOpen className="w-4 h-4 mr-2 text-indigo-500" /> Education Level
                </label>
                <select 
                  name="Education_Level" value={formData.Education_Level} onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors shadow-sm"
                >
                  <option value="High School">High School</option>
                  <option value="Diploma">Diploma</option>
                  <option value="Bachelor">Bachelor</option>
                  <option value="Master">Master</option>
                  <option value="PhD">PhD</option>
                </select>
              </div>

              {/* Employment Status */}
              <div>
                <label className="flex items-center text-sm font-bold text-slate-700 mb-2">
                  <Activity className="w-4 h-4 mr-2 text-indigo-500" /> Employment Status
                </label>
                <select 
                  name="Employment_Status" value={formData.Employment_Status} onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors shadow-sm"
                >
                  <option value="Student">Student</option>
                  <option value="Unemployed">Unemployed</option>
                  <option value="Employed">Employed</option>
                  <option value="Self-Employed">Self-Employed</option>
                </select>
              </div>

              {/* Time Spent */}
              <div>
                <label className="flex items-center text-sm font-bold text-slate-700 mb-2">
                  <Clock className="w-4 h-4 mr-2 text-indigo-500" /> Hours Spent Learning
                </label>
                <input 
                  type="number" name="Time_Spent_Hours" min="0" max="1000" step="0.1"
                  value={formData.Time_Spent_Hours} onChange={handleChange} required
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors shadow-sm"
                />
              </div>

              {/* Progress */}
              <div>
                <label className="flex items-center text-sm font-bold text-slate-700 mb-2">
                  <BarChart className="w-4 h-4 mr-2 text-indigo-500" /> Course Progress (%)
                </label>
                <input 
                  type="number" name="Progress_Percentage" min="0" max="100" step="0.1"
                  value={formData.Progress_Percentage} onChange={handleChange} required
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors shadow-sm"
                />
              </div>

              {/* Quiz Score */}
              <div>
                <label className="flex items-center text-sm font-bold text-slate-700 mb-2">
                  <Target className="w-4 h-4 mr-2 text-indigo-500" /> Average Quiz Score
                </label>
                <input 
                  type="number" name="Quiz_Score_Avg" min="0" max="100" step="0.1"
                  value={formData.Quiz_Score_Avg} onChange={handleChange} required
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors shadow-sm"
                />
              </div>

              {/* App Usage */}
              <div>
                <label className="flex items-center text-sm font-bold text-slate-700 mb-2">
                  <Percent className="w-4 h-4 mr-2 text-indigo-500" /> App Usage (%)
                </label>
                <input 
                  type="number" name="App_Usage_Percentage" min="0" max="100" step="0.1"
                  value={formData.App_Usage_Percentage} onChange={handleChange} required
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors shadow-sm"
                />
              </div>

            </div>

            <div className="pt-6 border-t border-slate-100 flex justify-end">
              <button 
                type="submit" disabled={loading}
                className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-[0_4px_14px_rgba(79,70,229,0.3)] hover:shadow-[0_6px_20px_rgba(79,70,229,0.4)] disabled:opacity-70 flex justify-center items-center"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <BrainCircuit className="w-5 h-5 mr-2" />}
                Predict Completion
              </button>
            </div>
            
          </form>
        </div>

        {/* Results Column */}
        <div className="lg:col-span-1 flex flex-col">
          {result ? (
            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-8 shadow-xl text-white transform transition-all duration-500 animate-in fade-in zoom-in h-full flex flex-col justify-center">
              <div className="text-center mb-6">
                <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-xs font-bold uppercase tracking-wider mb-4 border border-white/30 backdrop-blur-md">
                  AI Prediction
                </span>
                <h3 className="text-4xl font-black mb-2">
                  {result.prediction}
                </h3>
              </div>
              
              <div className="space-y-4 flex-grow">
                <div className="bg-white/10 border border-white/20 p-4 rounded-2xl backdrop-blur-sm">
                  <div className="text-indigo-100 text-sm font-bold uppercase mb-1">Completion Probability</div>
                  <div className="text-3xl font-black">
                    {(result.completion_probability * 100).toFixed(1)}%
                  </div>
                  {/* Progress bar visual */}
                  <div className="mt-3 h-2 w-full bg-black/20 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-400 rounded-full" 
                      style={{ width: `${result.completion_probability * 100}%` }}
                    />
                  </div>
                </div>

                <div className="bg-white/10 border border-white/20 p-4 rounded-2xl backdrop-blur-sm">
                  <div className="text-indigo-100 text-sm font-bold uppercase mb-1">Dropout Risk</div>
                  <div className="text-3xl font-black">
                    {(result.dropout_probability * 100).toFixed(1)}%
                  </div>
                  {/* Progress bar visual */}
                  <div className="mt-3 h-2 w-full bg-black/20 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-red-400 rounded-full" 
                      style={{ width: `${result.dropout_probability * 100}%` }}
                    />
                  </div>
                </div>
              </div>
              
              <p className="mt-6 text-sm text-indigo-100 text-center opacity-80">
                Confidence levels are determined by evaluating standard metrics based on historical platform data.
              </p>
            </div>
          ) : (
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-8 h-full flex flex-col items-center justify-center text-center text-slate-400">
              <BrainCircuit className="w-16 h-16 mb-4 text-slate-300" />
              <h3 className="text-xl font-bold text-slate-600 mb-2">Awaiting Data</h3>
              <p className="text-sm">Submit the student metrics to see the AI-driven completion likelihood.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Predictor;
