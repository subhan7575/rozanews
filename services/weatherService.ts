import { WeatherData } from "../types";

export const WeatherService = {
  // Main entry point that handles fetching logic
  getWeather: async (query: string): Promise<WeatherData> => {
    return WeatherService.fetchFromApi(query);
  },

  getWeatherByCoords: async (lat: number, lon: number): Promise<WeatherData> => {
    return WeatherService.fetchFromApi(null, lat, lon);
  },

  fetchFromApi: async (query: string | null, lat?: number, lon?: number): Promise<WeatherData> => {
    try {
      let latitude = lat;
      let longitude = lon;
      let locationName = query || "Unknown Location";
      let countryName = "";

      // Step 0: Check if query is "lat,lon" string (Common when using GPS button)
      if (!latitude && !longitude && query && query.includes(',')) {
        const parts = query.split(',');
        const parsedLat = parseFloat(parts[0]);
        const parsedLon = parseFloat(parts[1]);
        if (!isNaN(parsedLat) && !isNaN(parsedLon)) {
          latitude = parsedLat;
          longitude = parsedLon;
        }
      }

      // Step 1: Geocoding (If no coordinates provided)
      if (!latitude || !longitude) {
        if (!query) throw new Error("City name required");
        
        const cleanQuery = query.trim();
        const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cleanQuery)}&count=5&language=en&format=json`;
        
        const geoRes = await fetch(geoUrl);
        const geoData = await geoRes.json();
        
        if (!geoData.results || geoData.results.length === 0) {
           throw new Error(`Location '${cleanQuery}' not found. Please check spelling.`);
        }

        // Use the first result
        latitude = geoData.results[0].latitude;
        longitude = geoData.results[0].longitude;
        locationName = geoData.results[0].name;
        countryName = geoData.results[0].country;
      } else {
        // Reverse Geocoding (Find city name from Lat/Lon)
        try {
            // Using BigDataCloud Free API for reverse geocoding
            const reverseRes = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
            const reverseData = await reverseRes.json();
            
            // Try to find the most relevant name
            locationName = reverseData.city || reverseData.locality || reverseData.principalSubdivision || "Current Location";
            countryName = reverseData.countryName || "";
        } catch (e) {
            console.warn("Reverse geocoding failed", e);
            locationName = "Current Location";
        }
      }

      // Step 2: Fetch Comprehensive Weather Data (Hourly + Daily)
      const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,weather_code,wind_speed_10m&hourly=temperature_2m,weather_code,is_day&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max&timezone=auto`;
      
      const res = await fetch(weatherUrl);
      if (!res.ok) throw new Error("Weather service unavailable");
      
      const data = await res.json();
      const current = data.current;
      const daily = data.daily;
      const hourly = data.hourly;

      // Helper to map WMO codes to text
      const getCondition = (code: number) => {
        if (code === 0) return "Clear";
        if (code === 1 || code === 2) return "Partly Cloudy";
        if (code === 3) return "Overcast";
        if (code >= 45 && code <= 48) return "Fog";
        if (code >= 51 && code <= 67) return "Rain";
        if (code >= 71 && code <= 77) return "Snow";
        if (code >= 95) return "Thunderstorm";
        return "Cloudy";
      };

      // Process Forecast (Next 7 days)
      const forecast = (daily.time || []).map((t: string, i: number) => ({
        day: new Date(t).toLocaleDateString('en-US', { weekday: 'long' }),
        min: Math.round(daily.temperature_2m_min[i]),
        max: Math.round(daily.temperature_2m_max[i]),
        iconCode: daily.weather_code[i]
      }));

      // Process Hourly (Next 24 hours only)
      const currentHourIndex = new Date().getHours(); 
      // Ensure we don't go out of bounds if api returns fewer hours
      const availableHours = hourly.time || [];
      const next24Hours = availableHours.slice(currentHourIndex, currentHourIndex + 24).map((t: string, i: number) => ({
        time: new Date(t).toLocaleTimeString('en-US', { hour: 'numeric', hour12: true }),
        temp: Math.round(hourly.temperature_2m[currentHourIndex + i]),
        iconCode: hourly.weather_code[currentHourIndex + i],
        isDay: hourly.is_day[currentHourIndex + i] === 1
      }));

      return {
        city: countryName ? `${locationName}, ${countryName}` : locationName,
        temp: Math.round(current.temperature_2m),
        condition: getCondition(current.weather_code),
        weatherCode: current.weather_code,
        isDay: current.is_day === 1,
        humidity: current.relative_humidity_2m,
        windSpeed: current.wind_speed_10m,
        feelsLike: Math.round(current.apparent_temperature),
        uvIndex: daily.uv_index_max?.[0] || 0,
        sunrise: new Date(daily.sunrise[0]).toLocaleTimeString('en-US', { hour: '2-digit', minute:'2-digit' }),
        sunset: new Date(daily.sunset[0]).toLocaleTimeString('en-US', { hour: '2-digit', minute:'2-digit' }),
        hourly: next24Hours,
        forecast: forecast
      };

    } catch (e: any) {
      console.error(e);
      throw new Error(e.message || "Failed to fetch weather data.");
    }
  }
};