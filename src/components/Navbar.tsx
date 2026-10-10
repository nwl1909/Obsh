import React, { useState } from 'react';
import { UserProgress } from '../types';
import { getUserRank } from '../utils/storage';
import { sounds } from '../utils/audio';
import { 
  Flame, 
  Volume2, 
  VolumeX, 
  Github, 
  BookMarked, 
  Trophy, 
  Sparkles, 
  Unlock, 
  Lock,
  Download,
  Sun,
  Moon
} from 'lucide-react';

interface NavbarProps {
  progress: UserProgress;
  onOpenGlossary: () => void;
  onOpenAchievements: () => void;
  onOpenGithubGuide: () => void;
  onOpenBackup: () => void;
  onToggleFreePlay: () => void;
  activeView: 'map' | 'exam';
  setActiveView: (view: 'map' | 'exam') => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  progress,
  onOpenGlossary,
  onOpenAchievements,
  onOpenGithubGuide,
  onOpenBackup,
  onToggleFreePlay,
  activeView,
  setActiveView,
  theme,
  onToggleTheme,
}) => {
  const [isMuted, setIsMuted] = useState(sounds.getIsMuted());
  const { currentRank } = getUserRank(progress.xp);

  const handleMuteToggle = () => {
    const nextMute = sounds.toggleMute();
    setIsMuted(nextMute);
    if (!nextMute) sounds.playClick();
  };

  const isDark = theme === 'dark';

  return (
    <header className={`sticky top-0 z-40 transition-colors backdrop-blur-md border-b ${
      isDark 
        ? 'bg-slate-950/85 border-slate-800/80 text-white' 
        : 'bg-white/90 border-slate-200/90 text-slate-900 shadow-xs'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4 md:gap-8">
        {/* Zone 1: Wordmark */}
        <div 
          onClick={() => {
            sounds.playClick();
            setActiveView('map');
          }}
          className="flex items-center gap-3 shrink-0 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-indigo-600 flex items-center justify-center shadow-md shadow-amber-500/15 text-white font-black text-sm tracking-tighter group-hover:scale-105 transition-transform">
            100
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-base font-extrabold tracking-tight whitespace-nowrap bg-gradient-to-r from-amber-400 via-orange-300 to-indigo-400 bg-clip-text text-transparent">
                Обществознание
              </span>
              <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded uppercase ${
                isDark ? 'bg-indigo-500/20 text-indigo-300' : 'bg-indigo-50 text-indigo-600'
              }`}>
                Квест
              </span>
            </div>
            <span className={`text-[11px] font-medium hidden sm:inline whitespace-nowrap ${
              isDark ? 'text-slate-400' : 'text-slate-500'
            }`}>
              47 уровней к 100 баллам ЕГЭ
            </span>
          </div>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-semibold">
          <button
            onClick={() => {
              sounds.playClick();
              setActiveView('map');
            }}
            className={`transition-colors whitespace-nowrap py-1 relative ${
              activeView === 'map' 
                ? 'text-amber-500' 
                : isDark ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Карта уровней
            {activeView === 'map' && (
              <span className="absolute -bottom-2 left-0 right-0 h-0.5 bg-amber-500 rounded-full" />
            )}
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              setActiveView('exam');
            }}
            className={`transition-colors whitespace-nowrap py-1 flex items-center gap-1.5 relative ${
              activeView === 'exam' 
                ? 'text-amber-500' 
                : isDark ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Супер-Экзамен (100б)</span>
            {activeView === 'exam' && (
              <span className="absolute -bottom-2 left-0 right-0 h-0.5 bg-amber-500 rounded-full" />
            )}
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              onOpenGlossary();
            }}
            className={`transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              isDark ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookMarked className="w-4 h-4 text-indigo-500" />
            <span>Словарь терминов</span>
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              onOpenAchievements();
            }}
            className={`transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              isDark ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Trophy className="w-4 h-4 text-amber-500" />
            <span>Достижения</span>
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              onOpenGithubGuide();
            }}
            className={`transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              isDark ? 'text-emerald-400 hover:text-emerald-300' : 'text-emerald-600 hover:text-emerald-700'
            }`}
          >
            <Github className="w-4 h-4" />
            <span>GitHub Pages</span>
          </button>
        </nav>

        {/* Zone 3: Player Stats & Controls */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Streak Indicator */}
          <div 
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold tabular-nums border ${
              isDark 
                ? 'bg-orange-950/40 border-orange-500/30 text-orange-400 shadow-xs' 
                : 'bg-orange-50 border-orange-200 text-orange-600'
            }`}
            title={`Ударный режим: ${progress.streak} дня подряд`}
          >
            <Flame className="w-4 h-4 fill-orange-500 text-orange-500 animate-pulse" />
            <span>{progress.streak} дн</span>
          </div>

          {/* XP & Current Rank */}
          <div 
            className={`hidden sm:flex items-center gap-2 px-3 py-1 rounded-xl text-xs font-semibold border ${
              isDark 
                ? 'bg-slate-900 border-slate-800 text-slate-200' 
                : 'bg-slate-100/80 border-slate-200 text-slate-700'
            }`}
            title={currentRank.title}
          >
            <span className="text-sm">{currentRank.badge}</span>
            <span className="text-amber-500 font-bold tabular-nums">{progress.xp} XP</span>
          </div>

          {/* Freeplay Toggle */}
          <button
            onClick={() => {
              sounds.playClick();
              onToggleFreePlay();
            }}
            className={`p-2 rounded-xl border transition-all ${
              progress.freePlayMode 
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-500 shadow-xs' 
                : isDark 
                  ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200' 
                  : 'bg-slate-100 border-slate-200 text-slate-500 hover:text-slate-900'
            }`}
            title={progress.freePlayMode ? 'Свободный доступ: все 47 тем открыты' : 'Пошаговый режим: темы открываются по порядку'}
          >
            {progress.freePlayMode ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
          </button>

          {/* Theme Toggle Button */}
          <button
            onClick={() => {
              sounds.playClick();
              onToggleTheme();
            }}
            className={`p-2 rounded-xl border transition-colors ${
              isDark 
                ? 'bg-slate-900 border-slate-800 text-slate-300 hover:text-amber-400' 
                : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900'
            }`}
            title={isDark ? 'Переключить на светлую тему' : 'Переключить на темную тему'}
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>

          {/* Sound Toggle */}
          <button
            onClick={handleMuteToggle}
            className={`p-2 rounded-xl border transition-colors ${
              isDark 
                ? 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white' 
                : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900'
            }`}
            title={isMuted ? 'Включить звук' : 'Выключить звук'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4 text-emerald-500" />}
          </button>

          {/* Backup Button */}
          <button
            onClick={() => {
              sounds.playClick();
              onOpenBackup();
            }}
            className={`p-2 rounded-xl border transition-colors ${
              isDark 
                ? 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white' 
                : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900'
            }`}
            title="Резервная копия прогресса (скачать/загрузить)"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
