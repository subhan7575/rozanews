import { WeatherData } from "../types";

export const WeatherService = {
  getWeather: async (city: string): Promise<WeatherData> => {
    // Helper function to fetch geocoding results
    const fetchGeo = async (query: string) => {
      const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=en&format=json`;
      const res = await fetch(url);
      if (!res.ok) return null;
      const data = await res.json();
      return data.results && Array.isArray(data.results) ? data.results : [];
    };

    try {
      if (!city || !city.trim()) {
        throw new Error("Please enter a valid city name");
      }
      
      let cleanCity = city.trim();
      
      // 1. Initial Attempt: Exact Search
      let results = await fetchGeo(cleanCity);

      // 2. Smart Fallback Strategy if not found
      if (!results || results.length === 0) {
        
        // Strategy A: Handle Zip Codes / Numbers (e.g. "Pakistan 46000")
        // If input has numbers, strip them and try searching the text only
        const noDigits = cleanCity.replace(/[0-9]/g, '').trim();
        if (noDigits.length > 2 && noDigits !== cleanCity) {
           const retryResults = await fetchGeo(noDigits);
           if (retryResults && retryResults.length > 0) {
             results = retryResults;
             cleanCity = noDigits; // Update for context
           }
        }

        // Strategy B: Handle "Country City" or "City Country" (e.g. "Pakistan Jhang")
        // If still no results, split by space and try segments
        if ((!results || results.length === 0) && cleanCity.includes(' ')) {
          const parts = cleanCity.split(/[\s,]+/).filter(p => p.length > 2); // Ignore short words
          
          if (parts.length > 0) {
             // Try the LAST part first (often the City in "Country City" format)
             const lastPart = parts[parts.length - 1];
             let retryResults = await fetchGeo(lastPart);
             
             // If last part failed, try the FIRST part (often the City in "City Country" format)
             if ((!retryResults || retryResults.length === 0) && parts.length > 1) {
                retryResults = await fetchGeo(parts[0]);
             }

             if (retryResults && retryResults.length > 0) {
               results = retryResults;
             }
          }
        }
      }

      // 3. Final Check
      if (!results || results.length === 0) {
        throw new Error(`Location '${city}' not found. Please try entering just the city name (e.g., 'London').`);
      }

      // Use the best result (first one is usually best match by Open-Meteo relevance)
      const location = results[0];
      const { latitude, longitude, name, country } = location;

      // 4. Fetch Weather Data
      const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min&timezone=auto`;
      const weatherRes = await fetch(weatherUrl);

      if (!weatherRes.ok) {
        throw new Error(`Weather service currently unavailable.`);
      }

      const weatherData = await weatherRes.json();

      if (!weatherData.current || !weatherData.daily) {
         throw new Error("Incomplete weather data received.");
      }

      const current = weatherData.current;
      const daily = weatherData.daily;

      // WMO Weather interpretation
      const getCondition = (code: number) => {
        if (code === 0) return "Clear Sky";
        if (code === 1) return "Mainly Clear";
        if (code === 2) return "Partly Cloudy";
        if (code === 3) return "Overcast";
        if (code === 45 || code === 48) return "Foggy";
        if (code >= 51 && code <= 55) return "Drizzle";
        if (code >= 61 && code <= 67) return "Rain";
        if (code >= 71 && code <= 77) return "Snow";
        if (code >= 80 && code <= 82) return "Showers";
        if (code >= 95) return "Thunderstorm";
        return "Variable";
      };

      const forecast = (daily.time || []).map((t: string, i: number) => {
        const max = daily.temperature_2m_max?.[i] ?? current.temperature_2m;
        const min = daily.temperature_2m_min?.[i] ?? current.temperature_2m;
        return {
          day: new Date(t).toLocaleDateString('en-US', { weekday: 'short' }),
          temp: Math.round((max + min) / 2),
        };
      }).slice(0, 7);

      return {
        // Use the API returned name to be accurate (e.g. if user typed "pakistan jhang" and we found "Jhang")
        city: `${name}${country ? `, ${country}` : ''}`,
        temp: Math.round(current.temperature_2m),
        condition: getCondition(current.weather_code),
        humidity: current.relative_humidity_2m,
        windSpeed: current.wind_speed_10m,
        forecast,
      };

    } catch (error: any) {
      console.error("WeatherService Error:", error);
      throw error;
    }
  }
};