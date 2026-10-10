import React, { useState, useEffect } from 'react';
import { TopicData, UserProgress, ThemeId } from '../types';
import { sounds } from '../utils/audio';
import { triggerConfetti } from '../utils/confetti';
import { isDarkTheme } from '../utils/themes';
import { 
  X, 
  BookOpen, 
  Layers, 
  CheckCircle2, 
  RotateCw, 
  AlertCircle, 
  Heart, 
  Star, 
  ArrowRight, 
  ArrowLeft,
  Trophy,
  Copy,
  Check,
  Lightbulb,
  AlertTriangle
} from 'lucide-react';

interface TopicStudyModalProps {
  topic: TopicData;
  progress: UserProgress;
  onClose: () => void;
  onCompleteLevel: (topicId: number, stars: number, score: number) => void;
  onMasterFlashcard: (cardId: string) => void;
  onNextLevel: (nextTopicId: number) => void;
  theme: ThemeId;
}

export const TopicStudyModal: React.FC<TopicStudyModalProps> = ({
  topic,
  progress,
  onClose,
  onCompleteLevel,
  onMasterFlashcard,
  onNextLevel,
  theme,
}) => {
  const isDark = isDarkTheme(theme);
  const [activeTab, setActiveTab] = useState<'theory' | 'flashcards' | 'quiz'>('theory');

  // Flashcards State
  const [cardIndex, setCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Quiz State
  const [quizQuestionIndex, setQuizQuestionIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);
  const [lives, setLives] = useState(3);
  const [quizFinished, setQuizFinished] = useState(false);
  const [copiedTheory, setCopiedTheory] = useState(false);

  const currentFlashcard = topic.flashcards[cardIndex];
  const currentQuizQuestion = topic.quiz[quizQuestionIndex];

  // Keyboard navigation for Flashcards
  useEffect(() => {
    if (activeTab !== 'flashcards') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        sounds.playClick();
        setIsFlipped((f) => !f);
      } else if (e.code === 'ArrowRight') {
        handleFlashcardNext();
      } else if (e.code === 'ArrowLeft') {
        handleFlashcardPrev();
      } else if (e.code === 'Enter') {
        handleFlashcardKnown();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, cardIndex, isFlipped]);

  const handleFlashcardKnown = () => {
    sounds.playCorrect();
    onMasterFlashcard(currentFlashcard.id);
    if (cardIndex < topic.flashcards.length - 1) {
      setIsFlipped(false);
      setCardIndex((prev) => prev + 1);
    }
  };

  const handleFlashcardNext = () => {
    sounds.playClick();
    if (cardIndex < topic.flashcards.length - 1) {
      setIsFlipped(false);
      setCardIndex((prev) => prev + 1);
    }
  };

  const handleFlashcardPrev = () => {
    sounds.playClick();
    if (cardIndex > 0) {
      setIsFlipped(false);
      setCardIndex((prev) => prev - 1);
    }
  };

  const handleSelectOption = (optionId: string) => {
    if (isAnswerSubmitted) return;
    sounds.playClick();
    setSelectedOptionId(optionId);
  };

  const handleSubmitAnswer = () => {
    if (!selectedOptionId || isAnswerSubmitted) return;
    setIsAnswerSubmitted(true);

    const selectedOption = currentQuizQuestion.options.find((o) => o.id === selectedOptionId);
    if (selectedOption?.isCorrect) {
      sounds.playCorrect();
      setCorrectAnswersCount((prev) => prev + 1);
    } else {
      sounds.playIncorrect();
      setLives((prev) => Math.max(0, prev - 1));
    }
  };

  const handleNextQuizQuestion = () => {
    sounds.playClick();
    if (quizQuestionIndex < topic.quiz.length - 1 && lives > 0) {
      setQuizQuestionIndex((prev) => prev + 1);
      setSelectedOptionId(null);
      setIsAnswerSubmitted(false);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = () => {
    setQuizFinished(true);
    const scorePct = Math.round((correctAnswersCount / topic.quiz.length) * 100);
    let earnedStars = 1;
    if (scorePct >= 95) earnedStars = 3;
    else if (scorePct >= 65) earnedStars = 2;

    sounds.playLevelComplete();
    setTimeout(() => sounds.playStarEarned(), 250);

    if (earnedStars >= 2) {
      triggerConfetti();
    }

    onCompleteLevel(topic.id, earnedStars, scorePct);
  };

  const restartQuiz = () => {
    setQuizQuestionIndex(0);
    setSelectedOptionId(null);
    setIsAnswerSubmitted(false);
    setCorrectAnswersCount(0);
    setLives(3);
    setQuizFinished(false);
  };

  const copyTheoryText = () => {
    const text = topic.theory.map(t => `${t.title}\n${t.content || ''}`).join('\n\n');
    navigator.clipboard.writeText(text);
    setCopiedTheory(true);
    setTimeout(() => setCopiedTheory(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 w-screen h-screen bg-[var(--bg-canvas)] text-[var(--text-primary)] flex flex-col overflow-hidden animate-fadeIn">
      {/* Top Header */}
      <div className="flex items-center justify-between px-4 sm:px-8 py-3 border-b border-[var(--border-subtle)] bg-[var(--surface-card)] shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onClose}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[var(--border-subtle)] text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-muted)] transition-colors cursor-pointer shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">К темам</span>
          </button>
          <span className="w-6 h-6 rounded-md bg-[var(--accent)] text-white font-bold flex items-center justify-center text-xs shadow-xs shrink-0">
            {topic.id}
          </span>
          <div className="min-w-0">
            <h2 className="text-sm sm:text-base font-bold tracking-tight text-[var(--text-primary)] truncate">
              {topic.title}
            </h2>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-1 p-0.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] shrink-0 mx-2">
          <button
            onClick={() => {
              sounds.playClick();
              setActiveTab('theory');
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'theory'
                ? 'bg-[var(--accent)] text-white shadow-xs'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Теория</span>
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              setActiveTab('flashcards');
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'flashcards'
                ? 'bg-[var(--accent)] text-white shadow-xs'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Карточки ({topic.flashcards.length})</span>
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              setActiveTab('quiz');
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'quiz'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>Тест ({topic.quiz.length})</span>
          </button>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-muted)] transition-colors cursor-pointer shrink-0"
          title="Закрыть (Esc)"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Full-Height Body */}
      <div className="flex-1 overflow-y-auto">
          {/* TAB 1: THEORY */}
          {activeTab === 'theory' && (
            <div className="space-y-6">
              <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b text-xs ${
                isDark ? 'border-white/[0.08]' : 'border-slate-100'
              }`}>
                <div className={isDark ? 'text-slate-400' : 'text-slate-500'}>
                  Ключевые понятия: <span className="font-semibold text-indigo-500">{topic.keyTerms.join(', ')}</span>
                </div>
                <button
                  onClick={copyTheoryText}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors self-start sm:self-auto border ${
                    isDark 
                      ? 'bg-slate-800 border-white/[0.08] text-slate-300 hover:text-white' 
                      : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {copiedTheory ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedTheory ? 'Скопировано' : 'Копировать'}</span>
                </button>
              </div>

              {topic.theory.map((sec, idx) => (
                <div 
                  key={idx} 
                  className={`rounded-2xl border p-5 sm:p-6 space-y-3 transition-all ${
                    isDark ? 'bg-slate-950/40 border-white/[0.06]' : 'bg-slate-50/50 border-slate-200/80'
                  }`}
                >
                  <h3 className={`text-base font-bold flex items-center gap-2 ${
                    isDark ? 'text-white' : 'text-slate-900'
                  }`}>
                    <span className="w-2 h-2 rounded-full bg-indigo-500" />
                    <span>{sec.title}</span>
                  </h3>

                  {sec.content && (
                    <p className={`text-sm leading-relaxed whitespace-pre-line ${
                      isDark ? 'text-slate-300' : 'text-slate-700'
                    }`}>
                      {sec.content}
                    </p>
                  )}

                  {sec.table && (
                    <div className={`overflow-x-auto rounded-xl border my-3 ${
                      isDark ? 'border-white/[0.08]' : 'border-slate-200'
                    }`}>
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className={isDark ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-800'}>
                            {sec.table.headers.map((h, i) => (
                              <th key={i} className={`p-3 font-semibold border-b ${
                                isDark ? 'border-white/[0.08]' : 'border-slate-200'
                              }`}>
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className={`divide-y ${isDark ? 'divide-white/[0.06] bg-slate-900/40' : 'divide-slate-100 bg-white'}`}>
                          {sec.table.rows.map((row, rIndex) => (
                            <tr key={rIndex} className={isDark ? 'hover:bg-white/[0.02]' : 'hover:bg-slate-50'}>
                              {row.map((cell, cIndex) => (
                                <td key={cIndex} className={`p-3 align-top leading-relaxed ${
                                  isDark ? 'text-slate-300' : 'text-slate-700'
                                }`}>
                                  {cell}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {sec.keyTakeaway && (
                    <div className={`p-3.5 rounded-xl border flex items-start gap-2.5 ${
                      isDark 
                        ? 'bg-indigo-950/20 border-indigo-500/25 text-indigo-200' 
                        : 'bg-indigo-50 border-indigo-200 text-indigo-900'
                    }`}>
                      <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <div className="text-xs leading-relaxed">
                        <strong>Главный вывод:</strong> {sec.keyTakeaway}
                      </div>
                    </div>
                  )}

                  {sec.egeTrap && (
                    <div className={`p-3.5 rounded-xl border flex items-start gap-2.5 ${
                      isDark 
                        ? 'bg-amber-950/20 border-amber-500/30 text-amber-200' 
                        : 'bg-amber-50 border-amber-200 text-amber-900'
                    }`}>
                      <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <div className="text-xs leading-relaxed">
                        <strong>Ловушка ЕГЭ:</strong> {sec.egeTrap}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => {
                    sounds.playClick();
                    setActiveTab('flashcards');
                  }}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-sm transition-all"
                >
                  <span>Закрепить на карточках</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: FLASHCARDS */}
          {activeTab === 'flashcards' && (
            <div className="flex flex-col items-center justify-center py-4 space-y-6">
              <div className="w-full flex items-center justify-between text-xs max-w-lg">
                <span className={`font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Карточка {cardIndex + 1} из {topic.flashcards.length}
                </span>
                <span className="text-amber-500 font-bold">
                  +15 XP за знание
                </span>
              </div>

              <div className={`w-full max-w-lg h-1.5 rounded-full overflow-hidden ${
                isDark ? 'bg-slate-800' : 'bg-slate-200'
              }`}>
                <div 
                  className="bg-indigo-600 h-full transition-all duration-300"
                  style={{ width: `${((cardIndex + 1) / topic.flashcards.length) * 100}%` }}
                />
              </div>

              {/* 3D Card */}
              <div 
                onClick={() => {
                  sounds.playClick();
                  setIsFlipped(!isFlipped);
                }}
                className="relative w-full max-w-lg h-72 cursor-pointer perspective select-none"
              >
                <div 
                  className={`w-full h-full rounded-3xl border transition-all duration-300 p-8 text-center flex flex-col items-center justify-center shadow-lg ${
                    isFlipped
                      ? isDark 
                        ? 'bg-slate-800/90 border-indigo-500 text-white' 
                        : 'bg-indigo-50 border-indigo-300 text-indigo-950'
                      : isDark
                        ? 'bg-slate-900 border-white/[0.08] text-white hover:border-white/[0.16]'
                        : 'bg-white border-slate-200 text-slate-900 hover:border-slate-300 shadow-sm'
                  }`}
                >
                  <div className={`text-[11px] font-bold uppercase tracking-wider mb-3 flex items-center gap-1.5 ${
                    isDark ? 'text-indigo-400' : 'text-indigo-600'
                  }`}>
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>{isFlipped ? 'Определение / Ответ' : 'Понятие (Нажмите для оборота)'}</span>
                  </div>

                  <div className="text-lg sm:text-xl font-bold leading-relaxed max-w-md">
                    {isFlipped ? currentFlashcard.definition : currentFlashcard.term}
                  </div>

                  {currentFlashcard.hint && !isFlipped && (
                    <div className={`text-xs mt-3 italic ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      Подсказка: {currentFlashcard.hint}
                    </div>
                  )}

                  <div className={`text-[11px] mt-5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    Пробел — перевернуть · Стрелки — листать · Enter — знаю
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-3 w-full max-w-lg justify-between pt-1">
                <button
                  onClick={handleFlashcardPrev}
                  disabled={cardIndex === 0}
                  className={`px-3.5 py-2 rounded-xl disabled:opacity-30 text-xs font-semibold flex items-center gap-1 transition-colors ${
                    isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Назад</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleFlashcardNext}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
                      isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    Повторить
                  </button>

                  <button
                    onClick={handleFlashcardKnown}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Я знаю!</span>
                  </button>
                </div>

                <button
                  onClick={handleFlashcardNext}
                  disabled={cardIndex === topic.flashcards.length - 1}
                  className={`px-3.5 py-2 rounded-xl disabled:opacity-30 text-xs font-semibold flex items-center gap-1 transition-colors ${
                    isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  <span>Далее</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className={`pt-4 border-t w-full max-w-lg flex justify-center ${
                isDark ? 'border-white/[0.08]' : 'border-slate-100'
              }`}>
                <button
                  onClick={() => {
                    sounds.playClick();
                    setActiveTab('quiz');
                  }}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-sm"
                >
                  <Trophy className="w-4 h-4" />
                  <span>Перейти к тесту уровня</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: QUIZ */}
          {activeTab === 'quiz' && (
            <div className="max-w-3xl sm:max-w-4xl mx-auto p-4 sm:p-8 space-y-6">
              {!quizFinished ? (
                <div className="space-y-6">
                  {/* Status Strip */}
                  <div className="flex items-center justify-between text-xs font-semibold text-[var(--text-secondary)]">
                    <span className="text-[var(--accent)] font-bold text-sm">
                      Вопрос {quizQuestionIndex + 1} из {topic.quiz.length}
                    </span>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3].map((heart) => (
                          <Heart
                            key={heart}
                            className={`w-4 h-4 transition-transform duration-200 ${
                              heart <= lives
                                ? 'fill-rose-500 text-rose-500 scale-105'
                                : 'text-[var(--text-muted)] opacity-30'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-amber-500 font-bold">
                        Верных: {correctAnswersCount}
                      </span>
                    </div>
                  </div>

                  {/* Question Box */}
                  <div className="p-6 sm:p-8 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] space-y-3 shadow-xs">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--accent)]">
                      Задание в формате ЕГЭ
                    </span>
                    <h3 className="text-lg sm:text-xl md:text-2xl font-bold leading-relaxed whitespace-pre-line text-[var(--text-primary)]">
                      {currentQuizQuestion.question}
                    </h3>
                  </div>

                  {/* Options List */}
                  <div className="space-y-3">
                    {currentQuizQuestion.options.map((opt) => {
                      const isSelected = selectedOptionId === opt.id;
                      let optionClasses = 'bg-[var(--surface-card)] border-[var(--border-subtle)] text-[var(--text-primary)] hover:border-[var(--accent)] hover:bg-[var(--surface-muted)]/50';

                      if (isAnswerSubmitted) {
                        if (opt.isCorrect) {
                          optionClasses = 'bg-emerald-500/15 border-emerald-500 text-emerald-400 ring-1 ring-emerald-500';
                        } else if (isSelected && !opt.isCorrect) {
                          optionClasses = 'bg-rose-500/15 border-rose-500 text-rose-400 ring-1 ring-rose-500';
                        } else {
                          optionClasses = 'bg-transparent border-[var(--border-subtle)] text-[var(--text-muted)] opacity-40';
                        }
                      } else if (isSelected) {
                        optionClasses = 'bg-[var(--accent-subtle)] border-[var(--accent)] text-[var(--text-primary)] ring-1 ring-[var(--accent)]';
                      }

                      return (
                        <button
                          key={opt.id}
                          onClick={() => handleSelectOption(opt.id)}
                          disabled={isAnswerSubmitted}
                          className={`w-full text-left p-4 sm:p-5 rounded-xl border text-sm sm:text-base transition-all flex items-start gap-3.5 cursor-pointer ${optionClasses}`}
                        >
                          <span className={`w-6 h-6 rounded-md border flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                            isSelected 
                              ? 'bg-[var(--accent)] text-white border-[var(--accent)]' 
                              : 'border-[var(--border-subtle)] text-[var(--text-muted)]'
                          }`}>
                            {opt.id.toUpperCase()}
                          </span>
                          <span className="flex-1 leading-relaxed">{opt.text}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Explanation Callout */}
                  {isAnswerSubmitted && (
                    <div className="p-4 sm:p-5 rounded-xl border border-amber-500/25 bg-amber-500/10 space-y-1.5 animate-fadeIn">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-amber-500">
                        <AlertCircle className="w-4 h-4" />
                        <span>Пояснение к заданию:</span>
                      </div>
                      <p className="text-xs sm:text-sm leading-relaxed text-[var(--text-secondary)]">
                        {currentQuizQuestion.explanation}
                      </p>
                    </div>
                  )}

                  {/* Submit / Next Button */}
                  <div className="flex justify-end pt-2">
                    {!isAnswerSubmitted ? (
                      <button
                        onClick={handleSubmitAnswer}
                        disabled={!selectedOptionId}
                        className="px-6 py-3 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] disabled:opacity-30 text-white font-semibold text-sm shadow-xs transition-all cursor-pointer"
                      >
                        Проверить ответ
                      </button>
                    ) : (
                      <button
                        onClick={handleNextQuizQuestion}
                        className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-xs flex items-center gap-2 transition-all cursor-pointer"
                      >
                        <span>
                          {quizQuestionIndex < topic.quiz.length - 1 && lives > 0
                            ? 'Следующий вопрос'
                            : 'Завершить испытание'}
                        </span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="max-w-md mx-auto text-center space-y-6 py-12 animate-fadeIn">
                  <div className="w-16 h-16 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center mx-auto shadow-lg">
                    <Trophy className="w-8 h-8" />
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-2xl font-bold text-[var(--text-primary)]">
                      Уровень {topic.id} завершён!
                    </h3>
                    <p className="text-sm text-[var(--text-secondary)]">
                      Верных ответов: <strong className="text-emerald-500 font-bold">{correctAnswersCount}</strong> из {topic.quiz.length}
                    </p>
                  </div>

                  <div className="flex items-center justify-center gap-2">
                    {[1, 2, 3].map((s) => {
                      const earnedStars = Math.round((correctAnswersCount / topic.quiz.length) * 100) >= 95 ? 3 : Math.round((correctAnswersCount / topic.quiz.length) * 100) >= 65 ? 2 : 1;
                      return (
                        <Star
                          key={s}
                          className={`w-8 h-8 ${
                            s <= earnedStars
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-[var(--text-muted)] opacity-20'
                          } transition-all`}
                        />
                      );
                    })}
                  </div>

                  <div className="p-3.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] text-xs font-semibold text-[var(--text-secondary)]">
                    Начислено: <strong className="text-amber-500">+100 XP</strong> и открыта следующая тема!
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2.5 justify-center pt-2">
                    <button
                      onClick={restartQuiz}
                      className="px-4 py-2 rounded-xl text-xs font-semibold border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-muted)] transition-colors cursor-pointer"
                    >
                      Пройти заново
                    </button>

                    {topic.id < 47 && (
                      <button
                        onClick={() => {
                          sounds.playClick();
                          onNextLevel(topic.id + 1);
                        }}
                        className="px-5 py-2 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                      >
                        <span>Тема {topic.id + 1}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <button
                      onClick={onClose}
                      className="px-4 py-2 rounded-xl text-xs font-semibold border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-muted)] transition-colors cursor-pointer"
                    >
                      К темам
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
      </div>
    </div>
  );
};
