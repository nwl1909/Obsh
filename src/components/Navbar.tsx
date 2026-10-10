import React, { useState, useRef, useEffect } from 'react';
import { UserProgress, ThemeId } from '../types';
import { THEMES } from '../utils/themes';
import { getUserRank } from '../utils/storage';
import { sounds } from '../utils/audio';
import { 
  Flame, 
  Volume2, 
  VolumeX, 
  BookMarked, 
  Trophy, 
  Sparkles, 
  Unlock, 
  Lock,
  Download,
  Palette,
  Check,
  Compass,
  Menu,
  X
} from 'lucide-react';

interface NavbarProps {
  progress: UserProgress;
  onOpenGlossary: () => void;
  onOpenAchievements: () => void;
  onOpenBackup: () => void;
  onToggleFreePlay: () => void;
  activeView: 'map' | 'exam';
  setActiveView: (view: 'map' | 'exam') => void;
  theme: ThemeId;
  onChangeTheme: (theme: ThemeId) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  progress,
  onOpenGlossary,
  onOpenAchievements,
  onOpenBackup,
  onToggleFreePlay,
  activeView,
  setActiveView,
  theme,
  onChangeTheme,
}) => {
  const [isMuted, setIsMuted] = useState(sounds.getIsMuted());
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const themeRef = useRef<HTMLDivElement>(null);

  const { currentRank } = getUserRank(progress.xp);

  const handleMuteToggle = () => {
    const nextMute = sounds.toggleMute();
    setIsMuted(nextMute);
    if (!nextMute) sounds.playClick();
  };

  // Close theme dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (themeRef.current && !themeRef.current.contains(event.target as Node)) {
        setThemeDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeThemeObj = THEMES.find((t) => t.id === theme) || THEMES[0];

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md border-b border-[var(--border-subtle)] bg-[var(--bg-canvas)]/90 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-15 flex items-center justify-between gap-4">
        {/* Brand */}
        <div 
          onClick={() => {
            sounds.playClick();
            setActiveView('map');
            setMobileMenuOpen(false);
          }}
          className="flex items-center gap-2.5 cursor-pointer select-none group"
        >
          <div className="w-8 h-8 rounded-lg bg-[var(--accent)] text-white font-black text-xs flex items-center justify-center shadow-xs group-hover:opacity-90 transition-opacity">
            ЕГЭ
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold tracking-tight text-[var(--text-primary)]">
              Обществознание
            </span>
            <span className="text-[11px] text-[var(--text-muted)] hidden sm:inline leading-none">
              47 тем курса
            </span>
          </div>
        </div>

        {/* Clean Center Navigation (Desktop) */}
        <nav className="hidden md:flex items-center gap-1 text-xs font-semibold">
          <button
            onClick={() => {
              sounds.playClick();
              setActiveView('map');
            }}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeView === 'map'
                ? 'bg-[var(--surface-muted)] text-[var(--text-primary)] font-bold'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-muted)]/50'
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-[var(--accent)]" />
            <span>Карта тем</span>
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              setActiveView('exam');
            }}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeView === 'exam'
                ? 'bg-[var(--surface-muted)] text-[var(--text-primary)] font-bold'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-muted)]/50'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Блиц-экзамен</span>
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              onOpenGlossary();
            }}
            className="px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-muted)]/50"
          >
            <BookMarked className="w-3.5 h-3.5 text-indigo-400" />
            <span>Словарь</span>
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              onOpenAchievements();
            }}
            className="px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-muted)]/50"
          >
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>Достижения</span>
          </button>
        </nav>

        {/* Right Tools & Telemetry */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Streak Indicator */}
          <div 
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold tabular-nums border border-orange-500/20 bg-orange-500/10 text-orange-500"
            title={`Ударный режим: ${progress.streak} дня`}
          >
            <Flame className="w-3.5 h-3.5 fill-orange-500" />
            <span>{progress.streak}</span>
          </div>

          {/* XP & Current Rank */}
          <div 
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border border-[var(--border-subtle)] bg-[var(--surface-card)] text-[var(--text-secondary)]"
            title={currentRank.title}
          >
            <span>{currentRank.badge}</span>
            <span className="font-bold text-[var(--text-primary)] tabular-nums">{progress.xp} XP</span>
          </div>

          {/* Free-Play Toggle */}
          <button
            onClick={() => {
              sounds.playClick();
              onToggleFreePlay();
            }}
            className={`p-1.5 rounded-lg border transition-colors ${
              progress.freePlayMode
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-500'
                : 'bg-[var(--surface-card)] border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
            title={progress.freePlayMode ? 'Свободный режим: все темы открыты' : 'Пошаговый режим: темы открываются по порядку'}
          >
            {progress.freePlayMode ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
          </button>

          {/* Theme Palette Dropdown */}
          <div className="relative" ref={themeRef}>
            <button
              onClick={() => {
                sounds.playClick();
                setThemeDropdownOpen(!themeDropdownOpen);
              }}
              className="p-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors flex items-center gap-1"
              title={`Цветовая тема: ${activeThemeObj.name}`}
            >
              <Palette className="w-4 h-4" />
              <span 
                className="w-2.5 h-2.5 rounded-full border border-black/20"
                style={{ backgroundColor: activeThemeObj.previewAccent }}
              />
            </button>

            {themeDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 max-h-[85vh] overflow-y-auto rounded-xl shadow-xl border border-[var(--border-strong)] bg-[var(--surface-card)] p-1.5 z-50 animate-fadeIn scrollbar-none">
                <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] px-2 py-1 mb-1">
                  Цветовая тема ({THEMES.length})
                </div>
                <div className="space-y-0.5">
                  {THEMES.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => {
                        sounds.playClick();
                        onChangeTheme(t.id);
                        setThemeDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                        theme === t.id
                          ? 'bg-[var(--surface-muted)] text-[var(--text-primary)] font-bold'
                          : 'text-[var(--text-secondary)] hover:bg-[var(--surface-muted)]/60 hover:text-[var(--text-primary)]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span 
                          className="w-4 h-4 rounded-full border border-black/20 shadow-2xs relative shrink-0 flex items-center justify-center" 
                          style={{ backgroundColor: t.previewBg }}
                        >
                          <span 
                            className="block w-1.5 h-1.5 rounded-full" 
                            style={{ backgroundColor: t.previewAccent }}
                          />
                        </span>
                        <div className="flex flex-col text-left truncate">
                          <span className="leading-tight truncate">{t.name}</span>
                          <span className="text-[10px] text-[var(--text-muted)] font-normal truncate">{t.description}</span>
                        </div>
                      </div>
                      {theme === t.id && <Check className="w-3.5 h-3.5 text-[var(--accent)] shrink-0 ml-1.5" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sound FX Toggle */}
          <button
            onClick={handleMuteToggle}
            className="p-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
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
            className="p-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            title="Резервная копия прогресса"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] text-[var(--text-primary)]"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[var(--border-subtle)] px-4 py-3 space-y-1 bg-[var(--surface-card)] animate-fadeIn">
          <button
            onClick={() => {
              sounds.playClick();
              setActiveView('map');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left py-2 px-3 rounded-lg text-xs font-semibold flex items-center gap-2 text-[var(--text-primary)] hover:bg-[var(--surface-muted)]"
          >
            <Compass className="w-4 h-4 text-[var(--accent)]" />
            <span>Карта тем</span>
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              setActiveView('exam');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left py-2 px-3 rounded-lg text-xs font-semibold flex items-center gap-2 text-[var(--text-primary)] hover:bg-[var(--surface-muted)]"
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
            className="w-full text-left py-2 px-3 rounded-lg text-xs font-semibold flex items-center gap-2 text-[var(--text-primary)] hover:bg-[var(--surface-muted)]"
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
            className="w-full text-left py-2 px-3 rounded-lg text-xs font-semibold flex items-center gap-2 text-[var(--text-primary)] hover:bg-[var(--surface-muted)]"
          >
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>Зал достижений</span>
          </button>
        </div>
      )}
    </header>
  );
};
