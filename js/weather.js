/**
 * weather.js — AI Fashion Stylist Pro
 * Fetches real-time weather using the Open-Meteo API (free, no API key).
 * Uses browser Geolocation API with user permission.
 * Falls back gracefully if permission is denied.
 */

// ============================================================================
// WMO WEATHER CODE DESCRIPTIONS (Open-Meteo standard)
// ============================================================================

const WMO_CODES = {
  0:  { label: 'Clear Sky',        emoji: '☀️',  style_tip: 'sunny' },
  1:  { label: 'Mainly Clear',     emoji: '🌤️', style_tip: 'sunny' },
  2:  { label: 'Partly Cloudy',    emoji: '⛅',  style_tip: 'mild' },
  3:  { label: 'Overcast',         emoji: '☁️',  style_tip: 'mild' },
  45: { label: 'Foggy',            emoji: '🌫️', style_tip: 'mild' },
  48: { label: 'Depositing Fog',   emoji: '🌫️', style_tip: 'mild' },
  51: { label: 'Light Drizzle',    emoji: '🌦️', style_tip: 'rainy' },
  53: { label: 'Moderate Drizzle', emoji: '🌦️', style_tip: 'rainy' },
  55: { label: 'Heavy Drizzle',    emoji: '🌧️', style_tip: 'rainy' },
  61: { label: 'Slight Rain',      emoji: '🌧️', style_tip: 'rainy' },
  63: { label: 'Moderate Rain',    emoji: '🌧️', style_tip: 'rainy' },
  65: { label: 'Heavy Rain',       emoji: '🌧️', style_tip: 'rainy' },
  71: { label: 'Slight Snow',      emoji: '🌨️', style_tip: 'cold' },
  73: { label: 'Moderate Snow',    emoji: '❄️',  style_tip: 'cold' },
  75: { label: 'Heavy Snow',       emoji: '❄️',  style_tip: 'cold' },
  80: { label: 'Slight Showers',   emoji: '🌦️', style_tip: 'rainy' },
  81: { label: 'Moderate Showers', emoji: '🌧️', style_tip: 'rainy' },
  95: { label: 'Thunderstorm',     emoji: '⛈️',  style_tip: 'rainy' },
};

// ============================================================================
// STYLE SUGGESTIONS BY WEATHER TYPE
// ============================================================================

const STYLE_BY_WEATHER = {
  sunny: {
    suggestion: 'It\'s sunny today! Wear light, breathable fabrics like cotton or linen.',
    colours: ['White', 'Sky Blue', 'Coral', 'Mint', 'Yellow'],
    fabrics: ['Cotton', 'Linen', 'Chambray'],
    avoid: 'Dark heavy fabrics — they absorb heat.',
  },
  mild: {
    suggestion: 'Mild weather today — perfect for layering with light jackets or cardigans.',
    colours: ['Beige', 'Olive', 'Navy', 'Grey', 'Sage'],
    fabrics: ['Denim', 'Chino', 'Light Wool'],
    avoid: 'Overly heavy coats or sleeveless tops.',
  },
  rainy: {
    suggestion: 'It\'s raining! Wear water-resistant outerwear and avoid suede or light fabrics.',
    colours: ['Navy', 'Charcoal', 'Burgundy', 'Forest Green'],
    fabrics: ['Nylon', 'Polyester', 'Waterproof Shell'],
    avoid: 'Light colours, suede, and raw silk.',
  },
  cold: {
    suggestion: 'Cold weather alert! Layer up with thermals, sweaters, and a warm coat.',
    colours: ['Burgundy', 'Camel', 'Charcoal', 'Navy', 'Brown'],
    fabrics: ['Wool', 'Fleece', 'Thermal Knit', 'Cashmere'],
    avoid: 'Thin single-layer clothes.',
  },
  hot: {
    suggestion: 'Very hot today! Stick to loose, airy, light-coloured clothing.',
    colours: ['White', 'Ivory', 'Cream', 'Peach', 'Light Blue'],
    fabrics: ['Cotton', 'Linen', 'Rayon'],
    avoid: 'Synthetic fabrics and dark heavy clothes.',
  },
};

// ============================================================================
// MAIN EXPORT: getWeather()
// Returns an object with temperature, condition, emoji, style advice
// ============================================================================

/**
 * Get current weather based on user's geolocation.
 * @returns {Promise<Object>} weather data object
 */
export async function getWeather() {
  try {
    const coords = await getLocation();
    const data   = await fetchOpenMeteo(coords.lat, coords.lon);
    return data;
  } catch (err) {
    console.warn('[Weather] Could not get weather:', err.message);
    return getFallbackWeather();
  }
}

/**
 * Request geolocation from the browser.
 * @returns {Promise<{lat: number, lon: number}>}
 */
function getLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      pos => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      err => reject(new Error('Location permission denied')),
      { timeout: 8000 }
    );
  });
}

/**
 * Fetch weather from Open-Meteo (no API key needed).
 * @param {number} lat
 * @param {number} lon
 * @returns {Promise<Object>}
 */
async function fetchOpenMeteo(lat, lon) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=temperature_2m&timezone=auto`;
  const res  = await fetch(url);
  if (!res.ok) throw new Error('Open-Meteo API error');
  const json = await res.json();

  const cw      = json.current_weather;
  const temp    = Math.round(cw.temperature);
  const code    = cw.weathercode;
  const wmo     = WMO_CODES[code] || { label: 'Unknown', emoji: '🌡️', style_tip: 'mild' };

  // Determine style_tip by temperature override
  let styleTip = wmo.style_tip;
  if (temp >= 35) styleTip = 'hot';
  else if (temp <= 10) styleTip = 'cold';

  const styleData = STYLE_BY_WEATHER[styleTip] || STYLE_BY_WEATHER.mild;

  return {
    temperature:  temp,
    condition:    wmo.label,
    emoji:        wmo.emoji,
    style_tip:    styleTip,
    suggestion:   styleData.suggestion,
    colours:      styleData.colours,
    fabrics:      styleData.fabrics,
    avoid:        styleData.avoid,
    location:     `${lat.toFixed(2)}, ${lon.toFixed(2)}`,
    source:       'Open-Meteo',
  };
}

/**
 * Fallback weather when geolocation/API fails.
 */
function getFallbackWeather() {
  return {
    temperature:  null,
    condition:    'Unknown',
    emoji:        '🌡️',
    style_tip:    'mild',
    suggestion:   'Weather data unavailable. Choose comfortable clothing suited to your local conditions.',
    colours:      ['Beige', 'Navy', 'Grey', 'White'],
    fabrics:      ['Cotton', 'Denim'],
    avoid:        'None specific',
    location:     'Auto-detect failed',
    source:       'Fallback',
  };
}
