import React, { useContext, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { BrainCircuit, LayoutDashboard, Map, HelpCircle, LogOut, BookOpen, Users } from 'lucide-react';
import api from '../api';

const Navbar = () => {
  const { user, setUser, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-transparent sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex-shrink-0 flex items-center space-x-2 border-none ring-0 outline-none">
              <BrainCircuit className="h-8 w-8 text-indigo-600" />
              <span className="font-bold text-xl tracking-tight text-slate-900">PathAI</span>
            </Link>
          </div>
          <div className="flex items-center space-x-1 sm:space-x-4">
            {user ? (
              <>
                <Link to="/dashboard" className={`px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-1 transition-colors ${isActive('/dashboard') || isActive('/') ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
                  <LayoutDashboard className="h-4 w-4" /> <span className="hidden sm:inline">Dashboard</span>
                </Link>
                <Link to="/roadmap" className={`px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-1 transition-colors ${isActive('/roadmap') ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
                  <Map className="h-4 w-4" /> <span className="hidden sm:inline">Roadmap</span>
                </Link>
                <Link to="/mcq" className={`px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-1 transition-colors ${isActive('/mcq') ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
                  <HelpCircle className="h-4 w-4" /> <span className="hidden sm:inline">Quiz</span>
                </Link>
                <Link to="/resources" className={`px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-1 transition-colors ${isActive('/resources') ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
                  <BookOpen className="h-4 w-4" /> <span className="hidden lg:inline">Resources</span>
                </Link>
                <Link to="/social" className={`px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-1 transition-colors ${isActive('/social') ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
                  <Users className="h-4 w-4" /> <span className="hidden lg:inline">Social</span>
                </Link>
                <div className="ml-4 border-l border-slate-200 h-6"></div>
                <Link to="/profile" className="cursor-pointer relative group flex items-center transition-all">
                  {user.profilePic ? (
                    <img src={user.profilePic} alt="Profile" className="h-8 w-8 rounded-full object-cover border-2 border-transparent group-hover:border-indigo-500 transition-all" />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold border-2 border-transparent group-hover:border-indigo-500 transition-all">
                      {user.email ? user.email.charAt(0).toUpperCase() : 'U'}
                    </div>
                  )}
                </Link>
                <button 
                  onClick={handleLogout} 
                  className="ml-4 px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 flex items-center space-x-1 transition-colors"
                >
                  <LogOut className="h-4 w-4" /> <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Log in</Link>
                <Link to="/register" className="px-4 py-2 rounded-full text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm transition-all hover:shadow-md">Sign up</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
