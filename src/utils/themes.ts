import { ThemeOption, ThemeId } from '../types';

export const THEMES: ThemeOption[] = [
  {
    id: 'dark',
    name: 'Графит',
    description: 'Минималистичный глубокий тёмный',
    previewBg: '#090d16',
    previewAccent: '#6366f1',
    isDark: true,
  },
  {
    id: 'light',
    name: 'Бумага',
    description: 'Чистый дневной светлый',
    previewBg: '#f8fafc',
    previewAccent: '#4f46e5',
    isDark: false,
  },
  {
    id: 'sepia',
    name: 'Сепия',
    description: 'Тёплая книжная страница',
    previewBg: '#fbf7ee',
    previewAccent: '#b45309',
    isDark: false,
  },
  {
    id: 'emerald',
    name: 'Изумруд',
    description: 'Глубокий хвойный фокус',
    previewBg: '#06130e',
    previewAccent: '#10b981',
    isDark: true,
  },
  {
    id: 'nord',
    name: 'Норд',
    description: 'Арктический прохладный сланцевый',
    previewBg: '#0f172a',
    previewAccent: '#0284c7',
    isDark: true,
  },
  {
    id: 'amethyst',
    name: 'Аметист',
    description: 'Мягкий вечерний индиго',
    previewBg: '#0e0c1a',
    previewAccent: '#8b5cf6',
    isDark: true,
  },
  {
    id: 'rose',
    name: 'Роза',
    description: 'Спокойный пепельно-розовый',
    previewBg: '#140e13',
    previewAccent: '#f43f5e',
    isDark: true,
  },
  {
    id: 'amber',
    name: 'Янтарь',
    description: 'Тёплый медовый акцент',
    previewBg: '#120f0a',
    previewAccent: '#f59e0b',
    isDark: true,
  },
  {
    id: 'monochrome',
    name: 'Монохром',
    description: 'OLED минимализм, только суть',
    previewBg: '#050505',
    previewAccent: '#e2e8f0',
    isDark: true,
  },
];

export const isDarkTheme = (themeId: ThemeId): boolean => {
  const found = THEMES.find((t) => t.id === themeId);
  return found ? found.isDark : true;
};
