import React, { useRef, useState } from 'react';
import { UserProgress } from '../types';
import { exportProgressJSON, importProgressJSON, INITIAL_PROGRESS, saveProgress } from '../utils/storage';
import { sounds } from '../utils/audio';
import { X, Download, Upload, Trash2, CheckCircle2, AlertTriangle } from 'lucide-react';

interface ProgressBackupModalProps {
  progress: UserProgress;
  onClose: () => void;
  onProgressUpdated: (newProgress: UserProgress) => void;
  theme?: 'dark' | 'light';
}

export const ProgressBackupModal: React.FC<ProgressBackupModalProps> = ({
  progress,
  onClose,
  onProgressUpdated,
  theme = 'dark',
}) => {
  const isDark = theme === 'dark';
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleExport = () => {
    sounds.playClick();
    exportProgressJSON(progress);
    setSuccessMessage('Файл с сохранением прогресса успешно скачан!');
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const imported = await importProgressJSON(file);
      sounds.playLevelComplete();
      onProgressUpdated(imported);
      setSuccessMessage('Прогресс успешно восстановлен из файла!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: unknown) {
      sounds.playIncorrect();
      setErrorMessage((err as Error)?.message || 'Ошибка чтения файла');
      setTimeout(() => setErrorMessage(null), 4000);
    }
  };

  const handleReset = () => {
    if (window.confirm('Вы уверены, что хотите сбросить весь прогресс уровней, очков и наград? Это действие необратимо.')) {
      sounds.playIncorrect();
      saveProgress(INITIAL_PROGRESS);
      onProgressUpdated(INITIAL_PROGRESS);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className={`relative w-full max-w-md rounded-3xl shadow-2xl flex flex-col overflow-hidden border transition-colors ${
        isDark ? 'bg-slate-900 border-slate-700/80 text-white' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-4.5 border-b shrink-0 ${
          isDark ? 'border-slate-800 bg-slate-900/95' : 'border-slate-100 bg-slate-50/80'
        }`}>
          <h2 className="text-base font-black tracking-tight">
            Резервная копия прогресса
          </h2>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-xl transition-colors ${
              isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-400 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-xs">
          <p className={`leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Весь ваш прогресс (пройденные темы, звезды, карточки и достижения) сохраняется в браузере в LocalStorage. Вы можете скачать файл сохранения, чтобы перенести его на телефон или другой компьютер.
          </p>

          {successMessage && (
            <div className="p-3.5 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-red-950/60 border border-red-500/40 text-red-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={handleExport}
              className="w-full py-3 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center justify-center gap-2 shadow-md cursor-pointer transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Скачать файл сохранения (.json)</span>
            </button>

            <div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".json"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className={`w-full py-3 px-4 rounded-2xl font-bold flex items-center justify-center gap-2 border transition-colors cursor-pointer ${
                  isDark 
                    ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700' 
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200'
                }`}
              >
                <Upload className="w-4 h-4" />
                <span>Загрузить сохранение из файла</span>
              </button>
            </div>
          </div>

          <div className={`pt-4 border-t ${isDark ? 'border-slate-800/80' : 'border-slate-100'}`}>
            <button
              onClick={handleReset}
              className="w-full py-2 px-3 rounded-xl text-rose-500 hover:bg-rose-500/10 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Сбросить весь прогресс до нуля</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
