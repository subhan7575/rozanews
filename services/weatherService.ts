import { WeatherData, HourlyForecast, DailyForecast } from "../types";

// Helper to map WMO codes to text and icons
const getCondition = (code: number): { text: string; icon: string } => {
  if (code === 0) return { text: "Clear", icon: "☀️" };
  if (code === 1) return { text: "Mainly Clear", icon: "🌤️" };
  if (code === 2) return { text: "Partly Cloudy", icon: "⛅" };
  if (code === 3) return { text: "Overcast", icon: "☁️" };
  if (code >= 45 && code <= 48) return { text: "Fog", icon: "🌫️" };
  if (code >= 51 && code <= 55) return { text: "Drizzle", icon: "🌦️" };
  if (code >= 56 && code <= 57) return { text: "Freezing Drizzle", icon: "🌨️" };
  if (code >= 61 && code <= 65) return { text: "Rain", icon: "🌧️" };
  if (code >= 66 && code <= 67) return { text: "Freezing Rain", icon: "🌧️❄️" };
  if (code >= 71 && code <= 75) return { text: "Snow", icon: "❄️" };
  if (code >= 77) return { text: "Snow Grains", icon: "🌨️" };
  if (code >= 80 && code <= 82) return { text: "Rain Showers", icon: "🌦️" };
  if (code >= 85 && code <= 86) return { text: "Snow Showers", icon: "🌨️" };
  if (code >= 95) return { text: "Thunderstorm", icon: "⛈️" };
  if (code === 96 || code === 99) return { text: "Thunderstorm with Hail", icon: "⛈️🧊" };
  return { text: "Unknown", icon: "❓" };
};

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

      // Step 0: Check if query is "lat,lon" string
      if (!latitude && !longitude && query && query.includes(',')) {
        const parts = query.split(',');
        const parsedLat = parseFloat(parts[0]);
        const parsedLon = parseFloat(parts[1]);
        if (!isNaN(parsedLat) && !isNaN(parsedLon)) {
          latitude = parsedLat;
          longitude = parsedLon;
          locationName = `Current Location (${parsedLat.toFixed(2)}, ${parsedLon.toFixed(2)})`;
        }
      }

      // Step 1: Geocoding (If no coordinates provided)
      if (!latitude || !longitude) {
        if (!query || query.trim() === "") {
          throw new Error("Please enter a city name or enable location services");
        }
        
        const cleanQuery = query.trim();
        const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cleanQuery)}&count=5&language=en&format=json`;
        
        const geoRes = await fetch(geoUrl);
        if (!geoRes.ok) {
          throw new Error("Geocoding service unavailable");
        }
        
        const geoData = await geoRes.json();
        
        if (!geoData.results || geoData.results.length === 0) {
          throw new Error(`Location '${cleanQuery}' not found. Please check spelling.`);
        }

        // Use the first result
        const result = geoData.results[0];
        latitude = result.latitude;
        longitude = result.longitude;
        locationName = result.name;
        countryName = result.country;
      } else {
        // Reverse Geocoding (Find city name from Lat/Lon)
        try {
          const reverseRes = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
          );
          
          if (reverseRes.ok) {
            const reverseData = await reverseRes.json();
            locationName = reverseData.city || reverseData.locality || reverseData.principalSubdivision || "Current Location";
            countryName = reverseData.countryName || "";
          }
        } catch (e) {
          console.warn("Reverse geocoding failed, using coordinates", e);
          locationName = `Location (${latitude?.toFixed(2)}, ${longitude?.toFixed(2)})`;
        }
      }

      // Step 2: Fetch Comprehensive Weather Data
      const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,weather_code,wind_speed_10m,wind_direction_10m,pressure_msl&hourly=temperature_2m,weather_code,is_day,precipitation_probability&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_sum,wind_speed_10m_max&timezone=auto`;
      
      const res = await fetch(weatherUrl);
      if (!res.ok) throw new Error("Weather service unavailable");
      
      const data = await res.json();
      const current = data.current;
      const daily = data.daily;
      const hourly = data.hourly;

      // Process Forecast (Next 7 days)
      const forecast: DailyForecast[] = [];
      if (daily.time && daily.time.length > 0) {
        for (let i = 0; i < Math.min(7, daily.time.length); i++) {
          const condition = getCondition(daily.weather_code[i]);
          forecast.push({
            day: new Date(daily.time[i]).toLocaleDateString('en-US', { weekday: 'short' }),
            date: daily.time[i],
            min: Math.round(daily.temperature_2m_min[i]),
            max: Math.round(daily.temperature_2m_max[i]),
            condition: condition.text,
            icon: condition.icon,
            precipitation: daily.precipitation_sum?.[i] || 0,
            windSpeed: daily.wind_speed_10m_max?.[i] || 0
          });
        }
      }

      // Process Hourly (Next 24 hours only)
      const currentHourIndex = new Date().getHours();
      const hourlyForecast: HourlyForecast[] = [];
      
      if (hourly.time && hourly.time.length > 0) {
        const startIndex = Math.min(currentHourIndex, hourly.time.length - 24);
        const endIndex = Math.min(startIndex + 24, hourly.time.length);
        
        for (let i = startIndex; i < endIndex; i++) {
          const condition = getCondition(hourly.weather_code[i]);
          hourlyForecast.push({
            time: new Date(hourly.time[i]).toLocaleTimeString('en-US', { hour: 'numeric', hour12: true }),
            hour: new Date(hourly.time[i]).getHours(),
            temp: Math.round(hourly.temperature_2m[i]),
            condition: condition.text,
            icon: condition.icon,
            isDay: hourly.is_day[i] === 1,
            precipitationChance: hourly.precipitation_probability?.[i] || 0
          });
        }
      }

      const currentCondition = getCondition(current.weather_code);

      return {
        city: countryName ? `${locationName}, ${countryName}` : locationName,
        temp: Math.round(current.temperature_2m),
        condition: currentCondition.text,
        icon: currentCondition.icon,
        weatherCode: current.weather_code,
        isDay: current.is_day === 1,
        humidity: Math.round(current.relative_humidity_2m),
        windSpeed: Math.round(current.wind_speed_10m),
        windDirection: current.wind_direction_10m,
        feelsLike: Math.round(current.apparent_temperature),
        pressure: Math.round(current.pressure_msl),
        precipitation: current.precipitation || 0,
        rain: current.rain || 0,
        uvIndex: Math.round(daily.uv_index_max?.[0] || 0),
        sunrise: daily.sunrise?.[0] || '',
        sunset: daily.sunset?.[0] || '',
        sunriseTime: new Date(daily.sunrise?.[0] || '').toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        sunsetTime: new Date(daily.sunset?.[0] || '').toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        hourly: hourlyForecast,
        forecast: forecast,
        latitude: latitude!,
        longitude: longitude!,
        lastUpdated: new Date().toISOString()
      };

    } catch (e: any) {
      console.error("Weather fetch error:", e);
      throw new Error(e.message || "Failed to fetch weather data. Please try again.");
    }
  },

  // Get weather for user's current location
  getCurrentLocationWeather: async (): Promise<WeatherData> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported by your browser"));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const weather = await WeatherService.getWeatherByCoords(
              position.coords.latitude,
              position.coords.longitude
            );
            resolve(weather);
          } catch (error) {
            reject(error);
          }
        },
        (error) => {
          let errorMessage = "Unable to retrieve your location";
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = "Location permission denied. Please enable location services.";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = "Location information unavailable.";
              break;
            case error.TIMEOUT:
              errorMessage = "Location request timed out.";
              break;
          }
          reject(new Error(errorMessage));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    });
  },

  // Search suggestions for autocomplete
  searchLocations: async (query: string): Promise<Array<{name: string, country: string, lat: number, lon: number}>> => {
    if (!query || query.trim().length < 2) {
      return [];
    }

    try {
      const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query.trim())}&count=10&language=en&format=json`;
      const res = await fetch(geoUrl);
      const data = await res.json();
      
      if (!data.results) return [];
      
      return data.results.map((result: any) => ({
        name: result.name,
        country: result.country,
        lat: result.latitude,
        lon: result.longitude
      }));
    } catch (error) {
      console.error("Location search error:", error);
      return [];
    }
  },

  // Format temperature with unit
  formatTemp: (temp: number, unit: 'C' | 'F' = 'C'): string => {
    if (unit === 'F') {
      const fahrenheit = (temp * 9/5) + 32;
      return `${Math.round(fahrenheit)}°F`;
    }
    return `${Math.round(temp)}°C`;
  },

  // Get weather icon based on code and time
  getWeatherIcon: (code: number, isDay: boolean = true): string => {
    const condition = getCondition(code);
    return condition.icon;
  }
};
