// Weather API integration for Mille Lacs Lake
// Using OpenWeatherMap API

// Mille Lacs Lake coordinates (center of lake)
const MILLE_LACS_LAT = 46.2;
const MILLE_LACS_LON = -93.6;

export interface WeatherData {
  temperature: number;
  feelsLike: number;
  description: string;
  icon: string;
  windSpeed: number;
  windDirection: string;
  humidity: number;
  pressure: number;
  visibility: number;
  summary: string;
}

// Convert wind degrees to cardinal direction
function degreesToDirection(degrees: number): string {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(degrees / 22.5) % 16;
  return directions[index];
}

// Get weather emoji based on conditions
function getWeatherEmoji(main: string, icon: string): string {
  const isNight = icon.endsWith('n');

  switch (main.toLowerCase()) {
    case 'clear':
      return isNight ? '\u{1F319}' : '\u2600\uFE0F';
    case 'clouds':
      return icon.includes('02') ? '\u26C5' : '\u2601\uFE0F';
    case 'rain':
    case 'drizzle':
      return '\u{1F327}\uFE0F';
    case 'thunderstorm':
      return '\u26C8\uFE0F';
    case 'snow':
      return '\u{1F328}\uFE0F';
    case 'mist':
    case 'fog':
    case 'haze':
      return '\u{1F32B}\uFE0F';
    default:
      return '\u{1F324}\uFE0F';
  }
}

// Build a human-readable weather summary
function buildWeatherSummary(data: any): string {
  const temp = Math.round(data.main.temp);
  const description = data.weather[0].description;
  const windSpeed = Math.round(data.wind.speed);
  const windDir = degreesToDirection(data.wind.deg || 0);

  let summary = description.charAt(0).toUpperCase() + description.slice(1);

  if (windSpeed < 5) {
    summary += ', calm winds';
  } else if (windSpeed < 15) {
    summary += `, light winds from the ${windDir}`;
  } else if (windSpeed < 25) {
    summary += `, moderate winds from the ${windDir}`;
  } else {
    summary += `, strong winds from the ${windDir}`;
  }

  return summary;
}

export async function getWeather(): Promise<WeatherData | null> {
  const apiKey = import.meta.env.OPENWEATHER_API_KEY;

  if (!apiKey) {
    console.warn('OpenWeather API key not configured');
    return null;
  }

  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${MILLE_LACS_LAT}&lon=${MILLE_LACS_LON}&appid=${apiKey}&units=imperial`;

    const response = await fetch(url);

    if (!response.ok) {
      console.error('Weather API error:', response.status);
      return null;
    }

    const data = await response.json();

    return {
      temperature: Math.round(data.main.temp),
      feelsLike: Math.round(data.main.feels_like),
      description: data.weather[0].description,
      icon: getWeatherEmoji(data.weather[0].main, data.weather[0].icon),
      windSpeed: Math.round(data.wind.speed),
      windDirection: degreesToDirection(data.wind.deg || 0),
      humidity: data.main.humidity,
      pressure: data.main.pressure,
      visibility: Math.round((data.visibility || 10000) / 1609.34), // Convert meters to miles
      summary: buildWeatherSummary(data),
    };
  } catch (error) {
    console.error('Failed to fetch weather:', error);
    return null;
  }
}

// Get a 5-day forecast
export interface ForecastDay {
  date: string;
  high: number;
  low: number;
  description: string;
  icon: string;
}

export async function getForecast(): Promise<ForecastDay[] | null> {
  const apiKey = import.meta.env.OPENWEATHER_API_KEY;

  if (!apiKey) {
    return null;
  }

  try {
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${MILLE_LACS_LAT}&lon=${MILLE_LACS_LON}&appid=${apiKey}&units=imperial`;

    const response = await fetch(url);

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    // Group by day and get high/low
    const days: Record<string, { temps: number[]; weather: any }> = {};

    for (const item of data.list) {
      const date = item.dt_txt.split(' ')[0];
      if (!days[date]) {
        days[date] = { temps: [], weather: item.weather[0] };
      }
      days[date].temps.push(item.main.temp);
    }

    const forecast: ForecastDay[] = [];
    const entries = Object.entries(days).slice(0, 5);

    for (const [date, info] of entries) {
      const d = new Date(date);
      forecast.push({
        date: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        high: Math.round(Math.max(...info.temps)),
        low: Math.round(Math.min(...info.temps)),
        description: info.weather.description,
        icon: getWeatherEmoji(info.weather.main, info.weather.icon),
      });
    }

    return forecast;
  } catch (error) {
    console.error('Failed to fetch forecast:', error);
    return null;
  }
}
