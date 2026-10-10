import { UserProgress } from '../types';

const STORAGE_KEY = 'ege_soc_quest_progress_v1';

export const INITIAL_PROGRESS: UserProgress = {
  xp: 0,
  streak: 1,
  lastActiveDate: new Date().toISOString().split('T')[0],
  unlockedLevels: [1], // Level 1 is unlocked initially
  completedLevels: {},
  masteredFlashcards: [],
  unlockedAchievements: [],
  bossesDefeated: [],
  freePlayMode: false,
};

export const RANKS = [
  { minXp: 0, title: 'Абитуриент (0-10% готовности)', badge: '🌱', level: 1 },
  { minXp: 400, title: 'Старательный ученик (порог 42 балла)', badge: '📚', level: 2 },
  { minXp: 1000, title: 'Теоретик общества (55+ баллов)', badge: '🔍', level: 3 },
  { minXp: 2000, title: 'Знаток права и политики (68+ баллов)', badge: '⚖️', level: 4 },
  { minXp: 3200, title: 'Экономический стратег (78+ баллов)', badge: '📈', level: 5 },
  { minXp: 4500, title: 'Магистр обществознания (85+ баллов)', badge: '🎓', level: 6 },
  { minXp: 6000, title: 'Эксперт ФИПИ (92+ балла)', badge: '🏛️', level: 7 },
  { minXp: 8000, title: 'Легенда ЕГЭ: 100 БАЛЛОВ!', badge: '👑', level: 8 },
];

export function getUserRank(xp: number) {
  let currentRank = RANKS[0];
  for (const rank of RANKS) {
    if (xp >= rank.minXp) {
      currentRank = rank;
    } else {
      break;
    }
  }
  const nextRank = RANKS.find((r) => r.minXp > xp) || null;
  return { currentRank, nextRank };
}

export function loadProgress(): UserProgress {
  if (typeof window === 'undefined') return INITIAL_PROGRESS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return updateStreak(INITIAL_PROGRESS);
    const parsed: UserProgress = JSON.parse(raw);

    // Merge defaults in case of new fields
    const merged: UserProgress = {
      ...INITIAL_PROGRESS,
      ...parsed,
      unlockedLevels: Array.isArray(parsed.unlockedLevels) && parsed.unlockedLevels.length > 0 ? parsed.unlockedLevels : [1],
      completedLevels: parsed.completedLevels || {},
      masteredFlashcards: parsed.masteredFlashcards || [],
      unlockedAchievements: parsed.unlockedAchievements || [],
      bossesDefeated: parsed.bossesDefeated || [],
    };
    return updateStreak(merged);
  } catch (e) {
    console.error('Failed to parse saved progress, reset to initial', e);
    return INITIAL_PROGRESS;
  }
}

export function saveProgress(progress: UserProgress): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (e) {
    console.error('Failed to save progress to localStorage', e);
  }
}

function updateStreak(progress: UserProgress): UserProgress {
  const today = new Date().toISOString().split('T')[0];
  const last = progress.lastActiveDate;

  if (last === today) {
    return progress;
  }

  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterday = yesterdayDate.toISOString().split('T')[0];

  let newStreak = progress.streak;
  if (last === yesterday) {
    newStreak += 1;
  } else {
    newStreak = 1; // broken streak
  }

  const updated: UserProgress = {
    ...progress,
    streak: newStreak,
    lastActiveDate: today,
  };
  saveProgress(updated);
  return updated;
}

export function exportProgressJSON(progress: UserProgress): void {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(progress, null, 2));
  const dlAnchorElem = document.createElement('a');
  dlAnchorElem.setAttribute('href', dataStr);
  dlAnchorElem.setAttribute('download', `ege_soc_progress_${new Date().toISOString().split('T')[0]}.json`);
  dlAnchorElem.click();
}

export function importProgressJSON(file: File): Promise<UserProgress> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = JSON.parse(text);
        if (typeof parsed.xp === 'number') {
          saveProgress(parsed);
          resolve(parsed);
        } else {
          reject(new Error('Неверный формат файла сохранения'));
        }
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsText(file);
  });
}
