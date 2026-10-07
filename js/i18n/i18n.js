// i18n utilities for language switching and translation
import { translations, getCurrentLanguage, setLanguage, initializeLanguage } from './translations.js';

const $ = window.jQuery;

// Initialize language system when app starts
export function initLanguageSystem() {
  const lang = initializeLanguage();
  setupLanguageToggle();
  return lang;
}

// Setup language toggle button listener
function setupLanguageToggle() {
  $(document).on('click', '.lang-option', function() {
    const lang = $(this).data('lang');
    changeLanguage(lang);
  });
}

// Change language and update UI
export function changeLanguage(lang) {
  setLanguage(lang);
  updateLanguageDisplay(lang);
  updateAllText(lang);
}

// Update language display in topbar
function updateLanguageDisplay(lang) {
  const display = lang === 'ur' ? 'اردو' : 'EN';
  $('#lang-display').text(display);
}

// Update all translatable text in the page
function updateAllText(lang) {
  // Update all elements with data-i18n attribute
  $('[data-i18n]').each(function() {
    const key = $(this).data('i18n');
    const text = t(key, lang);
    if ($(this).prop('tagName').toLowerCase() === 'input') {
      $(this).attr('placeholder', text);
    } else {
      $(this).text(text);
    }
  });

  // Update all elements with data-i18n-attr attribute for attributes
  $('[data-i18n-attr]').each(function() {
    const attrs = $(this).data('i18nAttr').split(',');
    attrs.forEach(attr => {
      const key = $(this).data(`i18n${attr.charAt(0).toUpperCase() + attr.slice(1)}`);
      if (key) {
        const text = t(key, lang);
        $(this).attr(attr, text);
      }
    });
  });

  // Dispatch event for components that need to know language changed
  window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: lang } }));
}

// Get translated text
export function t(key, lang) {
  const languages = lang ? [lang] : [getCurrentLanguage(), 'en'];

  for (const currentLang of languages) {
    const keys = key.split('.');
    let value = translations[currentLang];

    for (const k of keys) {
      value = value?.[k];
      if (!value) break;
    }

    if (value) return value;
  }

  return key; // Return key if translation not found
}

// Quick translation helper (uses current language)
export function tr(key) {
  return t(key, getCurrentLanguage());
}

// Translate an object's properties
export function translateObject(obj, lang) {
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    result[key] = typeof value === 'string' && value.startsWith('i18n.')
      ? t(value.replace('i18n.', ''), lang)
      : value;
  }
  return result;
}

// Add data-i18n attribute to element for auto-translation
export function markForTranslation(el, key) {
  $(el).attr('data-i18n', key);
  updateElement(el, key);
}

// Update a single element's text
export function updateElement(el, key) {
  const lang = getCurrentLanguage();
  const text = t(key, lang);
  $(el).text(text);
}

// Get current language
export function getCurrentLang() {
  return getCurrentLanguage();
}

// Listen to language changes and update UI elements
export function onLanguageChange(callback) {
  window.addEventListener('languageChanged', (e) => {
    callback(e.detail.language);
  });
}
