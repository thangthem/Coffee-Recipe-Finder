const RecommendationEngine = (() => {
  const WEATHER_MAP = {
    hot: {
      coffeeIds: ['fruity-blend', 'w-yirgacheffe', 'n-shakiso'],
      message: 'Perfect for a bright and refreshing cup today.',
      emoji: '☀️',
      label: 'Hot Weather',
    },
    mild: {
      coffeeIds: ['arabica-lam-dong', 'peru', 'w-yirgacheffe'],
      message: 'Balanced coffees for a comfortable day.',
      emoji: '🌤️',
      label: 'Mild Weather',
    },
    rainy: {
      coffeeIds: ['deep-blue-blend', 'croissant-blend', 'brazil'],
      message: 'Comforting chocolate notes for a cozy rainy day.',
      emoji: '🌧️',
      label: 'Rainy Day',
    },
    cold: {
      coffeeIds: ['robusta-honey', 'robusta-82-blend', 'deep-blue-blend'],
      message: 'Rich body and sweetness for colder moments.',
      emoji: '🧣',
      label: 'Cold Weather',
    },
  };

  const TIME_MAP = {
    morning:   { label: 'Morning',   emoji: '🌅', coffeeIds: ['w-yirgacheffe', 'fruity-blend', 'arabica-lam-dong'] },
    afternoon: { label: 'Afternoon', emoji: '☀️', coffeeIds: ['arabica-lam-dong', 'deep-blue-blend', 'brazil'] },
    evening:   { label: 'Evening',   emoji: '🌙', coffeeIds: ['liberia', 'n-shakiso', 'specialty-coffee'] },
  };

  const MANUAL_OPTIONS = [
    { key: 'sunny', label: 'Sunny', emoji: '☀️' },
    { key: 'rainy', label: 'Rainy', emoji: '🌧️' },
    { key: 'cold',  label: 'Cold',  emoji: '🧣' },
    { key: 'hot',   label: 'Hot',   emoji: '🔥' },
  ];

  function _getCondition(weather) {
    if (!weather || !weather.locationGranted) return null;
    if (weather.isRainy) return 'rainy';
    if (weather.temp > 30) return 'hot';
    if (weather.temp < 22) return 'cold';
    return 'mild';
  }

  function _getTimeOfDay() {
    const h = new Date().getHours();
    if (h >= 5  && h < 11) return 'morning';
    if (h >= 11 && h < 17) return 'afternoon';
    if (h >= 17 && h <= 22) return 'evening';
    return null;
  }

  function manualCondition(key) {
    const map = { sunny: 'mild', rainy: 'rainy', cold: 'cold', hot: 'hot' };
    return map[key] || 'mild';
  }

  function getRecommendation(weather, overrideCondition = null) {
    const condition = overrideCondition || _getCondition(weather);
    const timeOfDay = _getTimeOfDay();
    return {
      weatherRec: condition ? WEATHER_MAP[condition] : null,
      timeRec: timeOfDay ? TIME_MAP[timeOfDay] : null,
      condition,
      timeOfDay,
      weather,
    };
  }

  return { getRecommendation, manualCondition, WEATHER_MAP, TIME_MAP, MANUAL_OPTIONS };
})();
