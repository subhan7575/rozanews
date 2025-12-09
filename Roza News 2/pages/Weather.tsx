import React, { useState, useEffect } from 'react';
import { WeatherService } from '../services/weatherService';
import { WeatherData } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CloudRain, Wind, Droplets, MapPin, Search, AlertCircle, Loader2 } from 'lucide-react';

const Weather: React.FC = () => {
  const [city, setCity] = useState('London');
  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchWeather = async (targetCity: string) => {
    if (!targetCity.trim()) return;
    
    setLoading(true);
    setError('');
    // Clear previous data while loading new data to avoid confusion
    // setData(null); 
    
    try {
      const res = await WeatherService.getWeather(targetCity);
      setData(res);
      // Update the input field to match the found city name for clarity
      // Optional: setCity(res.city.split(',')[0]); 
    } catch (err: any) {
      setError(err.message || 'Could not fetch weather. Please try a valid city name.');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather(city);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchWeather(city);
  };

  return (
    <div className="max-w-4xl mx-auto py-6">
      <div className="bg-gradient-to-br from-blue-600 to-blue-900 rounded-2xl shadow-xl overflow-hidden text-white p-6 md:p-10 min-h-[500px] flex flex-col">
        <form onSubmit={handleSearch} className="flex mb-8 relative z-10">
          <div className="relative flex-grow max-w-md">
            <input 
              type="text" 
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Enter city (e.g., New York, Tokyo)"
              className="w-full pl-10 pr-4 py-3 rounded-full text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-300 shadow-lg placeholder-gray-500"
            />
            <MapPin className="absolute left-3 top-3.5 text-gray-500" size={20} />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="ml-4 bg-white/20 hover:bg-white/30 disabled:opacity-50 p-3 rounded-full transition-colors flex items-center justify-center w-12 h-12"
          >
            <Search size={24} />
          </button>
        </form>

        <div className="flex-grow flex flex-col justify-center">
          {loading && (
            <div className="flex flex-col items-center justify-center space-y-4 animate-pulse">
              <Loader2 size={64} className="animate-spin opacity-50" />
              <div className="text-xl font-medium">Scanning Satellites...</div>
            </div>
          )}

          {error && !loading && (
            <div className="bg-red-500/20 backdrop-blur-sm border border-red-400/30 p-8 rounded-xl flex flex-col items-center text-center animate-fade-in">
              <AlertCircle size={48} className="text-red-300 mb-4" />
              <h3 className="text-2xl font-bold text-red-100 mb-2">Location Not Found</h3>
              <p className="text-red-200 max-w-md">{error}</p>
              <button 
                onClick={() => { setCity('London'); fetchWeather('London'); }} 
                className="mt-6 px-6 py-2 bg-white/10 hover:bg-white/20 rounded-full text-sm transition-colors"
              >
                Reset to Default
              </button>
            </div>
          )}

          {data && !loading && (
            <div className="animate-fade-in">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10">
                <div>
                  <div className="flex items-baseline">
                    <h1 className="text-6xl font-bold mb-2">{data.temp}°</h1>
                    <span className="text-2xl font-light ml-1">C</span>
                  </div>
                  <h2 className="text-3xl font-semibold opacity-95">{data.city}</h2>
                  <p className="text-xl font-light text-blue-200 mt-1 capitalize">{data.condition}</p>
                </div>
                <div className="flex space-x-8 mt-8 md:mt-0 bg-white/10 p-4 rounded-xl backdrop-blur-sm">
                  <div className="flex flex-col items-center">
                    <Droplets size={24} className="mb-1 text-blue-300" />
                    <span className="text-xs uppercase tracking-wider opacity-70">Humidity</span>
                    <span className="font-bold text-lg">{data.humidity}%</span>
                  </div>
                  <div className="w-px bg-white/20 h-10 self-center"></div>
                  <div className="flex flex-col items-center">
                    <Wind size={24} className="mb-1 text-blue-300" />
                    <span className="text-xs uppercase tracking-wider opacity-70">Wind</span>
                    <span className="font-bold text-lg">{data.windSpeed} <span className="text-xs">km/h</span></span>
                  </div>
                </div>
              </div>

              <div className="bg-black/20 rounded-xl p-6 backdrop-blur-md">
                <h3 className="text-sm font-bold uppercase tracking-widest mb-4 opacity-80">7-Day Forecast</h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data.forecast} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                      <XAxis 
                        dataKey="day" 
                        stroke="rgba(255,255,255,0.4)" 
                        tick={{fill: 'rgba(255,255,255,0.8)', fontSize: 12}} 
                        tickLine={false}
                        axisLine={false}
                        dy={10}
                      />
                      <YAxis 
                        stroke="rgba(255,255,255,0.4)" 
                        tick={{fill: 'rgba(255,255,255,0.8)', fontSize: 12}} 
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(30, 58, 138, 0.9)', 
                          borderColor: 'rgba(255,255,255,0.1)', 
                          color: '#fff',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
                        }}
                        itemStyle={{ color: '#fff' }}
                        cursor={{ stroke: 'rgba(255,255,255,0.2)', strokeWidth: 2 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="temp" 
                        stroke="#60A5FA" 
                        strokeWidth={4} 
                        dot={{ r: 4, fill: '#fff', strokeWidth: 0 }}
                        activeDot={{ r: 6, fill: '#60A5FA', stroke: '#fff', strokeWidth: 2 }} 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Weather;