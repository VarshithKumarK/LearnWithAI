import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SnackbarProvider } from 'notistack';
import { AuthProvider } from './context/AuthContext';
import Navbar from './Components/Navbar';
import ProtectedRoute from './Components/ProtectedRoute';

import Login from './Pages/Login';
import Register from './Pages/Register';
import Dashboard from './Pages/Dashboard';
import Roadmap from './Pages/Roadmap';
import MCQ from './Pages/MCQ';
import ResourceFinder from './Pages/ResourceFinder';
import Social from './Pages/Social';
import Profile from './Pages/Profile';
import UserProfile from './Pages/UserProfile';
import Predictor from './Pages/Predictor';
import Recommender from './Pages/Recommender';

function App() {
  return (
    <Router>
      <SnackbarProvider 
        maxSnack={3} 
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        autoHideDuration={3000}
      >
        <AuthProvider>
          <div className="min-h-screen flex flex-col font-sans bg-slate-50">
            <Navbar />
            <main className="flex-grow flex flex-col pt-0">
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/roadmap" element={<ProtectedRoute><Roadmap /></ProtectedRoute>} />
                <Route path="/mcq" element={<ProtectedRoute><MCQ /></ProtectedRoute>} />
                <Route path="/resources" element={<ProtectedRoute><ResourceFinder /></ProtectedRoute>} />
                <Route path="/social" element={<ProtectedRoute><Social /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/user/:id" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
                <Route path="/predict" element={<ProtectedRoute><Predictor /></ProtectedRoute>} />
                <Route path="/recommender" element={<ProtectedRoute><Recommender /></ProtectedRoute>} />
              </Routes>
            </main>
          </div>
        </AuthProvider>
      </SnackbarProvider>
    </Router>
  );
}

export default App;
