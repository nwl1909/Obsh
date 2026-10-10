import React, { useState, useMemo } from 'react';
import { UserProgress, TopicData, ThemeId } from '../types';
import { SECTIONS } from '../data/sections';
import { ALL_TOPICS } from '../data/topics';
import { sounds } from '../utils/audio';
import { 
  Star, 
  Lock, 
  Swords, 
  Search, 
  ChevronRight,
  CheckCircle2,
  X,
  Play
} from 'lucide-react';

interface MapLevelViewProps {
  progress: UserProgress;
  onSelectTopic: (topic: TopicData) => void;
  onSelectBoss: (sectionId: number) => void;
  theme: ThemeId;
}

export const MapLevelView: React.FC<MapLevelViewProps> = ({
  progress,
  onSelectTopic,
  onSelectBoss,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSectionFilter, setSelectedSectionFilter] = useState<number | 'all'>('all');

  // Statistics
  const completedTopicsCount = useMemo(() => {
    return Object.keys(progress.completedLevels).length;
  }, [progress.completedLevels]);

  const totalStars = useMemo(() => {
    return Object.values(progress.completedLevels).reduce((sum, item) => sum + (item.stars || 0), 0);
  }, [progress.completedLevels]);

  const filteredSections = useMemo(() => {
    return SECTIONS.filter((section) => {
      if (selectedSectionFilter !== 'all' && section.id !== selectedSectionFilter) {
        return false;
      }
      return true;
    });
  }, [selectedSectionFilter]);

  const isLevelUnlocked = (topicId: number) => {
    if (progress.freePlayMode) return true;
    return progress.unlockedLevels.includes(topicId);
  };

  const progressPercent = Math.round((completedTopicsCount / 47) * 100);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 animate-fadeIn">
      {/* Ultra-Minimalist Top Progress Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border-subtle)]">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-primary)]">
            Курс подготовки к ЕГЭ
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            47 тем по кодификатору ФИПИ · теория, карточки и тесты
          </p>
        </div>

        {/* Minimal Progress Strip */}
        <div className="flex items-center gap-4 text-xs shrink-0">
          <div className="flex flex-col sm:items-end">
            <span className="text-[var(--text-secondary)] font-medium">
              Освоено: <strong className="text-[var(--text-primary)] font-bold tabular-nums">{completedTopicsCount}</strong> из 47 ({progressPercent}%)
            </span>
            <div className="w-36 h-1.5 rounded-full bg-[var(--surface-muted)] overflow-hidden mt-1.5 border border-[var(--border-subtle)]">
              <div 
                className="h-full bg-[var(--accent)] rounded-full transition-all duration-300"
                style={{ width: `${Math.max(completedTopicsCount > 0 ? 5 : 0, progressPercent)}%` }}
              />
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-muted)]/50 text-[var(--text-secondary)]">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span className="font-semibold text-[var(--text-primary)] tabular-nums">{totalStars}</span>
          </div>
        </div>
      </div>

      {/* Clean Compact Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
        {/* Search Input */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск тем..."
            className="w-full rounded-lg pl-8 pr-7 py-1.5 text-xs transition-all border border-[var(--border-subtle)] bg-[var(--surface-card)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Section Filter Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none text-xs">
          <button
            onClick={() => {
              sounds.playClick();
              setSelectedSectionFilter('all');
            }}
            className={`px-2.5 py-1 rounded-md font-medium transition-all whitespace-nowrap cursor-pointer ${
              selectedSectionFilter === 'all'
                ? 'bg-[var(--accent)] text-white font-semibold'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-muted)]'
            }`}
          >
            Все
          </button>
          {SECTIONS.map((sec) => (
            <button
              key={sec.id}
              onClick={() => {
                sounds.playClick();
                setSelectedSectionFilter(sec.id);
              }}
              className={`px-2.5 py-1 rounded-md font-medium transition-all whitespace-nowrap cursor-pointer ${
                selectedSectionFilter === sec.id
                  ? 'bg-[var(--accent)] text-white font-semibold'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-muted)]'
              }`}
            >
              {sec.shortTitle}
            </button>
          ))}
        </div>
      </div>

      {/* Topics by Section */}
      <div className="space-y-6 pt-1">
        {filteredSections.map((section) => {
          const sectionTopics = ALL_TOPICS.filter((t) => section.topicIds.includes(t.id));
          const visibleTopics = sectionTopics.filter((t) => {
            if (!searchQuery) return true;
            const q = searchQuery.toLowerCase();
            return (
              t.title.toLowerCase().includes(q) ||
              t.subtitle.toLowerCase().includes(q) ||
              t.keyTerms.some((k) => k.toLowerCase().includes(q))
            );
          });

          if (visibleTopics.length === 0) return null;

          const sectionCompletedCount = sectionTopics.filter((t) => progress.completedLevels[t.id]).length;
          const isBossDefeated = progress.bossesDefeated.includes(section.id);

          return (
            <div key={section.id} className="space-y-2.5">
              {/* Clean Section Header */}
              <div className="flex items-center justify-between pb-1.5 border-b border-[var(--border-subtle)]">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[var(--accent)]">
                    {section.id}.
                  </span>
                  <h2 className="text-sm sm:text-base font-semibold text-[var(--text-primary)]">
                    {section.shortTitle}
                  </h2>
                  <span className="text-[11px] text-[var(--text-muted)]">
                    ({sectionCompletedCount}/{sectionTopics.length})
                  </span>
                </div>

                <button
                  onClick={() => {
                    sounds.playClick();
                    onSelectBoss(section.id);
                  }}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                    isBossDefeated
                      ? 'text-emerald-500 hover:bg-emerald-500/10'
                      : 'text-[var(--accent)] hover:bg-[var(--accent-subtle)]'
                  }`}
                >
                  <Swords className="w-3 h-3" />
                  <span>{isBossDefeated ? 'Тест сдан' : 'Тест раздела'}</span>
                </button>
              </div>

              {/* Minimalist Grid of Topics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {visibleTopics.map((topic) => {
                  const unlocked = isLevelUnlocked(topic.id);
                  const completion = progress.completedLevels[topic.id];
                  const isCompleted = !!completion;
                  const stars = completion?.stars || 0;

                  return (
                    <button
                      key={topic.id}
                      onClick={() => {
                        if (unlocked) {
                          sounds.playClick();
                          onSelectTopic(topic);
                        } else {
                          sounds.playIncorrect();
                        }
                      }}
                      disabled={!unlocked}
                      className={`w-full text-left p-3 rounded-lg border transition-all flex items-center justify-between gap-3 cursor-pointer ${
                        !unlocked
                          ? 'border-[var(--border-subtle)] bg-transparent opacity-40 cursor-not-allowed'
                          : isCompleted
                          ? 'border-[var(--border-subtle)] bg-[var(--surface-card)] hover:border-emerald-500/50 hover:bg-[var(--surface-muted)]/50'
                          : 'border-[var(--border-subtle)] bg-[var(--surface-card)] hover:border-[var(--accent)] hover:bg-[var(--surface-muted)]/50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span 
                          className={`w-6 h-6 rounded-md flex items-center justify-center font-bold text-xs shrink-0 ${
                            !unlocked
                              ? 'bg-[var(--surface-muted)] text-[var(--text-muted)]'
                              : isCompleted
                              ? 'bg-emerald-500/15 text-emerald-500'
                              : 'bg-[var(--accent-subtle)] text-[var(--accent)]'
                          }`}
                        >
                          {topic.id}
                        </span>

                        <div className="min-w-0">
                          <div className={`text-xs font-medium truncate ${
                            !unlocked 
                              ? 'text-[var(--text-muted)]' 
                              : 'text-[var(--text-primary)]'
                          }`}>
                            {topic.title.replace(/^Тема \d+\.\s*/, '')}
                          </div>
                          <div className="text-[10px] text-[var(--text-muted)] truncate">
                            {topic.estimatedMinutes} мин · {topic.flashcards.length} карточек
                          </div>
                        </div>
                      </div>

                      {/* Right Status */}
                      <div className="shrink-0 flex items-center">
                        {!unlocked ? (
                          <Lock className="w-3.5 h-3.5 text-[var(--text-muted)] opacity-60" />
                        ) : isCompleted ? (
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3].map((s) => (
                              <Star
                                key={s}
                                className={`w-3 h-3 ${
                                  s <= stars
                                    ? 'fill-amber-400 text-amber-400'
                                    : 'text-[var(--text-muted)] opacity-20'
                                }`}
                              />
                            ))}
                          </div>
                        ) : (
                          <ChevronRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--accent)]" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
