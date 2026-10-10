import React from 'react';
import { ACHIEVEMENTS } from '../data/achievements';
import { UserProgress, ThemeId } from '../types';
import { isDarkTheme } from '../utils/themes';
import { X, Trophy, CheckCircle2, Lock } from 'lucide-react';

interface AchievementsModalProps {
  progress: UserProgress;
  onClose: () => void;
  theme?: ThemeId;
}

export const AchievementsModal: React.FC<AchievementsModalProps> = ({
  progress,
  onClose,
  theme = 'dark',
}) => {
  const isDark = isDarkTheme(theme);
  const completedTopicsCount = Object.keys(progress.completedLevels).length;
  const threeStarTopicsCount = Object.values(progress.completedLevels).filter((c) => c.stars === 3).length;

  const isUnlocked = (achId: string) => {
    if (progress.unlockedAchievements.includes(achId)) return true;

    if (achId === 'first_step' && completedTopicsCount >= 1) return true;
    if (achId === 'streak_3' && progress.streak >= 3) return true;
    if (achId === 'cards_master' && progress.masteredFlashcards.length >= 20) return true;
    if (achId === 'star_hunter_5' && threeStarTopicsCount >= 5) return true;
    if (achId === 'section_1_complete' && progress.bossesDefeated.includes(1)) return true;
    if (achId === 'section_2_complete' && progress.bossesDefeated.includes(2)) return true;
    if (achId === 'section_3_complete' && progress.bossesDefeated.includes(3)) return true;
    if (achId === 'section_4_complete' && progress.bossesDefeated.includes(4)) return true;
    if (achId === 'section_5_complete' && progress.bossesDefeated.includes(5)) return true;
    if (achId === 'section_6_complete' && progress.bossesDefeated.includes(6)) return true;
    if (achId === 'section_7_complete' && progress.bossesDefeated.includes(7)) return true;
    if (achId === 'ege_legend_100' && completedTopicsCount >= 47) return true;

    return false;
  };

  const unlockedCount = ACHIEVEMENTS.filter((a) => isUnlocked(a.id)).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className={`relative w-full max-w-3xl rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden border transition-colors ${
        isDark ? 'bg-slate-900 border-slate-700/80 text-white' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-4.5 border-b shrink-0 ${
          isDark ? 'border-slate-800 bg-slate-900/95' : 'border-slate-100 bg-slate-50/80'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-500 flex items-center justify-center shadow-xs">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight">
                Зал Достижений и Наград
              </h2>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Открыто {unlockedCount} из {ACHIEVEMENTS.length} трофеев
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-2 rounded-xl transition-colors ${
              isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-400 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Trophy Grid */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {ACHIEVEMENTS.map((ach) => {
              const unlocked = isUnlocked(ach.id);

              return (
                <div
                  key={ach.id}
                  className={`p-4.5 rounded-2xl border flex items-start gap-4 transition-all ${
                    unlocked
                      ? isDark 
                        ? 'bg-slate-950/70 border-amber-500/40 shadow-lg shadow-amber-950/10' 
                        : 'bg-amber-50/40 border-amber-200 shadow-sm'
                      : isDark
                        ? 'bg-slate-950/30 border-slate-800/60 opacity-50'
                        : 'bg-slate-50 border-slate-200 opacity-60'
                  }`}
                >
                  <div
                    className={`w-13 h-13 rounded-2xl flex items-center justify-center text-2xl shrink-0 ${
                      unlocked
                        ? 'bg-amber-500/15 border border-amber-500/30 shadow-xs'
                        : isDark ? 'bg-slate-800/80 grayscale border border-slate-700/50' : 'bg-slate-200 grayscale border border-slate-300'
                    }`}
                  >
                    {ach.icon}
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-1">
                      <h4
                        className={`text-sm font-black truncate ${
                          unlocked ? (isDark ? 'text-white' : 'text-slate-900') : (isDark ? 'text-slate-500' : 'text-slate-400')
                        }`}
                      >
                        {ach.title}
                      </h4>
                      {unlocked ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      ) : (
                        <Lock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      )}
                    </div>
                    <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {ach.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
