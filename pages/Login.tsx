import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StorageService } from '../services/storageService';
import { Lock } from 'lucide-react';

const Login: React.FC = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (StorageService.login(password)) {
      navigate('/admin');
    } else {
      setError('Access Denied: Invalid credentials.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-primary text-white p-3 rounded-full mb-4">
            <Lock size={24} />
          </div>
          <h1 className="text-2xl font-bold dark:text-white">Admin Access</h1>
          <p className="text-gray-500">Secure Content Management System</p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Secure Password</label>
            <input 
              type="password" 
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button type="submit" className="w-full bg-primary hover:bg-red-800 text-white font-bold py-3 rounded transition-colors">
            Login
          </button>
        </form>
        <div className="mt-4 text-center">
           <a href="/" className="text-sm text-gray-500 hover:text-primary">Return to Website</a>
        </div>
      </div>
    </div>
  );
};

export default Login;