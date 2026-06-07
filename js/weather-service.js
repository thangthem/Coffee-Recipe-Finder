const WeatherService = (() => {
  const CACHE_KEY = 'big_weather_cache';
  const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

  // WMO weather codes considered rainy
  function _isRainy(code) {
    return (code >= 51 && code <= 67) || (code >= 80 && code <= 82) || (code >= 95 && code <= 99);
  }

  function _getCache() {
    try {
      const c = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
      if (!c || Date.now() - c.ts > CACHE_TTL) return null;
      return c.data;
    } catch { return null; }
  }

  function _setCache(data) {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data }));
    } catch { /* ignore quota errors */ }
  }

  async function _getLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) { reject(new Error('no-geolocation')); return; }
      navigator.geolocation.getCurrentPosition(
        pos => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
        err => reject(err),
        { timeout: 8000 }
      );
    });
  }

  async function _fetchWeather(lat, lon) {
    const cached = _getCache();
    if (cached) return cached;

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&timezone=auto`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('weather-fetch-failed');
    const data = await res.json();

    const result = {
      temp: Math.round(data.current.temperature_2m),
      isRainy: _isRainy(data.current.weather_code),
      weatherCode: data.current.weather_code,
    };
    _setCache(result);
    return result;
  }

  async function init() {
    try {
      const { lat, lon } = await _getLocation();
      const weather = await _fetchWeather(lat, lon);
      return { ...weather, locationGranted: true };
    } catch {
      return { locationGranted: false };
    }
  }

  return { init };
})();
