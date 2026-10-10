import React, { useState, useMemo } from 'react';
import { UserProgress, TopicData } from '../types';
import { SECTIONS } from '../data/sections';
import { ALL_TOPICS } from '../data/topics';
import { getUserRank } from '../utils/storage';
import { sounds } from '../utils/audio';
import { 
  Star, 
  Lock, 
  Swords, 
  Search, 
  Sparkles, 
  ArrowRight, 
  BookOpen, 
  CheckCircle2, 
  Target, 
  Layers, 
  Clock,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

interface MapLevelViewProps {
  progress: UserProgress;
  onSelectTopic: (topic: TopicData) => void;
  onSelectBoss: (sectionId: number) => void;
  theme: 'dark' | 'light';
}

export const MapLevelView: React.FC<MapLevelViewProps> = ({
  progress,
  onSelectTopic,
  onSelectBoss,
  theme,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSectionFilter, setSelectedSectionFilter] = useState<number | 'all'>('all');

  const isDark = theme === 'dark';
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 animate-fadeIn">
      {/* Hero Command Center */}
      <div className={`relative rounded-3xl p-6 sm:p-8 md:p-10 border transition-all ${
        isDark 
          ? 'bg-slate-900/60 border-white/[0.08] shadow-2xl' 
          : 'bg-white border-slate-200/90 shadow-sm'
      }`}>
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Heading and Motivation */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-500 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Подготовка к ЕГЭ по обществознанию · 47 тем</span>
            </div>

            <h1 className={`text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-tight ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              Система подготовки к <span className="text-indigo-500">100 баллам</span>
            </h1>

            <p className={`text-sm sm:text-base leading-relaxed max-w-2xl font-normal ${
              isDark ? 'text-slate-300' : 'text-slate-600'
            }`}>
              Пошаговые конспекты по кодификатору ФИПИ, интерактивные карточки терминов и экзаменационные тесты с мгновенной проверкой знаний.
            </p>

            {/* Rank and Progress bar */}
            <div className="pt-2 max-w-xl space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className={`flex items-center gap-1.5 ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                  <span>{currentRank.badge}</span>
                  <span className="font-bold">{currentRank.title}</span>
                </span>
                {nextRank && (
                  <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>
                    До {nextRank.badge} {nextRank.title}: <strong className="text-amber-500 tabular-nums">{nextRank.minXp - progress.xp} XP</strong>
                  </span>
                )}
              </div>
              <div className={`w-full rounded-full h-2.5 overflow-hidden border ${
                isDark ? 'bg-slate-950 border-white/[0.08]' : 'bg-slate-200/80 border-slate-300/60'
              }`}>
                <div 
                  className="bg-indigo-600 h-full rounded-full transition-all duration-500"
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
          <div className="lg:col-span-5 grid grid-cols-2 gap-3 sm:gap-4">
            {/* Projected Score */}
            <div className={`p-4.5 rounded-2xl border text-center transition-all ${
              isDark ? 'bg-slate-950/70 border-white/[0.08]' : 'bg-slate-50 border-slate-200/80 shadow-xs'
            }`}>
              <div className="text-[11px] font-bold uppercase tracking-wider text-amber-500 mb-1 flex items-center justify-center gap-1">
                <Target className="w-3.5 h-3.5" />
                <span>Прогноз ЕГЭ</span>
              </div>
              <div className="text-3xl sm:text-4xl font-extrabold text-amber-500 tabular-nums">
                {projectedScore}
              </div>
              <div className={`text-[11px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                из 100 баллов
              </div>
            </div>

            {/* Topics Completed */}
            <div className={`p-4.5 rounded-2xl border text-center transition-all ${
              isDark ? 'bg-slate-950/70 border-white/[0.08]' : 'bg-slate-50 border-slate-200/80 shadow-xs'
            }`}>
              <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-500 mb-1 flex items-center justify-center gap-1">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Пройдено тем</span>
              </div>
              <div className={`text-3xl sm:text-4xl font-extrabold tabular-nums ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {completedTopicsCount}<span className="text-base font-normal opacity-40">/47</span>
              </div>
              <div className="text-[11px] font-semibold text-emerald-500 mt-0.5">
                {Math.round((completedTopicsCount / 47) * 100)}% изучено
              </div>
            </div>

            {/* Stars */}
            <div className={`p-4.5 rounded-2xl border text-center transition-all ${
              isDark ? 'bg-slate-950/70 border-white/[0.08]' : 'bg-slate-50 border-slate-200/80 shadow-xs'
            }`}>
              <div className="text-[11px] font-bold uppercase tracking-wider text-amber-400 mb-1 flex items-center justify-center gap-1">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>Звёзды</span>
              </div>
              <div className="text-3xl sm:text-4xl font-extrabold text-amber-500 tabular-nums">
                {totalStars}
              </div>
              <div className={`text-[11px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                из 141 возможных
              </div>
            </div>

            {/* Flashcards */}
            <div className={`p-4.5 rounded-2xl border text-center transition-all ${
              isDark ? 'bg-slate-950/70 border-white/[0.08]' : 'bg-slate-50 border-slate-200/80 shadow-xs'
            }`}>
              <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 mb-1 flex items-center justify-center gap-1">
                <Layers className="w-3.5 h-3.5" />
                <span>Термины</span>
              </div>
              <div className={`text-3xl sm:text-4xl font-extrabold tabular-nums ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {progress.masteredFlashcards.length}
              </div>
              <div className={`text-[11px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                карточек в памяти
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters Toolbar */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск темы или понятия (инфляция, истина, налоги)..."
              className={`w-full rounded-xl pl-10 pr-4 py-2.5 text-sm transition-all border focus:outline-none ${
                isDark 
                  ? 'bg-slate-900/90 border-white/[0.08] text-white placeholder-slate-500 focus:border-indigo-500' 
                  : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-indigo-500 shadow-2xs'
              }`}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold px-1.5 py-0.5 rounded ${
                  isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Очистить
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
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap shrink-0 ${
                selectedSectionFilter === 'all'
                  ? 'bg-indigo-600 text-white font-bold'
                  : isDark 
                    ? 'bg-slate-900/90 text-slate-400 hover:text-white border border-white/[0.08]' 
                    : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
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
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap shrink-0 ${
                  selectedSectionFilter === sec.id
                    ? 'bg-indigo-600 text-white font-bold'
                    : isDark 
                      ? 'bg-slate-900/90 text-slate-400 hover:text-white border border-white/[0.08]' 
                      : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                }`}
              >
                {sec.shortTitle}
              </button>
            ))}
          </div>
        </div>

        {/* Free-Play Mode Notice */}
        {progress.freePlayMode && (
          <div className={`px-4 py-2.5 rounded-xl border text-xs flex items-center justify-between ${
            isDark 
              ? 'bg-amber-500/10 border-amber-500/25 text-amber-300' 
              : 'bg-amber-50 border-amber-200 text-amber-800'
          }`}>
            <span>
              ⚡ <strong>Свободный режим включен:</strong> Все 47 тем и боссов доступны для изучения в любом порядке.
            </span>
          </div>
        )}
      </div>

      {/* Chapters & Levels Grid */}
      <div className="space-y-10">
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
              className={`rounded-3xl border p-6 sm:p-8 space-y-6 transition-all ${
                isDark 
                  ? 'bg-slate-900/40 border-white/[0.08]' 
                  : 'bg-white border-slate-200/80 shadow-xs'
              }`}
            >
              {/* Section Header */}
              <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b ${
                isDark ? 'border-white/[0.08]' : 'border-slate-100'
              }`}>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-indigo-500 uppercase tracking-wider">
                      Раздел {section.id}
                    </span>
                    <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      · {sectionCompletedCount} из {sectionTopics.length} тем освоено
                    </span>
                  </div>

                  <h2 className={`text-xl sm:text-2xl font-bold tracking-tight ${
                    isDark ? 'text-white' : 'text-slate-900'
                  }`}>
                    {section.title}
                  </h2>

                  <p className={`text-xs sm:text-sm max-w-3xl leading-relaxed ${
                    isDark ? 'text-slate-400' : 'text-slate-600'
                  }`}>
                    {section.description}
                  </p>
                </div>

                {/* Boss Challenge Button */}
                <button
                  onClick={() => {
                    sounds.playClick();
                    onSelectBoss(section.id);
                  }}
                  className={`px-4.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all shrink-0 cursor-pointer ${
                    isBossDefeated
                      ? isDark 
                        ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25'
                        : 'bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                      : isSectionComplete || progress.freePlayMode
                      ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20'
                      : isDark
                        ? 'bg-slate-800/80 border border-white/[0.08] text-slate-400 hover:text-slate-200'
                        : 'bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Swords className="w-4 h-4" />
                  <span>
                    {isBossDefeated 
                      ? 'Босс побеждён · Повторить' 
                      : `Босс раздела: ${section.bossExam.title.split(':')[0]}`}
                  </span>
                </button>
              </div>

              {/* Levels Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                      className={`group rounded-2xl border p-5 flex flex-col justify-between transition-all duration-200 ${
                        !unlocked
                          ? isDark 
                            ? 'bg-slate-950/40 border-white/[0.04] opacity-50 cursor-not-allowed'
                            : 'bg-slate-50/60 border-slate-200 opacity-60 cursor-not-allowed'
                          : isCompleted
                          ? isDark
                            ? 'bg-slate-900/80 border-white/[0.08] hover:border-emerald-500/40 hover:-translate-y-0.5 hover:shadow-lg cursor-pointer'
                            : 'bg-white border-slate-200 hover:border-emerald-500/40 hover:-translate-y-0.5 hover:shadow-md cursor-pointer'
                          : isDark
                            ? 'bg-slate-900/90 border-indigo-500/30 hover:border-indigo-400 hover:-translate-y-0.5 hover:shadow-lg cursor-pointer'
                            : 'bg-white border-indigo-200 hover:border-indigo-400 hover:-translate-y-0.5 hover:shadow-md cursor-pointer'
                      }`}
                    >
                      {/* Card Header */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-2">
                          <div 
                            className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                              !unlocked
                                ? isDark ? 'bg-slate-800 text-slate-500' : 'bg-slate-200 text-slate-500'
                                : isCompleted
                                ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30'
                                : 'bg-indigo-600 text-white shadow-xs'
                            }`}
                          >
                            {topic.id}
                          </div>
                          <span className={`text-[11px] font-medium flex items-center gap-1 ${
                            isDark ? 'text-slate-400' : 'text-slate-500'
                          }`}>
                            <Clock className="w-3 h-3" />
                            <span>{topic.estimatedMinutes} мин</span>
                          </span>
                        </div>

                        {/* Stars / Lock */}
                        <div className="flex items-center gap-1">
                          {!unlocked ? (
                            <Lock className="w-3.5 h-3.5 text-slate-500" />
                          ) : isCompleted ? (
                            <div className="flex items-center gap-0.5">
                              {[1, 2, 3].map((s) => (
                                <Star
                                  key={s}
                                  className={`w-3.5 h-3.5 ${
                                    s <= stars
                                      ? 'fill-amber-400 text-amber-400'
                                      : isDark ? 'text-slate-700' : 'text-slate-300'
                                  }`}
                                />
                              ))}
                            </div>
                          ) : (
                            <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider">
                              Доступно
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Title & Subtitle */}
                      <div className="space-y-1 mb-4">
                        <h3 className={`font-bold text-base leading-snug transition-colors ${
                          !unlocked 
                            ? isDark ? 'text-slate-500' : 'text-slate-400'
                            : isDark ? 'text-white group-hover:text-indigo-300' : 'text-slate-900 group-hover:text-indigo-600'
                        }`}>
                          {topic.title}
                        </h3>
                        <p className={`text-xs line-clamp-2 leading-relaxed ${
                          isDark ? 'text-slate-400' : 'text-slate-500'
                        }`}>
                          {topic.subtitle}
                        </p>
                      </div>

                      {/* Card Footer */}
                      <div className={`pt-3 border-t flex items-center justify-between text-xs ${
                        isDark ? 'border-white/[0.06]' : 'border-slate-100'
                      }`}>
                        <div className={`text-[11px] truncate max-w-[170px] ${
                          isDark ? 'text-slate-500' : 'text-slate-400'
                        }`}>
                          {topic.keyTerms.slice(0, 2).join(' · ')}
                        </div>

                        <div className="flex items-center gap-1 font-semibold text-xs">
                          {!unlocked ? (
                            <span className={isDark ? 'text-slate-600' : 'text-slate-400'}>Закрыто</span>
                          ) : isCompleted ? (
                            <span className="text-emerald-500 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                              <span>Повторить</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </span>
                          ) : (
                            <span className="text-indigo-500 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                              <span>Начать</span>
                              <ChevronRight className="w-3.5 h-3.5" />
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
