
import React, { useState, useEffect } from 'react';
import { StorageService } from '../../../services/storageService';
import { TickerConfig } from '../../../types';
import { Save } from 'lucide-react';
import { INITIAL_TICKER_CONFIG } from '../../../constants';

const TickerTab: React.FC = () => {
  const [tickerConfig, setTickerConfig] = useState<TickerConfig>(INITIAL_TICKER_CONFIG);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setTickerConfig(StorageService.getTickerConfig());
  }, []);

  const handleTickerChange = (index: number, value: string) => {
    const newContent = [...tickerConfig.content];
    newContent[index] = value;
    setTickerConfig({ ...tickerConfig, content: newContent });
  };

  const saveTicker = () => {
    setIsSaving(true);
    StorageService.saveTickerConfig(tickerConfig);
    setTimeout(() => setIsSaving(false), 500);
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 max-w-2xl animate-fade-in">
        <div className="flex justify-between items-center mb-6">
            <div>
                <h3 className="text-xl font-bold dark:text-white">Breaking News Ticker</h3>
            </div>
            <button onClick={saveTicker} className="bg-primary text-white px-6 py-2 rounded-xl font-bold hover:bg-red-700 transition-colors flex items-center">
                <Save size={18} className="mr-2"/> {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
        </div>
        <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
                <input 
                    type="checkbox" 
                    checked={tickerConfig.visible} 
                    onChange={(e) => setTickerConfig({...tickerConfig, visible: e.target.checked})} 
                    className="w-5 h-5 rounded text-primary" 
                />
                <span className="font-bold dark:text-white">Show Ticker on Homepage</span>
            </div>
            {[0, 1, 2].map((index) => (
                <div key={index}>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Headline #{index + 1}</label>
                <input className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl dark:text-white" value={tickerConfig.content[index] || ''} onChange={(e) => handleTickerChange(index, e.target.value)} />
                </div>
            ))}
        </div>
    </div>
  );
};

export default TickerTab;
