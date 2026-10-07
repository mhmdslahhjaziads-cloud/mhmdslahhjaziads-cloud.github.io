(function () {
  'use strict';
  const key = 'hegazy.preferences.v1';
  function normalize(value) {
    return {language: value && value.language === 'en' ? 'en' : 'ar', theme: value && value.theme === 'dark' ? 'dark' : 'light'};
  }
  function readPreferences(storage) {
    try {return normalize(JSON.parse(storage.getItem(key)));} catch (_) {return normalize(null);}
  }
  function savePreferences(storage, preferences) {
    try {storage.setItem(key, JSON.stringify(normalize(preferences))); return true;} catch (_) {return false;}
  }
  window.HegazyPreferences = {readPreferences, savePreferences};
})();
