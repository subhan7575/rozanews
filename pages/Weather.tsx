import React, { useState, useEffect } from 'react';
import { WeatherService } from '../services/weatherService';
import { GeminiService } from '../services/geminiService';
import { WeatherData } from '../types';
import { 
  CloudRain, Wind, Droplets, MapPin, Search, 
  Sun, Cloud, Moon, CloudLightning, Snowflake, 
  Navigation, Sunrise, Sunset, Umbrella, Loader2, Sparkles, Zap
} from 'lucide-react';
import SEO from '../components/SEO';

const Weather: React.FC = () => {
  const [city, setCity] = useState('');
  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [aiSummary, setAiSummary] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Initial Load: Try GPS, else Default to London
  useEffect(() => {
    handleUseLocation();
  }, []);

  const handleUseLocation = () => {
    if ("geolocation" in navigator) {
      setLoading(true);
      setError('');
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const res = await WeatherService.getWeatherByCoords(
              position.coords.latitude, 
              position.coords.longitude
            );
            handleWeatherData(res);
          } catch (e) {
            fetchWeather('London');
          }
        },
        (err) => {
          // If denied, fallback
          fetchWeather('London');
        }
      );
    } else {
      fetchWeather('London');
    }
  };

  const fetchWeather = async (targetCity: string) => {
    setLoading(true);
    setError('');
    try {
      const res = await WeatherService.getWeather(targetCity);
      handleWeatherData(res);
      setCity(''); 
    } catch (err: any) {
      setError(err.message || 'Location not found. Please try a major city name.');
      setData(null);
      setLoading(false);
    }
  };

  const handleWeatherData = async (weather: WeatherData) => {
    setData(weather);
    setLoading(false);
    
    // Generate AI Summary
    setIsAiLoading(true);
    try {
      const summary = await GeminiService.generateWeatherInsight(weather);
      setAiSummary(summary);
    } catch (e) {
      setAiSummary(`It looks like ${weather.condition} in ${weather.city} today.`);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (city.trim()) fetchWeather(city);
  };

  const getWeatherIcon = (code: number, isDay: boolean, size = 24, className = "") => {
    if (code === 0) return isDay ? <Sun size={size} className={`text-yellow-400 ${className}`} /> : <Moon size={size} className={`text-gray-200 ${className}`} />;
    if (code === 1 || code === 2) return isDay ? <Cloud size={size} className={`text-yellow-100 ${className}`} /> : <Cloud size={size} className={`text-gray-300 ${className}`} />;
    if (code === 3) return <Cloud size={size} className={`text-gray-400 ${className}`} />;
    if (code >= 45 && code <= 48) return <Cloud size={size} className={`text-gray-400 opacity-50 ${className}`} />;
    if (code >= 51 && code <= 67) return <CloudRain size={size} className={`text-blue-300 ${className}`} />;
    if (code >= 71 && code <= 77) return <Snowflake size={size} className={`text-white ${className}`} />;
    if (code >= 95) return <CloudLightning size={size} className={`text-yellow-300 ${className}`} />;
    return <Sun size={size} className={className} />;
  };

  const getBackgroundClass = () => {
    if (!data) return 'bg-gradient-to-br from-blue-900 via-slate-800 to-black'; 
    if (!data.isDay) return 'bg-gradient-to-b from-slate-900 via-indigo-950 to-black'; 
    const code = data.weatherCode;
    if (code === 0) return 'bg-gradient-to-br from-blue-400 via-blue-500 to-blue-700'; // Sunny
    if (code >= 1 && code <= 3) return 'bg-gradient-to-br from-slate-400 via-slate-500 to-slate-700'; // Cloudy
    if (code >= 51) return 'bg-gradient-to-br from-gray-700 via-slate-800 to-slate-900'; // Rain
    return 'bg-gradient-to-br from-blue-500 via-blue-700 to-blue-900';
  };

  return (
    <div className={`min-h-screen py-8 px-4 transition-all duration-1000 ${data ? getBackgroundClass() : 'bg-gray-900'}`}>
      <SEO title={data ? `Weather in ${data.city}` : 'Roza Weather'} description="Real-time global weather updates." />
      
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Top Header */}
        <div className="text-center mb-8">
           <h1 className="text-3xl md:text-4xl font-black text-white font-display tracking-tight flex items-center justify-center">
              <CloudRain className="mr-3 text-blue-400" size={36} /> Roza Weather
           </h1>
           <p className="text-blue-200 mt-2">AI-Powered Global Forecasts</p>
        </div>

        {/* Google-Style Search Bar */}
        <div className="max-w-xl mx-auto relative group z-20">
           <div className="absolute inset-0 bg-white/20 blur-xl rounded-full group-hover:bg-white/30 transition-all"></div>
           <form onSubmit={handleSearch} className="relative flex items-center bg-white/10 backdrop-blur-xl border border-white/20 rounded-full px-2 py-2 shadow-2xl transition-all focus-within:bg-white/20 focus-within:scale-105">
             <div className="pl-4 text-white/50"><Search size={20} /></div>
             <input 
               type="text" 
               value={city}
               onChange={(e) => setCity(e.target.value)}
               placeholder="Search Google Maps Location..."
               className="w-full bg-transparent border-none outline-none text-white placeholder-white/60 px-4 py-2 font-medium text-lg"
             />
             <button 
               type="button" 
               onClick={handleUseLocation}
               title="Use Current Location"
               className="p-2.5 bg-blue-500 hover:bg-blue-400 text-white rounded-full transition-colors shadow-lg"
             >
               <Navigation size={18} fill="currentColor" />
             </button>
           </form>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="h-64 flex flex-col items-center justify-center text-white/70 animate-pulse">
             <Loader2 size={48} className="animate-spin mb-4" />
             <p className="text-lg">Analyzing atmosphere...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
           <div className="bg-red-500/20 backdrop-blur border border-red-500/50 p-6 rounded-2xl text-white text-center max-w-lg mx-auto">
              <p className="font-bold">{error}</p>
           </div>
        )}

        {/* MAIN WEATHER UI */}
        {data && !loading && (
          <div className="animate-slide-up">
             
             {/* 1. Main Stats Card */}
             <div className="relative overflow-hidden rounded-[3rem] bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl p-8 md:p-12 text-white">
                <div className="absolute top-0 right-0 p-12 opacity-20 pointer-events-none transform scale-150">
                   {getWeatherIcon(data.weatherCode, data.isDay, 200)}
                </div>

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center md:items-end gap-8">
                   <div className="text-center md:text-left">
                      <div className="flex items-center justify-center md:justify-start gap-2 mb-2 text-blue-200">
                         <MapPin size={18} />
                         <span className="font-bold tracking-wide uppercase text-lg">{data.city}</span>
                      </div>
                      <h2 className="text-8xl md:text-9xl font-black tracking-tighter drop-shadow-lg">
                        {data.temp}°
                      </h2>
                      <p className="text-2xl md:text-3xl font-medium opacity-90">{data.condition}</p>
                      
                      <div className="flex gap-4 mt-4 justify-center md:justify-start text-white/70 font-medium">
                         <span>H: {data.forecast[0].max}°</span>
                         <span>L: {data.forecast[0].min}°</span>
                         <span>Feels Like: {data.feelsLike}°</span>
                      </div>
                   </div>

                   {/* AI Insight Bubble */}
                   <div className="max-w-xs w-full">
                      <div className="bg-black/30 backdrop-blur-md rounded-2xl p-5 border border-white/10 relative">
                         <div className="absolute -top-3 -right-3 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                            <Sparkles size={16} className="text-white" />
                         </div>
                         <h3 className="text-xs font-bold uppercase tracking-widest text-blue-300 mb-2 flex items-center gap-2">
                           <Zap size={12} /> AI Forecast
                         </h3>
                         {isAiLoading ? (
                            <div className="h-10 flex items-center gap-2 text-white/50 text-sm">
                               <Loader2 size={14} className="animate-spin"/> Generating insight...
                            </div>
                         ) : (
                            <p className="text-sm leading-relaxed font-medium text-white/90">
                               "{aiSummary}"
                            </p>
                         )}
                      </div>
                   </div>
                </div>

                {/* Grid Details */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10 pt-8 border-t border-white/10">
                   <div className="bg-white/5 rounded-2xl p-4 text-center hover:bg-white/10 transition-colors">
                      <Wind className="mx-auto mb-2 opacity-70" size={24} />
                      <p className="text-xl font-bold">{data.windSpeed} <span className="text-xs font-normal opacity-60">km/h</span></p>
                      <p className="text-xs uppercase opacity-50">Wind</p>
                   </div>
                   <div className="bg-white/5 rounded-2xl p-4 text-center hover:bg-white/10 transition-colors">
                      <Droplets className="mx-auto mb-2 opacity-70" size={24} />
                      <p className="text-xl font-bold">{data.humidity}<span className="text-xs font-normal opacity-60">%</span></p>
                      <p className="text-xs uppercase opacity-50">Humidity</p>
                   </div>
                   <div className="bg-white/5 rounded-2xl p-4 text-center hover:bg-white/10 transition-colors">
                      <Umbrella className="mx-auto mb-2 opacity-70" size={24} />
                      <p className="text-xl font-bold">{data.uvIndex}</p>
                      <p className="text-xs uppercase opacity-50">UV Index</p>
                   </div>
                   <div className="bg-white/5 rounded-2xl p-4 text-center hover:bg-white/10 transition-colors">
                      <div className="flex justify-center gap-4">
                         <div>
                            <Sunrise size={16} className="mb-1 mx-auto text-yellow-300"/>
                            <span className="text-sm font-bold">{data.sunrise}</span>
                         </div>
                         <div className="w-px bg-white/20 h-full"></div>
                         <div>
                            <Sunset size={16} className="mb-1 mx-auto text-orange-400"/>
                            <span className="text-sm font-bold">{data.sunset}</span>
                         </div>
                      </div>
                   </div>
                </div>
             </div>

             {/* 2. Hourly & Daily Forecasts */}
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6 text-white">
                
                {/* Hourly */}
                <div className="lg:col-span-2 bg-black/40 backdrop-blur-md rounded-[2rem] p-6 md:p-8 border border-white/10">
                   <h3 className="text-sm font-bold uppercase tracking-widest text-white/50 mb-6 flex items-center">
                     <ClockIcon /> Hourly Forecast
                   </h3>
                   <div className="flex overflow-x-auto gap-8 pb-4 scrollbar-hide">
                      {data.hourly.map((hour, i) => (
                         <div key={i} className="flex flex-col items-center min-w-[60px] group">
                            <span className="text-sm text-white/60 mb-3">{hour.time}</span>
                            <div className="mb-3 transform group-hover:scale-110 transition-transform">
                               {getWeatherIcon(hour.iconCode, hour.isDay, 28)}
                            </div>
                            <span className="text-xl font-bold">{hour.temp}°</span>
                         </div>
                      ))}
                   </div>
                </div>

                {/* Daily */}
                <div className="bg-black/40 backdrop-blur-md rounded-[2rem] p-6 md:p-8 border border-white/10">
                   <h3 className="text-sm font-bold uppercase tracking-widest text-white/50 mb-6 flex items-center">
                      <CalendarIcon /> 7-Day Forecast
                   </h3>
                   <div className="space-y-4">
                      {data.forecast.map((day, i) => (
                         <div key={i} className="flex items-center justify-between hover:bg-white/5 p-2 rounded-xl transition-colors">
                            <span className="w-16 font-medium text-white/90">{i === 0 ? 'Today' : day.day.slice(0, 3)}</span>
                            <div className="flex-1 flex justify-center">
                               {getWeatherIcon(day.iconCode, true, 20)}
                            </div>
                            <div className="flex gap-4 w-24 justify-end">
                               <span className="text-white/50">{day.min}°</span>
                               <span className="font-bold">{day.max}°</span>
                            </div>
                         </div>
                      ))}
                   </div>
                </div>
             </div>

          </div>
        )}
      </div>
    </div>
  );
};

const ClockIcon = () => (
  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
);

const CalendarIcon = () => (
  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
);

export default Weather;