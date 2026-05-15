import { useState, useEffect } from 'react';

const DEFAULT_SETTINGS = {
  theme: 'dark', // 'dark', 'light', 'ocean', 'forest'
  stickyHeader: false,
  visibleColumns: {
    apellido: true,
    nombre: true,
    email: true,
  }
};

export function useSettings() {
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('app_settings');
    if (saved) {
      try {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      } catch (e) {
        console.error('Error parsing settings:', e);
      }
    }
    return DEFAULT_SETTINGS;
  });

  useEffect(() => {
    localStorage.setItem('app_settings', JSON.stringify(settings));
    
    // Apply theme to document element
    const html = document.documentElement;
    html.classList.remove('theme-dark', 'theme-light', 'theme-ocean', 'theme-forest');
    html.classList.add(`theme-${settings.theme}`);
  }, [settings]);

  const updateSettings = (updates) => {
    setSettings(prev => ({ ...prev, ...updates }));
  };

  const updateVisibleColumns = (column, isVisible) => {
    setSettings(prev => ({
      ...prev,
      visibleColumns: {
        ...prev.visibleColumns,
        [column]: isVisible
      }
    }));
  };

  return { settings, updateSettings, updateVisibleColumns };
}
