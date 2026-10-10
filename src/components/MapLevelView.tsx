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
  Award,
  Zap,
  Target,
  Compass,
  Layers
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
    const score = Math.round(40 + completionRatio * 45 + avgStars * 15);
    return Math.min(100, Math.max(40, score));
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
      {/* Hero Welcome Banner */}
      <div className={`relative rounded-3xl p-6 sm:p-8 md:p-10 shadow-xl overflow-hidden border transition-all ${
        isDark 
          ? 'bg-gradient-to-br from-slate-900 via-indigo-950/60 to-slate-900 border-indigo-500/25 shadow-indigo-950/20' 
          : 'bg-gradient-to-br from-amber-50/70 via-indigo-50/50 to-white border-indigo-100 shadow-slate-200/50'
      }`}>
        {/* Subtle decorative glow circles */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-gradient-to-br from-amber-500/10 to-indigo-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-gradient-to-tr from-indigo-500/10 to-teal-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Greeting, Motivational Message and Rank Progress */}
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase shadow-xs border bg-indigo-500/10 border-indigo-500/20 text-indigo-400">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>ЕГЭ ПО ОБЩЕСТВОЗНАНИЮ · ИГРОВОЙ ТРЕНАЖЁР</span>
            </div>

            <h1 className={`text-2xl sm:text-3xl md:text-4xl font-black tracking-tight leading-tight ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              Твой путь от нуля к <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-indigo-400">100 баллам</span>
            </h1>

            <p className={`text-sm sm:text-base leading-relaxed max-w-2xl font-normal ${
              isDark ? 'text-slate-300' : 'text-slate-600'
            }`}>
              Осваивай темы по уровням, запоминай классификации, щелкай ловушки составителей тестов и побеждай боссов разделов!
            </p>

            {/* Rank Level Bar */}
            <div className="pt-2 max-w-xl space-y-2.5">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className={`flex items-center gap-1.5 ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                  <span className="text-base">{currentRank.badge}</span>
                  <span className="font-bold">{currentRank.title}</span>
                </span>
                {nextRank && (
                  <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>
                    До уровня {nextRank.badge}: <strong className="text-amber-500 tabular-nums">{nextRank.minXp - progress.xp} XP</strong>
                  </span>
                )}
              </div>
              <div className={`w-full rounded-full h-3 overflow-hidden p-0.5 border ${
                isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-200/80 border-slate-300/60'
              }`}>
                <div 
                  className="bg-gradient-to-r from-amber-400 via-orange-400 to-indigo-500 h-full rounded-full transition-all duration-500 shadow-sm"
                  style={{
                    width: nextRank 
                      ? `${Math.min(100, Math.max(6, ((progress.xp - currentRank.minXp) / (nextRank.minXp - currentRank.minXp)) * 100))}%`
                      : '100%'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Right Column: Key KPI Cards */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-3 sm:gap-4">
            {/* Projected Score Dial */}
            <div className={`p-4 rounded-2xl border text-center transition-all ${
              isDark 
                ? 'bg-slate-900/90 border-amber-500/30 shadow-lg shadow-amber-950/10' 
                : 'bg-white border-amber-200/80 shadow-md shadow-amber-500/5'
            }`}>
              <div className="text-[11px] font-bold uppercase tracking-wider text-amber-500 mb-1 flex items-center justify-center gap-1">
                <Target className="w-3.5 h-3.5" />
                <span>Прогноз ЕГЭ</span>
              </div>
              <div className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500 tabular-nums">
                {projectedScore}
              </div>
              <div className={`text-[11px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                из 100 баллов
              </div>
            </div>

            {/* Topics Completed */}
            <div className={`p-4 rounded-2xl border text-center transition-all ${
              isDark 
                ? 'bg-slate-900/90 border-slate-800 shadow-lg' 
                : 'bg-white border-slate-200 shadow-md shadow-slate-200/50'
            }`}>
              <div className={`text-[11px] font-bold uppercase tracking-wider mb-1 flex items-center justify-center gap-1 ${
                isDark ? 'text-indigo-400' : 'text-indigo-600'
              }`}>
                <BookOpen className="w-3.5 h-3.5" />
                <span>Пройдено тем</span>
              </div>
              <div className={`text-3xl sm:text-4xl font-black tabular-nums ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {completedTopicsCount}<span className="text-base font-normal opacity-50">/47</span>
              </div>
              <div className="text-[11px] font-semibold text-emerald-500 mt-0.5">
                {Math.round((completedTopicsCount / 47) * 100)}% изучено
              </div>
            </div>

            {/* Mastered Stars */}
            <div className={`p-4 rounded-2xl border text-center transition-all ${
              isDark 
                ? 'bg-slate-900/90 border-slate-800 shadow-lg' 
                : 'bg-white border-slate-200 shadow-md shadow-slate-200/50'
            }`}>
              <div className={`text-[11px] font-bold uppercase tracking-wider mb-1 flex items-center justify-center gap-1 ${
                isDark ? 'text-amber-400' : 'text-amber-600'
              }`}>
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>Звезды</span>
              </div>
              <div className="text-3xl sm:text-4xl font-black text-amber-500 tabular-nums">
                {totalStars}
              </div>
              <div className={`text-[11px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                из 141 макс.
              </div>
            </div>

            {/* Flashcard terms */}
            <div className={`p-4 rounded-2xl border text-center transition-all ${
              isDark 
                ? 'bg-slate-900/90 border-slate-800 shadow-lg' 
                : 'bg-white border-slate-200 shadow-md shadow-slate-200/50'
            }`}>
              <div className={`text-[11px] font-bold uppercase tracking-wider mb-1 flex items-center justify-center gap-1 ${
                isDark ? 'text-indigo-400' : 'text-indigo-600'
              }`}>
                <Layers className="w-3.5 h-3.5" />
                <span>Карточки</span>
              </div>
              <div className={`text-3xl sm:text-4xl font-black tabular-nums ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {progress.masteredFlashcards.length}
              </div>
              <div className={`text-[11px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                терминов в памяти
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Section Filter Bar */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none ${
              isDark ? 'text-slate-400' : 'text-slate-400'
            }`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск по теме или термину (например: инфляция, истина, налоги)..."
              className={`w-full rounded-2xl pl-10 pr-4 py-2.5 text-sm transition-all border focus:outline-none ${
                isDark 
                  ? 'bg-slate-900 border-slate-800 text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500' 
                  : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-xs'
              }`}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium px-1.5 py-0.5 rounded ${
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
              className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap shrink-0 ${
                selectedSectionFilter === 'all'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : isDark 
                    ? 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800' 
                    : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 shadow-2xs'
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
                className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap shrink-0 ${
                  selectedSectionFilter === sec.id
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : isDark 
                      ? 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800' 
                      : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 shadow-2xs'
                }`}
              >
                {sec.shortTitle}
              </button>
            ))}
          </div>
        </div>

        {/* Free Play Mode Notification */}
        {progress.freePlayMode && (
          <div className={`px-4 py-3 rounded-2xl border text-xs flex items-center justify-between ${
            isDark 
              ? 'bg-amber-950/30 border-amber-500/30 text-amber-300' 
              : 'bg-amber-50 border-amber-200 text-amber-800'
          }`}>
            <span className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500 shrink-0" />
              <span>
                <strong>Свободный доступ активен:</strong> Все 47 тем и боссов открыты для свободного повторения.
              </span>
            </span>
          </div>
        )}
      </div>

      {/* Chapters & Levels Grid */}
      <div className="space-y-12">
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
                  ? 'bg-slate-900/50 border-slate-800/80' 
                  : 'bg-white border-slate-200/80 shadow-md shadow-slate-200/40'
              }`}
            >
              {/* Section Header Card */}
              <div className={`flex flex-col md:flex-row md:items-center justify-between gap-5 pb-6 border-b ${
                isDark ? 'border-slate-800' : 'border-slate-100'
              }`}>
                <div className="space-y-2">
                  <div className="flex items-center gap-2.5">
                    <span className={`px-2.5 py-0.5 rounded-lg text-xs font-extrabold uppercase tracking-wide ${section.badgeBg}`}>
                      Раздел {section.id}
                    </span>
                    <span className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {sectionCompletedCount} из {sectionTopics.length} тем освоено
                    </span>
                  </div>

                  <h2 className={`text-xl sm:text-2xl font-black tracking-tight ${
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

                {/* Section Boss Button */}
                <button
                  onClick={() => {
                    sounds.playClick();
                    onSelectBoss(section.id);
                  }}
                  className={`px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2.5 transition-all shadow-md shrink-0 cursor-pointer ${
                    isBossDefeated
                      ? isDark 
                        ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/60'
                        : 'bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                      : isSectionComplete || progress.freePlayMode
                      ? 'bg-gradient-to-r from-rose-600 via-pink-600 to-amber-600 text-white hover:opacity-95 shadow-rose-950/20 animate-pulseGlow'
                      : isDark
                        ? 'bg-slate-800/80 border border-slate-700/60 text-slate-400 hover:text-slate-200'
                        : 'bg-slate-100 border border-slate-200 text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Swords className="w-4 h-4" />
                  <span>
                    {isBossDefeated 
                      ? 'Босс побежден! Повторить бой' 
                      : `Босс раздела: ${section.bossExam.title.split(':')[0]}`}
                  </span>
                </button>
              </div>

              {/* Levels Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4.5">
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
                      className={`group relative rounded-2xl border p-5 flex flex-col justify-between transition-all duration-200 ${
                        !unlocked
                          ? isDark 
                            ? 'bg-slate-950/40 border-slate-800/40 opacity-50 cursor-not-allowed'
                            : 'bg-slate-50/60 border-slate-200 opacity-60 cursor-not-allowed'
                          : isCompleted
                          ? isDark
                            ? 'bg-slate-900/90 border-emerald-500/30 hover:border-emerald-500/60 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-950/20 cursor-pointer'
                            : 'bg-white border-emerald-200 hover:border-emerald-400 hover:-translate-y-1 hover:shadow-lg hover:shadow-emerald-500/5 cursor-pointer'
                          : isDark
                            ? 'bg-slate-900/90 border-indigo-500/30 hover:border-indigo-400 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-950/30 ring-1 ring-indigo-500/20 cursor-pointer'
                            : 'bg-white border-indigo-200 hover:border-indigo-400 hover:-translate-y-1 hover:shadow-lg hover:shadow-indigo-500/10 ring-1 ring-indigo-50 cursor-pointer'
                      }`}
                    >
                      {/* Card Header */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-2.5">
                          <div 
                            className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs transition-transform group-hover:scale-105 ${
                              !unlocked
                                ? isDark ? 'bg-slate-800 text-slate-500' : 'bg-slate-200 text-slate-500'
                                : isCompleted
                                ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30'
                                : 'bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white shadow-sm'
                            }`}
                          >
                            {topic.id}
                          </div>
                          <span className={`text-[11px] font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            ~{topic.estimatedMinutes} мин
                          </span>
                        </div>

                        {/* Stars / Lock */}
                        <div className="flex items-center gap-1">
                          {!unlocked ? (
                            <div className="p-1 rounded-md bg-slate-800/40 text-slate-500">
                              <Lock className="w-3.5 h-3.5" />
                            </div>
                          ) : isCompleted ? (
                            <div className="flex items-center gap-0.5">
                              {[1, 2, 3].map((s) => (
                                <Star
                                  key={s}
                                  className={`w-3.5 h-3.5 ${
                                    s <= stars
                                      ? 'fill-amber-400 text-amber-400 filter drop-shadow-[0_0_3px_rgba(251,191,36,0.5)]'
                                      : isDark ? 'text-slate-700' : 'text-slate-300'
                                  }`}
                                />
                              ))}
                            </div>
                          ) : (
                            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-500 bg-indigo-500/10 px-2 py-0.5 rounded-md">
                              Доступен
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Title & Subtitle */}
                      <div className="space-y-1.5 mb-4">
                        <h3 className={`font-bold text-base leading-snug transition-colors ${
                          !unlocked 
                            ? isDark ? 'text-slate-500' : 'text-slate-400'
                            : isDark ? 'text-white group-hover:text-amber-400' : 'text-slate-900 group-hover:text-indigo-600'
                        }`}>
                          {topic.title}
                        </h3>
                        <p className={`text-xs line-clamp-2 leading-relaxed ${
                          isDark ? 'text-slate-400' : 'text-slate-500'
                        }`}>
                          {topic.subtitle}
                        </p>
                      </div>

                      {/* Card Footer: Terms and Action */}
                      <div className={`pt-3 border-t flex items-center justify-between text-xs ${
                        isDark ? 'border-slate-800/80' : 'border-slate-100'
                      }`}>
                        <div className={`text-[11px] font-medium truncate max-w-[170px] ${
                          isDark ? 'text-slate-500' : 'text-slate-400'
                        }`}>
                          {topic.keyTerms.slice(0, 2).join(' · ')}
                        </div>

                        <div className="flex items-center gap-1 font-bold text-xs">
                          {!unlocked ? (
                            <span className={isDark ? 'text-slate-600' : 'text-slate-400'}>Закрыто</span>
                          ) : isCompleted ? (
                            <span className="text-emerald-500 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                              <span>Повторить</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </span>
                          ) : (
                            <span className="text-indigo-500 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                              <span>Начать</span>
                              <ArrowRight className="w-3.5 h-3.5" />
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
