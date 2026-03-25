import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../api';
import { Link } from 'react-router-dom';
import { Flame, Compass, HelpCircle, BookOpen, Users, ArrowRight, Zap, Target } from 'lucide-react';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [streakData, setStreakData] = useState(user?.streak || 0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Update streak on visit
    const updateStreak = async () => {
      try {
        const res = await api.put('/user/streak');
        setStreakData(res.data.streak);
      } catch (error) {
        console.error('Error updating streak');
      } finally {
        setLoading(false);
      }
    };
    if (user) updateStreak();
  }, [user]);

  const emailName = user?.email.split('@')[0] || 'User';
  const capitalizedName = emailName.charAt(0).toUpperCase() + emailName.slice(1);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Header section */}
      <div className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-2">
          Welcome back, {capitalizedName}! ✨
        </h1>
        <p className="text-lg text-slate-600">
          Ready to continue your personalized learning journey today?
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Streak Card */}
        <div className="lg:col-span-1">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-8 text-white shadow-xl shadow-indigo-200 border border-indigo-400 relative overflow-hidden h-full flex flex-col justify-center">
            <div className="absolute right-0 top-0 opacity-10 transform translate-x-10 -translate-y-10">
              <Flame size={200} />
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center space-x-2 mb-4">
                <Flame className="text-orange-300 h-8 w-8" />
                <h2 className="text-2xl font-bold">Learning Streak</h2>
              </div>
              
              <div className="flex items-baseline space-x-2 my-6">
                <span className="text-6xl font-black">{loading ? '-' : streakData}</span>
                <span className="text-xl text-indigo-100 font-medium">Days</span>
              </div>
              
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 mt-auto">
                <p className="text-sm font-medium">
                  {streakData > 0 
                    ? "You're on fire! Complete a milestone today to keep it going." 
                    : "Start your streak today by completing a quiz or roadmap milestone!"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions & Exploration */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
          
          {/* Action 1 */}
          <Link to="/roadmap" className="group bg-white rounded-3xl p-6 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-100 flex flex-col h-full">
            <div className="h-12 w-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Compass className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Learning Roadmap</h3>
            <p className="text-slate-500 flex-grow">Generate a custom AI curriculum or continue your existing milestones.</p>
            <div className="mt-6 flex items-center text-blue-600 font-semibold text-sm">
              Explore path <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Action 2 */}
          <Link to="/mcq" className="group bg-white rounded-3xl p-6 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-100 flex flex-col h-full">
            <div className="h-12 w-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <HelpCircle className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Knowledge Quiz</h3>
            <p className="text-slate-500 flex-grow">Test your knowledge with dynamically generated AI quizzes on any topic.</p>
            <div className="mt-6 flex items-center text-emerald-600 font-semibold text-sm">
              Take a quiz <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Action 3 */}
          <Link to="/resources" className="group bg-white rounded-3xl p-6 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-100 flex flex-col h-full">
            <div className="h-12 w-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <BookOpen className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Resource Finder</h3>
            <p className="text-slate-500 flex-grow">Discover smart resource recommendations evaluated by our AI.</p>
            <div className="mt-6 flex items-center text-amber-600 font-semibold text-sm">
              Find resources <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Action 4 */}
          <Link to="/social" className="group bg-white rounded-3xl p-6 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-100 flex flex-col h-full">
            <div className="h-12 w-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Users className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Social Connect</h3>
            <p className="text-slate-500 flex-grow">Connect with peers learning similar topics and study together.</p>
            <div className="mt-6 flex items-center text-rose-600 font-semibold text-sm">
              Meet peers <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

        </div>
      </div>
      
    </div>
  );
};

export default Dashboard;
