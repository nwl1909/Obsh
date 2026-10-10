import React, { useState, useMemo } from 'react';
import { UserProgress, TopicData, ThemeId } from '../types';
import { SECTIONS } from '../data/sections';
import { ALL_TOPICS } from '../data/topics';
import { getUserRank } from '../utils/storage';
import { sounds } from '../utils/audio';
import { isDarkTheme } from '../utils/themes';
import { 
  Star, 
  Lock, 
  Swords, 
  Search, 
  Sparkles, 
  BookOpen, 
  Target, 
  Layers, 
  Clock,
  ChevronRight,
  CheckCircle2,
  X
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
  theme,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSectionFilter, setSelectedSectionFilter] = useState<number | 'all'>('all');

  const isDark = isDarkTheme(theme);
  const { currentRank, nextRank } = getUserRank(progress.xp);

  // Statistics
  const completedTopicsCount = useMemo(() => {
    return Object.keys(progress.completedLevels).length;
  }, [progress.completedLevels]);

  const totalStars = useMemo(() => {
    return Object.values(progress.completedLevels).reduce((sum, item) => sum + (item.stars || 0), 0);
  }, [progress.completedLevels]);

  const projectedScore = useMemo(() => {
    if (completedTopicsCount === 0) return 38;
    const completionRatio = completedTopicsCount / 47;
    const avgStars = totalStars / (completedTopicsCount * 3);
    const score = Math.round(38 + completionRatio * 44 + avgStars * 18);
    return Math.min(100, Math.max(38, score));
  }, [completedTopicsCount, totalStars]);

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Minimal Dashboard Header */}
      <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-6 sm:p-8 transition-colors shadow-xs">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Left Column: Heading and Progress bar */}
          <div className="lg:col-span-7 space-y-3">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-[var(--accent-subtle)] text-[var(--accent)]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>ЕГЭ Обществознание · 47 тем курса</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
              Курс подготовки к экзамену
            </h1>

            <p className="text-sm leading-relaxed text-[var(--text-secondary)] max-w-2xl font-normal">
              Теоретические конспекты, карточки для запоминания ключевых понятий и тесты по кодификатору ФИПИ.
            </p>

            {/* Rank and Progress bar */}
            <div className="pt-2 max-w-xl space-y-2">
              <div className="flex items-center justify-between text-xs font-medium">
                <span className="flex items-center gap-1.5 text-[var(--text-primary)]">
                  <span>{currentRank.badge}</span>
                  <span className="font-semibold">{currentRank.title}</span>
                </span>
                {nextRank && (
                  <span className="text-[var(--text-muted)] text-[11px]">
                    До {nextRank.badge} {nextRank.title}: <strong className="text-[var(--accent)] tabular-nums">{nextRank.minXp - progress.xp} XP</strong>
                  </span>
                )}
              </div>
              <div className="w-full rounded-full h-2 overflow-hidden bg-[var(--surface-muted)] border border-[var(--border-subtle)]">
                <div 
                  className="bg-[var(--accent)] h-full rounded-full transition-all duration-500"
                  style={{
                    width: nextRank 
                      ? `${Math.min(100, Math.max(5, ((progress.xp - currentRank.minXp) / (nextRank.minXp - currentRank.minXp)) * 100))}%`
                      : '100%'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Right Column: 4 KPI Cards */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-3">
            {/* Projected Score */}
            <div className="p-3.5 sm:p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-muted)]/60 text-center transition-colors">
              <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-amber-500 mb-0.5 flex items-center justify-center gap-1">
                <Target className="w-3 h-3" />
                <span>Прогноз ЕГЭ</span>
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-amber-500 tabular-nums">
                {projectedScore}
              </div>
              <div className="text-[10px] text-[var(--text-muted)]">
                из 100 баллов
              </div>
            </div>

            {/* Topics Completed */}
            <div className="p-3.5 sm:p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-muted)]/60 text-center transition-colors">
              <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[var(--accent)] mb-0.5 flex items-center justify-center gap-1">
                <BookOpen className="w-3 h-3" />
                <span>Пройдено тем</span>
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] tabular-nums">
                {completedTopicsCount}<span className="text-sm font-normal text-[var(--text-muted)]">/47</span>
              </div>
              <div className="text-[10px] font-medium text-emerald-500">
                {Math.round((completedTopicsCount / 47) * 100)}% изучено
              </div>
            </div>

            {/* Stars */}
            <div className="p-3.5 sm:p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-muted)]/60 text-center transition-colors">
              <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-amber-400 mb-0.5 flex items-center justify-center gap-1">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span>Звёзды</span>
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-amber-500 tabular-nums">
                {totalStars}
              </div>
              <div className="text-[10px] text-[var(--text-muted)]">
                из 141 возможных
              </div>
            </div>

            {/* Flashcards */}
            <div className="p-3.5 sm:p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-muted)]/60 text-center transition-colors">
              <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[var(--accent)] mb-0.5 flex items-center justify-center gap-1">
                <Layers className="w-3 h-3" />
                <span>Термины</span>
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] tabular-nums">
                {progress.masteredFlashcards.length}
              </div>
              <div className="text-[10px] text-[var(--text-muted)]">
                карточек в памяти
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters Toolbar */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск тем и терминов (инфляция, истина, налоги)..."
              className="w-full rounded-xl pl-9 pr-8 py-2 text-xs sm:text-sm transition-all border border-[var(--border-subtle)] bg-[var(--surface-card)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Section Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <button
              onClick={() => {
                sounds.playClick();
                setSelectedSectionFilter('all');
              }}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                selectedSectionFilter === 'all'
                  ? 'bg-[var(--accent)] text-white font-semibold'
                  : 'bg-[var(--surface-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)]'
              }`}
            >
              Все 7 разделов
            </button>
            {SECTIONS.map((sec) => (
              <button
                key={sec.id}
                onClick={() => {
                  sounds.playClick();
                  setSelectedSectionFilter(sec.id);
                }}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                  selectedSectionFilter === sec.id
                    ? 'bg-[var(--accent)] text-white font-semibold'
                    : 'bg-[var(--surface-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)]'
                }`}
              >
                {sec.shortTitle}
              </button>
            ))}
          </div>
        </div>

        {/* Free-Play Mode Notice */}
        {progress.freePlayMode && (
          <div className="px-3.5 py-2 rounded-xl border border-amber-500/25 bg-amber-500/10 text-amber-500 text-xs flex items-center justify-between">
            <span>
              ⚡ <strong>Свободный режим включен:</strong> Все темы и контрольные боссы доступны без ограничений.
            </span>
          </div>
        )}
      </div>

      {/* Chapters & Levels Grid */}
      <div className="space-y-8">
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
          const isSectionComplete = sectionCompletedCount === sectionTopics.length;
          const isBossDefeated = progress.bossesDefeated.includes(section.id);

          return (
            <div 
              key={section.id} 
              className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5 sm:p-7 space-y-5 transition-colors shadow-xs"
            >
              {/* Section Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[var(--border-subtle)]">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-[var(--accent)] uppercase tracking-wider">
                      Раздел {section.id}
                    </span>
                    <span className="text-xs text-[var(--text-muted)]">
                      · {sectionCompletedCount} из {sectionTopics.length} тем пройдено
                    </span>
                  </div>

                  <h2 className="text-lg sm:text-xl font-bold tracking-tight text-[var(--text-primary)]">
                    {section.title}
                  </h2>

                  <p className="text-xs sm:text-sm max-w-3xl leading-relaxed text-[var(--text-secondary)]">
                    {section.description}
                  </p>
                </div>

                {/* Boss Challenge Button */}
                <button
                  onClick={() => {
                    sounds.playClick();
                    onSelectBoss(section.id);
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all shrink-0 cursor-pointer ${
                    isBossDefeated
                      ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/25'
                      : isSectionComplete || progress.freePlayMode
                      ? 'bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white shadow-xs'
                      : 'bg-[var(--surface-muted)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <Swords className="w-3.5 h-3.5" />
                  <span>
                    {isBossDefeated 
                      ? 'Босс раздела сдан · Повторить' 
                      : `Босс раздела: ${section.bossExam.title.split(':')[0]}`}
                  </span>
                </button>
              </div>

              {/* Levels Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {visibleTopics.map((topic) => {
                  const unlocked = isLevelUnlocked(topic.id);
                  const completion = progress.completedLevels[topic.id];
                  const isCompleted = !!completion;
                  const stars = completion?.stars || 0;

                  return (
                    <div
                      key={topic.id}
                      onClick={() => {
                        if (unlocked) {
                          sounds.playClick();
                          onSelectTopic(topic);
                        } else {
                          sounds.playIncorrect();
                        }
                      }}
                      className={`group rounded-xl border p-4 flex flex-col justify-between transition-all duration-150 ${
                        !unlocked
                          ? 'border-[var(--border-subtle)] bg-[var(--surface-muted)]/30 opacity-50 cursor-not-allowed'
                          : isCompleted
                          ? 'border-[var(--border-subtle)] bg-[var(--surface-card)] hover:border-emerald-500/40 hover:-translate-y-0.5 hover:shadow-xs cursor-pointer'
                          : 'border-[var(--border-subtle)] bg-[var(--surface-card)] hover:border-[var(--accent)] hover:-translate-y-0.5 hover:shadow-xs cursor-pointer'
                      }`}
                    >
                      {/* Card Header */}
                      <div className="flex items-start justify-between gap-3 mb-2.5">
                        <div className="flex items-center gap-2">
                          <div 
                            className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                              !unlocked
                                ? 'bg-[var(--surface-muted)] text-[var(--text-muted)]'
                                : isCompleted
                                ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30'
                                : 'bg-[var(--accent)] text-white shadow-xs'
                            }`}
                          >
                            {topic.id}
                          </div>
                          <span className="text-[11px] font-medium text-[var(--text-muted)] flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{topic.estimatedMinutes} мин</span>
                          </span>
                        </div>

                        {/* Stars / Lock */}
                        <div className="flex items-center gap-1">
                          {!unlocked ? (
                            <Lock className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                          ) : isCompleted ? (
                            <div className="flex items-center gap-0.5">
                              {[1, 2, 3].map((s) => (
                                <Star
                                  key={s}
                                  className={`w-3 h-3 ${
                                    s <= stars
                                      ? 'fill-amber-400 text-amber-400'
                                      : 'text-[var(--text-muted)] opacity-30'
                                  }`}
                                />
                              ))}
                            </div>
                          ) : (
                            <span className="text-[10px] font-semibold text-[var(--accent)] uppercase tracking-wider">
                              Доступно
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Title & Subtitle */}
                      <div className="space-y-1 mb-3">
                        <h3 className={`font-semibold text-sm leading-snug transition-colors ${
                          !unlocked 
                            ? 'text-[var(--text-muted)]'
                            : 'text-[var(--text-primary)] group-hover:text-[var(--accent)]'
                        }`}>
                          {topic.title}
                        </h3>
                        <p className="text-xs line-clamp-2 leading-relaxed text-[var(--text-secondary)]">
                          {topic.subtitle}
                        </p>
                      </div>

                      {/* Card Footer */}
                      <div className="pt-2.5 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs">
                        <div className="text-[10px] sm:text-[11px] truncate max-w-[150px] text-[var(--text-muted)]">
                          {topic.keyTerms.slice(0, 2).join(' · ')}
                        </div>

                        <div className="flex items-center gap-1 font-medium text-xs">
                          {!unlocked ? (
                            <span className="text-[var(--text-muted)]">Закрыто</span>
                          ) : isCompleted ? (
                            <span className="text-emerald-500 flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                              <span>Повторить</span>
                              <ChevronRight className="w-3 h-3" />
                            </span>
                          ) : (
                            <span className="text-[var(--accent)] flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                              <span>Изучить</span>
                              <ChevronRight className="w-3 h-3" />
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
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
