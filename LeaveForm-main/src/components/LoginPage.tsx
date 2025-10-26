import React, { useState } from 'react';
import { Shield, User, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface LoginPageProps {
  userType?: 'admin' | 'mentor';
}

const LoginPage: React.FC<LoginPageProps> = ({ userType = 'admin' }) => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (userType === 'admin' && username === 'admin' && password === 'admin123') {
      localStorage.setItem('isAdminLoggedIn', 'true');
      navigate('/admin');
    } else if (userType === 'mentor' && username === 'mentor' && password === 'mentor123') {
      localStorage.setItem('isMentorLoggedIn', 'true');
      navigate('/teacher');
    } else {
      setError('Invalid username or password');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
      <div className="bg-gray-800 p-8 rounded-xl w-full max-w-md">
        <div className="flex flex-col items-center mb-6">
          <div className={`w-16 h-16 ${userType === 'admin' ? 'bg-blue-500' : 'bg-green-500'} rounded-full flex items-center justify-center mb-4`}>
            {userType === 'admin' ? <Shield size={32} className="text-white" /> : <User size={32} className="text-white" />}
          </div>
          <h2 className="text-2xl font-bold text-white">{userType === 'admin' ? 'Admin' : 'Mentor'} Login</h2>
          <p className="text-gray-400 mt-2">K.S.R. College of Engineering</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-2 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-gray-400 mb-2">Username</label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <User size={20} />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-gray-700 text-white pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter username"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-400 mb-2">Password</label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Lock size={20} />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-700 text-white pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter password"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg transition-colors duration-200"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;