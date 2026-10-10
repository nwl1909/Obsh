import React, { useState, useEffect } from 'react';
import { TopicData, UserProgress } from '../types';
import { sounds } from '../utils/audio';
import { triggerConfetti } from '../utils/confetti';
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
  Sparkles,
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
  theme: 'dark' | 'light';
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
  const isDark = theme === 'dark';
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

    // If 2 or 3 stars, trigger joyous confetti!
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className={`relative w-full max-w-4xl rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden border transition-colors ${
        isDark 
          ? 'bg-slate-900 border-slate-700/80 text-white' 
          : 'bg-white border-slate-200 text-slate-900'
      }`}>
        {/* Modal Top Header */}
        <div className={`flex items-center justify-between px-6 py-4.5 border-b shrink-0 ${
          isDark ? 'border-slate-800 bg-slate-900/95' : 'border-slate-100 bg-slate-50/80'
        }`}>
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white font-black flex items-center justify-center text-sm shadow-sm">
              {topic.id}
            </span>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight line-clamp-1">
                {topic.title}
              </h2>
              <p className={`text-xs hidden sm:block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {topic.subtitle}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-2 rounded-xl transition-colors ${
              isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-400 hover:text-slate-900 hover:bg-slate-100'
            }`}
            title="Закрыть (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Controls Bar */}
        <div className={`flex items-center justify-between px-6 py-3 border-b shrink-0 ${
          isDark ? 'bg-slate-950/60 border-slate-800/80' : 'bg-slate-100/70 border-slate-200/80'
        }`}>
          <div className={`flex items-center gap-1.5 p-1 rounded-2xl border ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-2xs'
          }`}>
            <button
              onClick={() => {
                sounds.playClick();
                setActiveTab('theory');
              }}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all ${
                activeTab === 'theory'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>1. Теория</span>
            </button>

            <button
              onClick={() => {
                sounds.playClick();
                setActiveTab('flashcards');
              }}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all ${
                activeTab === 'flashcards'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>2. Карточки ({topic.flashcards.length})</span>
            </button>

            <button
              onClick={() => {
                sounds.playClick();
                setActiveTab('quiz');
              }}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all ${
                activeTab === 'quiz'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>3. Тест</span>
            </button>
          </div>

          {activeTab === 'quiz' && !quizFinished && (
            <div className="flex items-center gap-1.5">
              {[1, 2, 3].map((heart) => (
                <Heart
                  key={heart}
                  className={`w-4 h-4 transition-transform duration-200 ${
                    heart <= lives
                      ? 'fill-rose-500 text-rose-500 scale-105'
                      : isDark ? 'text-slate-800 fill-slate-800/80' : 'text-slate-200 fill-slate-200'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Modal Body Container */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
          {/* TAB 1: THEORY */}
          {activeTab === 'theory' && (
            <div className="space-y-6">
              {/* Header Info */}
              <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b text-xs ${
                isDark ? 'border-slate-800' : 'border-slate-100'
              }`}>
                <div className={isDark ? 'text-slate-400' : 'text-slate-500'}>
                  Ключевые понятия темы:{' '}
                  <span className="font-bold text-indigo-500">
                    {topic.keyTerms.join(', ')}
                  </span>
                </div>
                <button
                  onClick={copyTheoryText}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors self-start sm:self-auto border ${
                    isDark 
                      ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white' 
                      : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {copiedTheory ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedTheory ? 'Скопировано!' : 'Копировать конспект'}</span>
                </button>
              </div>

              {/* Theory Sections */}
              {topic.theory.map((sec, idx) => (
                <div 
                  key={idx} 
                  className={`rounded-2xl border p-6 space-y-3.5 transition-all ${
                    isDark ? 'bg-slate-950/40 border-slate-800/80' : 'bg-slate-50/50 border-slate-200/80'
                  }`}
                >
                  <h3 className={`text-base font-bold flex items-center gap-2.5 ${
                    isDark ? 'text-white' : 'text-slate-900'
                  }`}>
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-sm" />
                    <span>{sec.title}</span>
                  </h3>

                  {sec.content && (
                    <p className={`text-sm leading-relaxed whitespace-pre-line ${
                      isDark ? 'text-slate-300' : 'text-slate-700'
                    }`}>
                      {sec.content}
                    </p>
                  )}

                  {/* High Quality Comparative Table */}
                  {sec.table && (
                    <div className={`overflow-x-auto rounded-xl border my-4 shadow-2xs ${
                      isDark ? 'border-slate-800' : 'border-slate-200'
                    }`}>
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className={isDark ? 'bg-slate-800/90 text-slate-200' : 'bg-slate-100 text-slate-800'}>
                            {sec.table.headers.map((h, i) => (
                              <th key={i} className={`p-3 font-bold border-b ${
                                isDark ? 'border-slate-700' : 'border-slate-200'
                              }`}>
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className={`divide-y ${isDark ? 'divide-slate-800/70 bg-slate-900/40' : 'divide-slate-100 bg-white'}`}>
                          {sec.table.rows.map((row, rIndex) => (
                            <tr key={rIndex} className={isDark ? 'hover:bg-slate-800/30' : 'hover:bg-slate-50'}>
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

                  {/* Key Takeaway Box */}
                  {sec.keyTakeaway && (
                    <div className={`p-4 rounded-xl border flex items-start gap-3 ${
                      isDark 
                        ? 'bg-indigo-950/30 border-indigo-500/30 text-indigo-200' 
                        : 'bg-indigo-50/80 border-indigo-200 text-indigo-900'
                    }`}>
                      <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <div className="text-xs leading-relaxed">
                        <strong className="font-bold">Главный вывод:</strong> {sec.keyTakeaway}
                      </div>
                    </div>
                  )}

                  {/* EGE Trap Warning Box */}
                  {sec.egeTrap && (
                    <div className={`p-4 rounded-xl border flex items-start gap-3 ${
                      isDark 
                        ? 'bg-amber-950/30 border-amber-500/40 text-amber-200' 
                        : 'bg-amber-50/90 border-amber-200 text-amber-900'
                    }`}>
                      <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <div className="text-xs leading-relaxed">
                        <strong className="font-bold">Ловушка ЕГЭ:</strong> {sec.egeTrap}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Bottom CTA to Flashcards */}
              <div className="pt-4 flex justify-end">
                <button
                  onClick={() => {
                    sounds.playClick();
                    setActiveTab('flashcards');
                  }}
                  className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition-all cursor-pointer hover:scale-[1.01]"
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
              {/* Card Meta & Hint */}
              <div className="w-full flex items-center justify-between text-xs max-w-lg">
                <span className={`font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Карточка {cardIndex + 1} из {topic.flashcards.length}
                </span>
                <span className="text-amber-500 font-bold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  +15 XP за знание
                </span>
              </div>

              {/* Progress Line */}
              <div className={`w-full max-w-lg h-1.5 rounded-full overflow-hidden ${
                isDark ? 'bg-slate-800' : 'bg-slate-200'
              }`}>
                <div 
                  className="bg-indigo-600 h-full transition-all duration-300"
                  style={{ width: `${((cardIndex + 1) / topic.flashcards.length) * 100}%` }}
                />
              </div>

              {/* 3D Flip Card */}
              <div 
                onClick={() => {
                  sounds.playClick();
                  setIsFlipped(!isFlipped);
                }}
                className="relative w-full max-w-lg h-72 cursor-pointer perspective"
              >
                <div 
                  className={`w-full h-full rounded-3xl border transition-all duration-300 p-8 text-center flex flex-col items-center justify-center select-none shadow-xl ${
                    isFlipped
                      ? isDark 
                        ? 'bg-slate-800 border-indigo-500 text-white ring-2 ring-indigo-500/30' 
                        : 'bg-indigo-50/90 border-indigo-300 text-indigo-950 ring-2 ring-indigo-200'
                      : isDark
                        ? 'bg-gradient-to-br from-slate-900 to-slate-800/90 border-slate-700 text-white hover:border-slate-500'
                        : 'bg-gradient-to-br from-white to-slate-50 border-slate-200 text-slate-900 hover:border-slate-300 shadow-md'
                  }`}
                >
                  <div className={`text-[11px] font-bold uppercase tracking-wider mb-4 flex items-center gap-1.5 ${
                    isDark ? 'text-indigo-400' : 'text-indigo-600'
                  }`}>
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>{isFlipped ? 'Определение / Ответ' : 'Понятие (Нажмите или пробел)'}</span>
                  </div>

                  <div className="text-lg sm:text-xl font-black leading-relaxed max-w-md">
                    {isFlipped ? currentFlashcard.definition : currentFlashcard.term}
                  </div>

                  {currentFlashcard.hint && !isFlipped && (
                    <div className={`text-xs mt-4 italic ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      Подсказка: {currentFlashcard.hint}
                    </div>
                  )}

                  <div className={`text-[10px] mt-6 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    Пробел — перевернуть · Стрелки — навигация · Enter — знаю
                  </div>
                </div>
              </div>

              {/* Flashcard Action Buttons */}
              <div className="flex items-center gap-3 w-full max-w-lg justify-between pt-2">
                <button
                  onClick={handleFlashcardPrev}
                  disabled={cardIndex === 0}
                  className={`px-4 py-2.5 rounded-xl disabled:opacity-30 text-xs font-bold flex items-center gap-1.5 transition-colors ${
                    isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Назад</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleFlashcardNext}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                      isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    Повторить
                  </button>

                  <button
                    onClick={handleFlashcardKnown}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Я знаю!</span>
                  </button>
                </div>

                <button
                  onClick={handleFlashcardNext}
                  disabled={cardIndex === topic.flashcards.length - 1}
                  className={`px-4 py-2.5 rounded-xl disabled:opacity-30 text-xs font-bold flex items-center gap-1.5 transition-colors ${
                    isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  <span>Далее</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Ready to Test button */}
              <div className={`pt-6 border-t w-full max-w-lg flex justify-center ${
                isDark ? 'border-slate-800' : 'border-slate-100'
              }`}>
                <button
                  onClick={() => {
                    sounds.playClick();
                    setActiveTab('quiz');
                  }}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-95 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer"
                >
                  <Trophy className="w-4 h-4" />
                  <span>Перейти к тесту уровня</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: QUIZ */}
          {activeTab === 'quiz' && (
            <div className="space-y-6">
              {!quizFinished ? (
                <div className="space-y-6 max-w-2xl mx-auto">
                  {/* Progress Header */}
                  <div className={`flex items-center justify-between text-xs font-semibold ${
                    isDark ? 'text-slate-400' : 'text-slate-500'
                  }`}>
                    <span>
                      Вопрос {quizQuestionIndex + 1} из {topic.quiz.length}
                    </span>
                    <span className="text-amber-500">
                      Верно: {correctAnswersCount}
                    </span>
                  </div>

                  {/* Question Container */}
                  <div className={`p-6 rounded-3xl border space-y-2.5 ${
                    isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <span className="text-[11px] font-black uppercase tracking-wider text-indigo-500">
                      Задание в формате ЕГЭ
                    </span>
                    <h3 className={`text-base sm:text-lg font-black leading-relaxed whitespace-pre-line ${
                      isDark ? 'text-white' : 'text-slate-900'
                    }`}>
                      {currentQuizQuestion.question}
                    </h3>
                  </div>

                  {/* Options */}
                  <div className="space-y-3">
                    {currentQuizQuestion.options.map((opt) => {
                      const isSelected = selectedOptionId === opt.id;
                      let optionClasses = isDark 
                        ? 'bg-slate-900/80 border-slate-800 text-slate-200 hover:border-slate-600'
                        : 'bg-white border-slate-200 text-slate-800 hover:border-slate-400 shadow-2xs';

                      if (isAnswerSubmitted) {
                        if (opt.isCorrect) {
                          optionClasses = isDark
                            ? 'bg-emerald-950/60 border-emerald-500 text-emerald-200 ring-2 ring-emerald-500/30'
                            : 'bg-emerald-50 border-emerald-400 text-emerald-900 ring-2 ring-emerald-300';
                        } else if (isSelected && !opt.isCorrect) {
                          optionClasses = isDark
                            ? 'bg-rose-950/60 border-rose-500 text-rose-200 ring-2 ring-rose-500/30'
                            : 'bg-rose-50 border-rose-400 text-rose-900 ring-2 ring-rose-300';
                        } else {
                          optionClasses = isDark 
                            ? 'bg-slate-950/40 border-slate-850 text-slate-600 opacity-50' 
                            : 'bg-slate-50 border-slate-200 text-slate-400 opacity-50';
                        }
                      } else if (isSelected) {
                        optionClasses = isDark
                          ? 'bg-indigo-950/70 border-indigo-500 text-white ring-2 ring-indigo-500/30'
                          : 'bg-indigo-50 border-indigo-400 text-indigo-950 ring-2 ring-indigo-300';
                      }

                      return (
                        <button
                          key={opt.id}
                          onClick={() => handleSelectOption(opt.id)}
                          disabled={isAnswerSubmitted}
                          className={`w-full text-left p-4.5 rounded-2xl border text-sm transition-all flex items-start gap-3.5 cursor-pointer ${optionClasses}`}
                        >
                          <span className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs font-black shrink-0 mt-0.5 ${
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

                  {/* Explanation Callout */}
                  {isAnswerSubmitted && (
                    <div className={`p-4.5 rounded-2xl border space-y-2 animate-fadeIn ${
                      isDark 
                        ? 'bg-slate-800/90 border-slate-700' 
                        : 'bg-slate-100 border-slate-200 text-slate-800'
                    }`}>
                      <div className="flex items-center gap-2 text-xs font-bold text-amber-500">
                        <AlertCircle className="w-4 h-4" />
                        <span>Пояснение:</span>
                      </div>
                      <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
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
                        className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
                      >
                        Проверить ответ
                      </button>
                    ) : (
                      <button
                        onClick={handleNextQuizQuestion}
                        className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm shadow-md flex items-center gap-2 transition-all cursor-pointer"
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
                /* QUIZ RESULT SCREEN */
                <div className="max-w-md mx-auto text-center space-y-6 py-6 animate-fadeIn">
                  <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-400 to-orange-500 text-slate-950 flex items-center justify-center mx-auto shadow-2xl shadow-amber-500/30">
                    <Trophy className="w-10 h-10" />
                  </div>

                  <div className="space-y-1.5">
                    <h3 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      Уровень {topic.id} пройден!
                    </h3>
                    <p className={`text-xs ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                      Верных ответов: <strong className="text-emerald-500">{correctAnswersCount}</strong> из {topic.quiz.length}
                    </p>
                  </div>

                  {/* Stars Award */}
                  <div className="flex items-center justify-center gap-2.5">
                    {[1, 2, 3].map((s) => {
                      const earnedStars = Math.round((correctAnswersCount / topic.quiz.length) * 100) >= 95 ? 3 : Math.round((correctAnswersCount / topic.quiz.length) * 100) >= 65 ? 2 : 1;
                      return (
                        <Star
                          key={s}
                          className={`w-10 h-10 ${
                            s <= earnedStars
                              ? 'fill-amber-400 text-amber-400 scale-110 drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]'
                              : isDark ? 'text-slate-800' : 'text-slate-200'
                          } transition-all duration-300`}
                        />
                      );
                    })}
                  </div>

                  <div className={`p-4 rounded-2xl border text-xs font-semibold ${
                    isDark ? 'bg-slate-950/80 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}>
                    Начислено: <strong className="text-amber-500">+100 XP</strong> и открыта следующая тема!
                  </div>

                  {/* Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                    <button
                      onClick={restartQuiz}
                      className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                        isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      Пройти заново
                    </button>

                    {topic.id < 47 && (
                      <button
                        onClick={() => {
                          sounds.playClick();
                          onNextLevel(topic.id + 1);
                        }}
                        className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 cursor-pointer"
                      >
                        <span>Тема {topic.id + 1}</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    )}

                    <button
                      onClick={onClose}
                      className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                        isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      На карту
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
