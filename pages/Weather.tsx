import React, { useState, useEffect } from 'react';
import { WeatherService } from '../services/weatherService';
import { WeatherData } from '../types';
import { 
  CloudRain, Wind, Droplets, MapPin, Search, 
  Sun, Cloud, Moon, CloudLightning, Snowflake, 
  Navigation, Sunrise, Sunset, Umbrella, Loader2 
} from 'lucide-react';

const Weather: React.FC = () => {
  const [city, setCity] = useState('');
  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [usingLocation, setUsingLocation] = useState(false);

  // Initial Load: Try GPS, else Default
  useEffect(() => {
    if ("geolocation" in navigator) {
      setLoading(true);
      setUsingLocation(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const res = await WeatherService.getWeatherByCoords(
              position.coords.latitude, 
              position.coords.longitude
            );
            setData(res);
            setLoading(false);
          } catch (e) {
            fetchWeather('London');
          }
        },
        (err) => {
          fetchWeather('London');
        }
      );
    } else {
      fetchWeather('London');
    }
  }, []);

  const fetchWeather = async (targetCity: string) => {
    setLoading(true);
    setError('');
    setUsingLocation(false);
    
    try {
      const res = await WeatherService.getWeather(targetCity);
      setData(res);
      setCity(''); 
    } catch (err: any) {
      setError(err.message || 'City not found');
      setData(null);
    } finally {
      setLoading(false);
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
    if (!data) return 'bg-gradient-to-br from-blue-500 to-blue-800'; 
    if (!data.isDay) return 'bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900'; 
    const code = data.weatherCode;
    if (code === 0) return 'bg-gradient-to-b from-blue-400 to-blue-600'; 
    if (code >= 1 && code <= 3) return 'bg-gradient-to-b from-blue-500 to-gray-400'; 
    if (code >= 51) return 'bg-gradient-to-b from-gray-700 to-gray-900'; 
    return 'bg-gradient-to-b from-blue-500 to-blue-800';
  };

  return (
    <div className="max-w-3xl mx-auto py-4 px-2 md:px-4 min-h-[80vh]">
      
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="relative mb-6">
         <input 
           type="text" 
           value={city}
           onChange={(e) => setCity(e.target.value)}
           placeholder="Search city..."
           className="w-full pl-12 pr-4 py-3 rounded-full bg-white dark:bg-gray-800 shadow-md border-none outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm md:text-base"
         />
         <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
         <button 
           type="button" 
           onClick={() => navigator.geolocation.getCurrentPosition(p => fetchWeather(`${p.coords.latitude},${p.coords.longitude}`))} 
           className="absolute right-3 top-2 bg-blue-100 dark:bg-gray-700 p-1.5 rounded-full text-blue-600 dark:text-blue-400 hover:bg-blue-200"
         >
           <Navigation size={18} />
         </button>
      </form>

      {/* Loading / Error States */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20 text-gray-500">
          <Loader2 size={40} className="animate-spin mb-4 text-blue-500" />
          <p>Fetching forecast...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg text-center mb-6">
          {error}
        </div>
      )}

      {/* Main Weather Card */}
      {data && !loading && (
        <div className={`rounded-3xl shadow-2xl overflow-hidden text-white ${getBackgroundClass()} transition-colors duration-1000`}>
          
          {/* Top Section: Current */}
          <div className="p-6 md:p-8 pb-0 text-center">
             <div className="flex justify-center items-center gap-2 mb-1">
               <h2 className="text-2xl md:text-3xl font-bold tracking-wide">{data.city}</h2>
               {usingLocation && <Navigation size={16} className="text-blue-200" />}
             </div>
             <p className="text-blue-100 text-base md:text-lg mb-4 md:mb-6">{data.condition}</p>
             
             <div className="flex justify-center items-start">
                <span className="text-7xl md:text-8xl font-black tracking-tighter ml-4">{data.temp}°</span>
             </div>
             
             <div className="flex justify-center gap-6 mt-4 md:mt-6 text-sm font-medium text-blue-100">
                <span>H: {data.forecast[0].max}°</span>
                <span>L: {data.forecast[0].min}°</span>
             </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-2 px-4 md:px-6 py-6 border-b border-white/10 bg-black/10 mt-6 backdrop-blur-sm">
             <div className="flex flex-col items-center p-2">
                <Wind size={20} className="mb-1 opacity-70" />
                <span className="text-sm font-bold">{data.windSpeed} km/h</span>
                <span className="text-[10px] md:text-xs opacity-60 uppercase">Wind</span>
             </div>
             <div className="flex flex-col items-center p-2">
                <Droplets size={20} className="mb-1 opacity-70" />
                <span className="text-sm font-bold">{data.humidity}%</span>
                <span className="text-[10px] md:text-xs opacity-60 uppercase">Humidity</span>
             </div>
             <div className="flex flex-col items-center p-2">
                <Umbrella size={20} className="mb-1 opacity-70" />
                <span className="text-sm font-bold">{data.uvIndex}</span>
                <span className="text-[10px] md:text-xs opacity-60 uppercase">UV Index</span>
             </div>
          </div>

          {/* Hourly Forecast (Horizontal Scroll) */}
          <div className="p-4 md:p-6 border-b border-white/10">
             <h3 className="text-[10px] md:text-xs uppercase font-bold text-white/60 mb-4 tracking-wider">Hourly Forecast</h3>
             <div className="flex overflow-x-auto gap-6 pb-4 scrollbar-hide">
                {data.hourly.map((hour, idx) => (
                  <div key={idx} className="flex flex-col items-center min-w-[50px]">
                    <span className="text-xs text-white/80 mb-2 whitespace-nowrap">{hour.time}</span>
                    <div className="mb-2">
                      {getWeatherIcon(hour.iconCode, hour.isDay, 24)}
                    </div>
                    <span className="font-bold text-lg">{hour.temp}°</span>
                  </div>
                ))}
             </div>
          </div>

          {/* 7-Day Forecast (List) */}
          <div className="p-4 md:p-6 bg-black/20">
             <h3 className="text-[10px] md:text-xs uppercase font-bold text-white/60 mb-4 tracking-wider">7-Day Forecast</h3>
             <div className="space-y-3 md:space-y-4">
                {data.forecast.map((day, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm md:text-base">
                     <span className="w-20 md:w-24 font-medium">{idx === 0 ? 'Today' : day.day.slice(0, 3)}</span>
                     <div className="flex items-center gap-2">
                        {getWeatherIcon(day.iconCode, true, 20)}
                     </div>
                     <div className="flex items-center gap-3 md:gap-4 w-28 md:w-32 justify-end">
                        <span className="opacity-70">{day.min}°</span>
                        <div className="w-12 md:w-16 h-1.5 bg-white/20 rounded-full overflow-hidden relative hidden sm:block">
                           <div className="absolute top-0 bottom-0 bg-yellow-400 rounded-full" style={{ left: '10%', right: '10%' }} />
                        </div>
                        <span className="font-bold">{day.max}°</span>
                     </div>
                  </div>
                ))}
             </div>
          </div>
          
          {/* Sun Times */}
          <div className="grid grid-cols-2 gap-4 p-4 md:p-6 bg-black/10">
              <div className="bg-white/10 rounded-xl p-3 md:p-4 flex items-center justify-between">
                 <div>
                   <p className="text-[10px] md:text-xs opacity-60 uppercase mb-1">Sunrise</p>
                   <p className="text-base md:text-xl font-bold">{data.sunrise}</p>
                 </div>
                 <Sunrise size={24} className="text-yellow-300" />
              </div>
              <div className="bg-white/10 rounded-xl p-3 md:p-4 flex items-center justify-between">
                 <div>
                   <p className="text-[10px] md:text-xs opacity-60 uppercase mb-1">Sunset</p>
                   <p className="text-base md:text-xl font-bold">{data.sunset}</p>
                 </div>
                 <Sunset size={24} className="text-orange-400" />
              </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default Weather;