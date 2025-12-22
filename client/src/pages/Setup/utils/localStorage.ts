/**
 * Safe localStorage wrapper with comprehensive error handling.
 * Handles quota exceeded, private browsing mode, and other edge cases.
 *
 * @author Lindsey Stead
 * @module client/pages/Setup/utils/localStorage
 */

export const SETUP_STORAGE_KEY = 'smartsheetconnect-setup-progress';

/**
 * Safe localStorage wrapper with comprehensive error handling.
 */
export const safeLocalStorage = {
  getItem: (key: string): string | null => {
    try {
      if (typeof Storage === 'undefined' || !window.localStorage) {
        return null;
      }
      return localStorage.getItem(key);
    } catch (error) {
      if (error instanceof DOMException) {
        if (error.name === 'QuotaExceededError') {
          console.warn('localStorage quota exceeded, clearing old data');
          try {
            localStorage.removeItem(key);
            return null;
          } catch {
            return null;
          }
        }
        return null;
      }
      return null;
    }
  },

  setItem: (key: string, value: string): boolean => {
    try {
      if (typeof Storage === 'undefined' || !window.localStorage) {
        return false;
      }
      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      if (error instanceof DOMException) {
        if (error.name === 'QuotaExceededError') {
          try {
            localStorage.removeItem(key);
            localStorage.setItem(key, value);
            return true;
          } catch {
            console.warn('localStorage quota exceeded, cannot save setup progress');
            return false;
          }
        }
        return false;
      }
      return false;
    }
  },

  removeItem: (key: string): boolean => {
    try {
      if (typeof Storage === 'undefined' || !window.localStorage) {
        return false;
      }
      localStorage.removeItem(key);
      return true;
    } catch {
      return false;
    }
  },
};
