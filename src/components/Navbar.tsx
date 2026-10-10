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
  Moon,
  Menu,
  X,
  Compass
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
        ? 'bg-slate-950/80 border-white/[0.08] text-slate-100' 
        : 'bg-white/85 border-slate-200/80 text-slate-900 shadow-xs'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4 md:gap-8">
        {/* Zone 1: Brand Wordmark */}
        <div 
          onClick={() => {
            sounds.playClick();
            setActiveView('map');
            setMobileMenuOpen(false);
          }}
          className="flex items-center gap-3 shrink-0 cursor-pointer group select-none"
        >
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-xs tracking-tight shadow-md shadow-indigo-600/20 group-hover:scale-105 transition-transform">
            ЕГЭ
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-base font-extrabold tracking-tight">
                Обществознание
              </span>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider ${
                isDark ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30' : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
              }`}>
                Квест
              </span>
            </div>
            <span className={`text-[11px] font-medium hidden sm:inline ${
              isDark ? 'text-slate-400' : 'text-slate-500'
            }`}>
              47 уровней к 100 баллам
            </span>
          </div>
        </div>

        {/* Zone 2: Navigation Links (Desktop) */}
        <nav className="hidden lg:flex items-center gap-1 text-sm font-semibold p-1 rounded-xl">
          <button
            onClick={() => {
              sounds.playClick();
              setActiveView('map');
            }}
            className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeView === 'map'
                ? isDark 
                  ? 'bg-white/10 text-white font-bold' 
                  : 'bg-slate-100 text-slate-950 font-bold'
                : isDark 
                  ? 'text-slate-400 hover:text-white' 
                  : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Compass className="w-4 h-4 text-indigo-500" />
            <span>Карта уровней</span>
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              setActiveView('exam');
            }}
            className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeView === 'exam'
                ? isDark 
                  ? 'bg-white/10 text-white font-bold' 
                  : 'bg-slate-100 text-slate-950 font-bold'
                : isDark 
                  ? 'text-slate-400 hover:text-white' 
                  : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Блиц-экзамен</span>
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              onOpenGlossary();
            }}
            className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookMarked className="w-4 h-4 text-indigo-400" />
            <span>Словарь понятий</span>
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              onOpenAchievements();
            }}
            className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>Достижения</span>
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              onOpenGithubGuide();
            }}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              isDark ? 'text-emerald-400 hover:text-emerald-300' : 'text-emerald-600 hover:text-emerald-700'
            }`}
          >
            <Github className="w-4 h-4" />
            <span>GitHub Pages</span>
          </button>
        </nav>

        {/* Zone 3: Telemetry & Interactive Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Streak Badge */}
          <div 
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold tabular-nums border ${
              isDark 
                ? 'bg-orange-500/10 border-orange-500/25 text-orange-400' 
                : 'bg-orange-50 border-orange-200 text-orange-700'
            }`}
            title={`Ударный режим: ${progress.streak} дня подряд`}
          >
            <Flame className="w-4 h-4 fill-orange-500 text-orange-500 animate-pulse" />
            <span>{progress.streak} дн</span>
          </div>

          {/* XP & Current Rank */}
          <div 
            className={`hidden sm:flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-semibold border ${
              isDark 
                ? 'bg-slate-900/90 border-white/[0.08] text-slate-200' 
                : 'bg-slate-100 border-slate-200 text-slate-700'
            }`}
            title={currentRank.title}
          >
            <span className="text-sm">{currentRank.badge}</span>
            <span className="text-amber-500 font-bold tabular-nums">{progress.xp} XP</span>
          </div>

          {/* Free-Play Mode Switch */}
          <button
            onClick={() => {
              sounds.playClick();
              onToggleFreePlay();
            }}
            className={`p-2 rounded-lg border transition-all ${
              progress.freePlayMode 
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-500 shadow-xs' 
                : isDark 
                  ? 'bg-slate-900/90 border-white/[0.08] text-slate-400 hover:text-slate-200' 
                  : 'bg-slate-100 border-slate-200 text-slate-500 hover:text-slate-900'
            }`}
            title={progress.freePlayMode ? 'Свободный режим: все темы открыты' : 'Пошаговый режим: темы открываются по порядку'}
          >
            {progress.freePlayMode ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
          </button>

          {/* Theme Switcher */}
          <button
            onClick={() => {
              sounds.playClick();
              onToggleTheme();
            }}
            className={`p-2 rounded-lg border transition-colors ${
              isDark 
                ? 'bg-slate-900/90 border-white/[0.08] text-slate-300 hover:text-amber-400' 
                : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900'
            }`}
            title={isDark ? 'Переключить на светлую тему' : 'Переключить на темную тему'}
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>

          {/* Sound FX Toggle */}
          <button
            onClick={handleMuteToggle}
            className={`p-2 rounded-lg border transition-colors ${
              isDark 
                ? 'bg-slate-900/90 border-white/[0.08] text-slate-300 hover:text-white' 
                : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900'
            }`}
            title={isMuted ? 'Включить звук' : 'Выключить звук'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4 text-emerald-500" />}
          </button>

          {/* Progress Backup */}
          <button
            onClick={() => {
              sounds.playClick();
              onOpenBackup();
            }}
            className={`p-2 rounded-lg border transition-colors ${
              isDark 
                ? 'bg-slate-900/90 border-white/[0.08] text-slate-300 hover:text-white' 
                : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900'
            }`}
            title="Резервная копия прогресса"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`lg:hidden p-2 rounded-lg border transition-colors ${
              isDark 
                ? 'bg-slate-900 border-white/[0.08] text-slate-300' 
                : 'bg-slate-100 border-slate-200 text-slate-700'
            }`}
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className={`lg:hidden border-b px-4 py-4 space-y-2 animate-fadeIn ${
          isDark ? 'bg-slate-950 border-white/[0.08]' : 'bg-white border-slate-200'
        }`}>
          <button
            onClick={() => {
              sounds.playClick();
              setActiveView('map');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left py-2 px-3 rounded-lg text-sm font-semibold flex items-center gap-2"
          >
            <Compass className="w-4 h-4 text-indigo-500" />
            <span>Карта уровней</span>
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              setActiveView('exam');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left py-2 px-3 rounded-lg text-sm font-semibold flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Блиц-экзамен (100 баллов)</span>
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              onOpenGlossary();
              setMobileMenuOpen(false);
            }}
            className="w-full text-left py-2 px-3 rounded-lg text-sm font-semibold flex items-center gap-2"
          >
            <BookMarked className="w-4 h-4 text-indigo-400" />
            <span>Словарь ключевых понятий</span>
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              onOpenAchievements();
              setMobileMenuOpen(false);
            }}
            className="w-full text-left py-2 px-3 rounded-lg text-sm font-semibold flex items-center gap-2"
          >
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>Зал достижений</span>
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              onOpenGithubGuide();
              setMobileMenuOpen(false);
            }}
            className="w-full text-left py-2 px-3 rounded-lg text-sm font-semibold flex items-center gap-2 text-emerald-500"
          >
            <Github className="w-4 h-4" />
            <span>Инструкция GitHub Pages</span>
          </button>
        </div>
      )}
    </header>
  );
};
