import React, { useState, useEffect } from 'react';
import { QuizQuestion, UserProgress } from '../types';
import { SECTIONS } from '../data/sections';
import { sounds } from '../utils/audio';
import { triggerConfetti } from '../utils/confetti';
import { 
  X, 
  Swords, 
  Timer, 
  Trophy, 
  ArrowRight
} from 'lucide-react';

interface BossExamModalProps {
  sectionId?: number; // If undefined, this is the full 100-point Mega ЕГЭ Simulator
  progress: UserProgress;
  onClose: () => void;
  onDefeatBoss: (sectionId: number, xpReward: number) => void;
  theme?: 'dark' | 'light';
}

export const BossExamModal: React.FC<BossExamModalProps> = ({
  sectionId,
  progress,
  onClose,
  onDefeatBoss,
  theme = 'dark',
}) => {
  const isDark = theme === 'dark';
  const isMegaExam = sectionId === undefined;
  const section = sectionId ? SECTIONS.find((s) => s.id === sectionId) : null;

  const questions: QuizQuestion[] = React.useMemo(() => {
    if (section) {
      return section.bossExam.questions;
    }
    const pooled: QuizQuestion[] = [];
    SECTIONS.forEach((s) => {
      s.bossExam.questions.slice(0, 2).forEach((q) => pooled.push(q));
    });
    return pooled;
  }, [section]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [isFinished, setIsFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(questions.length * 90);

  useEffect(() => {
    if (isFinished) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleFinish();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isFinished]);

  const currentQ = questions[currentIndex];

  const handleSelect = (optionId: string) => {
    sounds.playClick();
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentIndex]: optionId,
    }));
  };

  const handleFinish = () => {
    sounds.playLevelComplete();
    setIsFinished(true);

    let correct = 0;
    questions.forEach((q, idx) => {
      const selected = selectedAnswers[idx];
      const correctOpt = q.options.find((o) => o.isCorrect);
      if (selected === correctOpt?.id) {
        correct++;
      }
    });

    const pct = Math.round((correct / questions.length) * 100);
    if (pct >= 60) {
      triggerConfetti();
      if (sectionId) {
        onDefeatBoss(sectionId, 300);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const scoreResults = React.useMemo(() => {
    let correct = 0;
    questions.forEach((q, idx) => {
      const selected = selectedAnswers[idx];
      const correctOpt = q.options.find((o) => o.isCorrect);
      if (selected === correctOpt?.id) correct++;
    });
    const percentage = Math.round((correct / questions.length) * 100);
    const egePoints = Math.round(35 + (percentage / 100) * 65);
    return { correct, percentage, egePoints };
  }, [isFinished, questions, selectedAnswers]);

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
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-600 via-pink-600 to-amber-500 text-white flex items-center justify-center shadow-md">
              <Swords className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight">
                {isMegaExam ? 'Супер-Экзамен ЕГЭ (Симулятор 100 баллов)' : section?.bossExam.title}
              </h2>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {isMegaExam ? 'Контрольный срез по всем 47 темам курса' : section?.bossExam.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {!isFinished && (
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold tabular-nums border ${
                isDark ? 'bg-slate-800 text-amber-400 border-slate-700' : 'bg-slate-100 text-amber-600 border-slate-200'
              }`}>
                <Timer className="w-3.5 h-3.5" />
                <span>{formatTime(timeLeft)}</span>
              </div>
            )}
            <button
              onClick={onClose}
              className={`p-2 rounded-xl transition-colors ${
                isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-400 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
          {!isFinished ? (
            <div className="space-y-6">
              {/* Question Navigation Bubbles */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {questions.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      sounds.playClick();
                      setCurrentIndex(i);
                    }}
                    className={`w-8 h-8 rounded-xl text-xs font-black transition-all shrink-0 cursor-pointer ${
                      currentIndex === i
                        ? 'bg-amber-500 text-slate-950 font-black ring-2 ring-amber-400 scale-105'
                        : selectedAnswers[i]
                        ? 'bg-indigo-600/30 text-indigo-400 border border-indigo-500/40'
                        : isDark ? 'bg-slate-800 text-slate-400 hover:text-white' : 'bg-slate-100 text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              {/* Question Card */}
              <div className={`p-6 rounded-3xl border space-y-2.5 ${
                isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="text-[11px] font-black uppercase tracking-wider text-rose-500 flex items-center gap-1">
                  <Swords className="w-3.5 h-3.5" />
                  <span>Битва босса · Вопрос {currentIndex + 1} из {questions.length}</span>
                </div>
                <h3 className={`text-base sm:text-lg font-black leading-relaxed ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}>
                  {currentQ.question}
                </h3>
              </div>

              {/* Options */}
              <div className="space-y-3">
                {currentQ.options.map((opt) => {
                  const isSelected = selectedAnswers[currentIndex] === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => handleSelect(opt.id)}
                      className={`w-full text-left p-4.5 rounded-2xl border text-sm transition-all flex items-start gap-3.5 cursor-pointer ${
                        isSelected
                          ? isDark 
                            ? 'bg-indigo-950/70 border-indigo-500 text-white ring-2 ring-indigo-500/30'
                            : 'bg-indigo-50 border-indigo-400 text-indigo-950 ring-2 ring-indigo-200'
                          : isDark
                            ? 'bg-slate-900/80 border-slate-800 text-slate-200 hover:border-slate-700'
                            : 'bg-white border-slate-200 text-slate-800 hover:border-slate-300 shadow-2xs'
                      }`}
                    >
                      <span className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                        isSelected 
                          ? 'bg-indigo-600 text-white border-indigo-600' 
                          : isDark ? 'border-slate-700 text-slate-400' : 'border-slate-300 text-slate-600'
                      }`}>
                        {opt.id.toUpperCase()}
                      </span>
                      <span className="flex-1 leading-relaxed font-medium">{opt.text}</span>
                    </button>
                  );
                })}
              </div>

              {/* Nav */}
              <div className={`flex items-center justify-between pt-4 border-t ${
                isDark ? 'border-slate-800' : 'border-slate-100'
              }`}>
                <button
                  onClick={() => {
                    sounds.playClick();
                    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
                  }}
                  disabled={currentIndex === 0}
                  className={`px-4 py-2.5 rounded-xl disabled:opacity-30 text-xs font-bold transition-colors ${
                    isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  Назад
                </button>

                {currentIndex < questions.length - 1 ? (
                  <button
                    onClick={() => {
                      sounds.playClick();
                      setCurrentIndex(currentIndex + 1);
                    }}
                    className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm shadow-md cursor-pointer"
                  >
                    Следующий вопрос
                  </button>
                ) : (
                  <button
                    onClick={handleFinish}
                    className="px-6 py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-amber-500 hover:opacity-95 text-white font-black text-xs sm:text-sm shadow-lg flex items-center gap-2 cursor-pointer"
                  >
                    <Trophy className="w-4 h-4" />
                    <span>Завершить бой</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* RESULTS SCREEN */
            <div className="space-y-6 text-center max-w-lg mx-auto py-6 animate-fadeIn">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-400 to-orange-500 text-slate-950 flex items-center justify-center mx-auto shadow-2xl shadow-amber-500/30">
                <Trophy className="w-10 h-10" />
              </div>

              <div className="space-y-1.5">
                <h3 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {scoreResults.percentage >= 60 ? 'Босс повержен!' : 'Испытание завершено'}
                </h3>
                <p className={`text-xs ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  {scoreResults.percentage >= 60 
                    ? 'Поздравляем! Награда в 300 XP начислена, раздел подтвержден!' 
                    : 'Не расстраивайтесь — повторите конспект и попробуйте снова!'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div className={`p-4 rounded-2xl border ${
                  isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className={`text-xs font-semibold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Точность
                  </div>
                  <div className="text-2xl font-black text-emerald-500 tabular-nums">
                    {scoreResults.correct} / {questions.length}
                  </div>
                  <div className={`text-[11px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    {scoreResults.percentage}% верных ответов
                  </div>
                </div>

                <div className={`p-4 rounded-2xl border ${
                  isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className={`text-xs font-semibold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Оценка ЕГЭ
                  </div>
                  <div className="text-2xl font-black text-amber-500 tabular-nums">
                    {scoreResults.egePoints}
                  </div>
                  <div className={`text-[11px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    из 100 баллов
                  </div>
                </div>
              </div>

              {/* Close Button */}
              <div className="pt-2">
                <button
                  onClick={onClose}
                  className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm cursor-pointer shadow-md"
                >
                  Вернуться на карту
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
