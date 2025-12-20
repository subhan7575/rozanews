
import React, { useState, useEffect } from 'react';
import { StorageService } from '../../../services/storageService';

const ApiTab: React.FC = () => {
  const [apiKey, setApiKey] = useState('');

  useEffect(() => {
    setApiKey(StorageService.getApiKey());
  }, []);

  const saveApiKey = () => {
    StorageService.saveApiKey(apiKey);
    alert('API Key Saved Successfully!');
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 max-w-2xl animate-fade-in">
        <h3 className="text-xl font-bold dark:text-white mb-6">Gemini API Key</h3>
        <input type="text" value={apiKey} onChange={(e) => setApiKey(e.target.value)} className="w-full p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl dark:text-white font-mono text-sm mb-4" />
        <button onClick={saveApiKey} className="bg-primary text-white font-bold py-3 px-8 rounded-xl">Save Key</button>
    </div>
  );
};

export default ApiTab;
