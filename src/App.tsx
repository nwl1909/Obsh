import React, { useState, useEffect } from 'react';
import { UserProgress, TopicData, ThemeId } from './types';
import { loadProgress, saveProgress } from './utils/storage';
import { getTopicById } from './data/topics';
import { isDarkTheme } from './utils/themes';
import { Navbar } from './components/Navbar';
import { MapLevelView } from './components/MapLevelView';
import { TopicStudyModal } from './components/TopicStudyModal';
import { BossExamModal } from './components/BossExamModal';
import { GlossaryModal } from './components/GlossaryModal';
import { AchievementsModal } from './components/AchievementsModal';
import { ProgressBackupModal } from './components/ProgressBackupModal';

export default function App() {
  const [progress, setProgress] = useState<UserProgress>(loadProgress);

  // Expanded Theme state
  const [theme, setTheme] = useState<ThemeId>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ege_theme_v2') || localStorage.getItem('ege_theme');
      if (
        saved &&
        ['dark', 'light', 'sepia', 'emerald', 'nord', 'amethyst', 'rose', 'amber', 'monochrome'].includes(saved)
      ) {
        return saved as ThemeId;
      }
    }
    return 'dark';
  });

  const handleChangeTheme = (nextTheme: ThemeId) => {
    setTheme(nextTheme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('ege_theme_v2', nextTheme);
    }
  };

  // Sync theme class on document.documentElement
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const classList = document.documentElement.classList;
      classList.forEach((cls) => {
        if (cls.startsWith('theme-')) {
          classList.remove(cls);
        }
      });
      classList.add(`theme-${theme}`);
    }
  }, [theme]);

  // Active Main View ('map' | 'exam')
  const [activeView, setActiveView] = useState<'map' | 'exam'>('map');

  // Modals state
  const [selectedTopic, setSelectedTopic] = useState<TopicData | null>(null);
  const [bossSectionId, setBossSectionId] = useState<number | null>(null);
  const [showGlossary, setShowGlossary] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
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

  return (
    <div className={`theme-${theme} min-h-screen flex flex-col font-sans transition-colors duration-200 bg-[var(--bg-canvas)] text-[var(--text-primary)] selection:bg-[var(--accent)] selection:text-white`}>
      {/* Clean Minimal Navigation */}
      <Navbar
        progress={progress}
        onOpenGlossary={() => setShowGlossary(true)}
        onOpenAchievements={() => setShowAchievements(true)}
        onOpenBackup={() => setShowBackup(true)}
        onToggleFreePlay={handleToggleFreePlay}
        activeView={activeView}
        setActiveView={setActiveView}
        theme={theme}
        onChangeTheme={handleChangeTheme}
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
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
            <BossExamModal
              sectionId={undefined} // 100-point Mega Blitz Exam Mode
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

      {/* Minimal, Calm Footer */}
      <footer className="border-t border-[var(--border-subtle)] bg-[var(--surface-card)]/40 py-6 text-xs transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-[var(--text-secondary)]">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[var(--text-primary)]">Обществознание ЕГЭ</span>
            <span className="opacity-40">·</span>
            <span>47 тем курса по кодификатору ФИПИ</span>
          </div>
          <div className="flex items-center gap-5 font-medium">
            <button
              onClick={() => setShowGlossary(true)}
              className="hover:text-[var(--text-primary)] transition-colors cursor-pointer"
            >
              Словарь понятий
            </button>
            <button
              onClick={() => setShowAchievements(true)}
              className="hover:text-[var(--text-primary)] transition-colors cursor-pointer"
            >
              Достижения
            </button>
            <button
              onClick={() => setShowBackup(true)}
              className="hover:text-[var(--text-primary)] transition-colors cursor-pointer"
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
