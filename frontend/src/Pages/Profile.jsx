import React, { useContext, useState, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import { User, Mail, Phone, Lock, Save, Camera, AlertCircle, CheckCircle } from 'lucide-react';
import api from '../api';

const Profile = () => {
  const { user, setUser } = useContext(AuthContext);
  const [name, setName] = useState(user?.name || '');
  const [contactInfo, setContactInfo] = useState(user?.contactInfo || '');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const fileInputRef = useRef(null);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });
    
    try {
      const payload = { name, contactInfo };
      if (password) payload.password = password;
      
      const { data } = await api.put('/user/profile', payload);
      setUser(data);
      setMessage({ text: 'Profile updated successfully!', type: 'success' });
      setPassword('');
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Failed to update profile.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setMessage({ text: '', type: '' });
    const formData = new FormData();
    formData.append('image', file);

    try {
      const { data } = await api.put('/user/profile-pic', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setUser({ ...user, profilePic: data.profilePic });
      setMessage({ text: 'Profile picture updated successfully!', type: 'success' });
    } catch (err) {
      setMessage({ text: 'Failed to upload profile picture.', type: 'error' });
    } finally {
      setUploading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-8 sm:p-10">
          <h2 className="text-2xl font-bold text-slate-900 mb-8">Your Profile</h2>
          
          {message.text && (
            <div className={`mb-6 rounded-lg p-4 flex items-start ${message.type === 'error' ? 'bg-red-50 border border-red-100 text-red-700' : 'bg-green-50 border border-green-100 text-green-700'}`}>
              {message.type === 'error' ? <AlertCircle className="h-5 w-5 mt-0.5 mr-3 flex-shrink-0" /> : <CheckCircle className="h-5 w-5 mt-0.5 mr-3 flex-shrink-0" />}
              <p className="text-sm">{message.text}</p>
            </div>
          )}

          <div className="flex flex-col md:flex-row gap-10">
            {/* Left Col - Avatar */}
            <div className="flex flex-col items-center shrink-0">
              <div className="relative group">
                <div className={`h-32 w-32 rounded-full overflow-hidden border-4 border-indigo-50 flex items-center justify-center bg-indigo-100 text-indigo-700 font-bold text-4xl ${uploading ? 'opacity-50' : ''}`}>
                  {user.profilePic ? (
                    <img src={user.profilePic} alt="Profile" className="h-full w-full object-cover" />
                  ) : (
                    user.email ? user.email.charAt(0).toUpperCase() : 'U'
                  )}
                </div>
                
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="absolute bottom-0 right-0 h-10 w-10 bg-indigo-600 rounded-full flex items-center justify-center text-white border-4 border-white hover:bg-indigo-700 transition-colors shadow-sm disabled:bg-indigo-400"
                >
                  <Camera className="h-4 w-4" />
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleImageUpload} 
                />
              </div>
              <p className="mt-4 text-sm font-medium text-slate-900">{user.name}</p>
              <p className="text-xs text-slate-500">{user.email}</p>
            </div>

            {/* Right Col - Edit Form */}
            <div className="flex-1">
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-slate-700">Full Name</label>
                  <div className="mt-2 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="block w-full pl-10 sm:text-sm border-slate-300 rounded-lg py-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50 border transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-700">Email Address (Read-only)</label>
                  <div className="mt-2 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      id="email"
                      type="email"
                      value={user.email}
                      disabled
                      className="block w-full pl-10 sm:text-sm border-slate-200 rounded-lg py-2 bg-slate-100 text-slate-500 border cursor-not-allowed"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="contactInfo" className="block text-sm font-medium text-slate-700">Contact Information</label>
                  <div className="mt-2 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      id="contactInfo"
                      type="text"
                      value={contactInfo}
                      onChange={(e) => setContactInfo(e.target.value)}
                      className="block w-full pl-10 sm:text-sm border-slate-300 rounded-lg py-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50 border transition-colors"
                      placeholder="e.g. +1 (555) 000-0000"
                    />
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-6 mt-6">
                  <label htmlFor="password" className="block text-sm font-medium text-slate-700">New Password (leave blank to keep current)</label>
                  <div className="mt-2 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      minLength={6}
                      className="block w-full pl-10 sm:text-sm border-slate-300 rounded-lg py-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50 border transition-colors"
                      placeholder="Enter new password"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center justify-center py-2 px-6 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
                  >
                    {loading ? 'Saving...' : <><Save className="mr-2 h-4 w-4" /> Save Changes</>}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
