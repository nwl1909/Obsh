import React, { useState, useEffect } from 'react';
import { UserProgress, TopicData } from './types';
import { loadProgress, saveProgress } from './utils/storage';
import { getTopicById } from './data/topics';
import { Navbar } from './components/Navbar';
import { MapLevelView } from './components/MapLevelView';
import { TopicStudyModal } from './components/TopicStudyModal';
import { BossExamModal } from './components/BossExamModal';
import { GlossaryModal } from './components/GlossaryModal';
import { AchievementsModal } from './components/AchievementsModal';
import { GithubPagesGuideModal } from './components/GithubPagesGuideModal';
import { ProgressBackupModal } from './components/ProgressBackupModal';

export default function App() {
  const [progress, setProgress] = useState<UserProgress>(loadProgress);

  // Theme state ('dark' | 'light')
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ege_theme');
      if (saved === 'light' || saved === 'dark') return saved;
    }
    return 'dark';
  });

  const handleToggleTheme = () => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem('ege_theme', next);
      return next;
    });
  };

  // Active Main View ('map' | 'exam')
  const [activeView, setActiveView] = useState<'map' | 'exam'>('map');

  // Modals state
  const [selectedTopic, setSelectedTopic] = useState<TopicData | null>(null);
  const [bossSectionId, setBossSectionId] = useState<number | null>(null);
  const [showGlossary, setShowGlossary] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showGithubGuide, setShowGithubGuide] = useState(false);
  const [showBackup, setShowBackup] = useState(false);

  // Save progress updates to LocalStorage
  const updateProgress = (updater: (prev: UserProgress) => UserProgress) => {
    setProgress((prev) => {
      const next = updater(prev);
      saveProgress(next);
      return next;
    });
  };

  // Toggle Free-Play mode
  const handleToggleFreePlay = () => {
    updateProgress((prev) => ({
      ...prev,
      freePlayMode: !prev.freePlayMode,
    }));
  };

  // Handle completing a topic level
  const handleCompleteLevel = (topicId: number, stars: number, score: number) => {
    updateProgress((prev) => {
      const existing = prev.completedLevels[topicId];
      const bestStars = existing ? Math.max(existing.stars, stars) : stars;
      const bestScore = existing ? Math.max(existing.bestScore, score) : score;

      const xpGained = existing ? 25 : 100 + stars * 25;

      const nextUnlocked = [...prev.unlockedLevels];
      if (topicId < 47 && !nextUnlocked.includes(topicId + 1)) {
        nextUnlocked.push(topicId + 1);
      }

      // Check achievements
      const unlockedAch = [...prev.unlockedAchievements];
      if (!unlockedAch.includes('first_step')) {
        unlockedAch.push('first_step');
      }

      return {
        ...prev,
        xp: prev.xp + xpGained,
        unlockedLevels: nextUnlocked,
        completedLevels: {
          ...prev.completedLevels,
          [topicId]: {
            stars: bestStars,
            bestScore: bestScore,
            completedAt: new Date().toISOString(),
          },
        },
        unlockedAchievements: unlockedAch,
      };
    });
  };

  // Handle mastering a flashcard
  const handleMasterFlashcard = (cardId: string) => {
    updateProgress((prev) => {
      if (prev.masteredFlashcards.includes(cardId)) {
        return prev;
      }
      return {
        ...prev,
        xp: prev.xp + 15,
        masteredFlashcards: [...prev.masteredFlashcards, cardId],
      };
    });
  };

  // Handle defeating a section boss
  const handleDefeatBoss = (sectionId: number, xpReward: number) => {
    updateProgress((prev) => {
      const bosses = prev.bossesDefeated.includes(sectionId)
        ? prev.bossesDefeated
        : [...prev.bossesDefeated, sectionId];

      const achievements = [...prev.unlockedAchievements];
      const achMap: Record<number, string> = {
        1: 'section_1_complete',
        2: 'section_2_complete',
        3: 'section_3_complete',
        4: 'section_4_complete',
        5: 'section_5_complete',
        6: 'section_6_complete',
        7: 'section_7_complete',
      };
      if (achMap[sectionId] && !achievements.includes(achMap[sectionId])) {
        achievements.push(achMap[sectionId]);
      }

      return {
        ...prev,
        xp: prev.xp + xpReward,
        bossesDefeated: bosses,
        unlockedAchievements: achievements,
      };
    });
  };

  // Switch to next level from modal
  const handleNextLevel = (nextTopicId: number) => {
    const nextTopic = getTopicById(nextTopicId);
    if (nextTopic) {
      setSelectedTopic(nextTopic);
    } else {
      setSelectedTopic(null);
    }
  };

  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-200 selection:bg-amber-500 selection:text-slate-950 ${
      isDark ? 'bg-slate-950 text-slate-100' : 'bg-[#f8fafc] text-slate-900'
    }`}>
      {/* Navigation */}
      <Navbar
        progress={progress}
        onOpenGlossary={() => setShowGlossary(true)}
        onOpenAchievements={() => setShowAchievements(true)}
        onOpenGithubGuide={() => setShowGithubGuide(true)}
        onOpenBackup={() => setShowBackup(true)}
        onToggleFreePlay={handleToggleFreePlay}
        activeView={activeView}
        setActiveView={setActiveView}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {activeView === 'map' ? (
          <MapLevelView
            progress={progress}
            onSelectTopic={(topic) => setSelectedTopic(topic)}
            onSelectBoss={(sectionId) => setBossSectionId(sectionId)}
            theme={theme}
          />
        ) : (
          <div className="max-w-4xl mx-auto px-4 py-8">
            <BossExamModal
              sectionId={undefined} // Mega Exam Mode
              progress={progress}
              onClose={() => setActiveView('map')}
              onDefeatBoss={(_, xp) => {
                updateProgress((prev) => ({
                  ...prev,
                  xp: prev.xp + xp,
                }));
              }}
              theme={theme}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className={`border-t py-6 text-center text-xs transition-colors ${
        isDark ? 'border-slate-900 bg-slate-950 text-slate-500' : 'border-slate-200 bg-white text-slate-500'
      }`}>
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>
            Обществознание ЕГЭ · Все 47 тем курса для сдачи на 100 баллов
          </span>
          <div className="flex items-center gap-4 font-semibold">
            <button
              onClick={() => setShowGithubGuide(true)}
              className={isDark ? 'hover:text-slate-300' : 'hover:text-slate-900'}
            >
              Деплой на GitHub Pages
            </button>
            <button
              onClick={() => setShowGlossary(true)}
              className={isDark ? 'hover:text-slate-300' : 'hover:text-slate-900'}
            >
              Словарь понятий
            </button>
            <button
              onClick={() => setShowBackup(true)}
              className={isDark ? 'hover:text-slate-300' : 'hover:text-slate-900'}
            >
              Резервная копия
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {selectedTopic && (
        <TopicStudyModal
          topic={selectedTopic}
          progress={progress}
          onClose={() => setSelectedTopic(null)}
          onCompleteLevel={handleCompleteLevel}
          onMasterFlashcard={handleMasterFlashcard}
          onNextLevel={handleNextLevel}
          theme={theme}
        />
      )}

      {bossSectionId !== null && (
        <BossExamModal
          sectionId={bossSectionId}
          progress={progress}
          onClose={() => setBossSectionId(null)}
          onDefeatBoss={handleDefeatBoss}
          theme={theme}
        />
      )}

      {showGlossary && (
        <GlossaryModal
          onClose={() => setShowGlossary(false)}
          onOpenTopic={(id) => {
            const topic = getTopicById(id);
            if (topic) {
              setShowGlossary(false);
              setSelectedTopic(topic);
            }
          }}
          theme={theme}
        />
      )}

      {showAchievements && (
        <AchievementsModal
          progress={progress}
          onClose={() => setShowAchievements(false)}
          theme={theme}
        />
      )}

      {showGithubGuide && (
        <GithubPagesGuideModal
          onClose={() => setShowGithubGuide(false)}
          theme={theme}
        />
      )}

      {showBackup && (
        <ProgressBackupModal
          progress={progress}
          onClose={() => setShowBackup(false)}
          onProgressUpdated={(newProg) => setProgress(newProg)}
          theme={theme}
        />
      )}
    </div>
  );
}
