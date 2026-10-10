import React, { useState } from 'react';
import { X, Github, Copy, Check, ShieldCheck } from 'lucide-react';
import { sounds } from '../utils/audio';

interface GithubPagesGuideModalProps {
  onClose: () => void;
  theme?: 'dark' | 'light';
}

export const GithubPagesGuideModal: React.FC<GithubPagesGuideModalProps> = ({ 
  onClose,
  theme = 'dark'
}) => {
  const isDark = theme === 'dark';
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copySnippet = (index: number, code: string) => {
    sounds.playClick();
    navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1800);
  };

  const gitCommands = `git init
git add .
git commit -m "ЕГЭ Обществознание: 47 уровней квеста"
git branch -M main
git remote add origin https://github.com/ВАШ_ЮЗЕРНЕЙМ/ВАШ_РЕПОЗИТОРИЙ.git
git push -u origin main`;

  const manualBuildCommands = `npm run build
npx gh-pages -d dist`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className={`relative w-full max-w-2xl rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden border transition-colors ${
        isDark ? 'bg-slate-900 border-slate-700/80 text-white' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-4.5 border-b shrink-0 ${
          isDark ? 'border-slate-800 bg-slate-900/95' : 'border-slate-100 bg-slate-50/80'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shadow-xs">
              <Github className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight">
                Публикация на GitHub Pages
              </h2>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Бесплатный запуск сайта в интернет за 2 шага
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-2 rounded-xl transition-colors ${
              isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-400 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 text-sm">
          {/* Key Advantage Box */}
          <div className={`p-5 rounded-2xl border space-y-2 ${
            isDark 
              ? 'bg-emerald-950/30 border-emerald-500/30' 
              : 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
          }`}>
            <div className="flex items-center gap-2 text-emerald-500 font-black text-xs uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>Проект полностью готов к GitHub Pages</span>
            </div>
            <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              В файле <code className="text-emerald-500 font-bold">vite.config.ts</code> уже настроен <code className="text-emerald-500 font-bold">base: './'</code>, а в проекте создан рабочий workflow <code className="text-emerald-500 font-bold">.github/workflows/deploy.yml</code>.
            </p>
          </div>

          {/* Option 1: The Easiest Way */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 font-black text-base">
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs">1</span>
              <span>Автоматический деплой через GitHub Actions (Рекомендуется)</span>
            </div>

            <ol className={`list-decimal list-inside space-y-2 text-xs pl-1 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              <li>Создайте репозиторий на <strong>github.com</strong> (например, <code className="text-indigo-500 font-bold">ege-quest</code>).</li>
              <li>В терминале в папке с сайтом выполните команды:</li>
            </ol>

            <div className={`relative rounded-2xl p-4 font-mono text-xs border ${
              isDark ? 'bg-slate-950 border-slate-800 text-indigo-300' : 'bg-slate-900 border-slate-800 text-indigo-200'
            }`}>
              <button
                onClick={() => copySnippet(1, gitCommands)}
                className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center gap-1 text-[11px] font-sans font-bold cursor-pointer transition-colors"
              >
                {copiedIndex === 1 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedIndex === 1 ? 'Скопировано!' : 'Копировать'}</span>
              </button>
              <pre className="whitespace-pre-wrap">{gitCommands}</pre>
            </div>

            <ol start={3} className={`list-decimal list-inside space-y-2 text-xs pl-1 pt-1 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              <li>Откройте репозиторий на GitHub → <strong>Settings</strong> → слева выберите <strong>Pages</strong>.</li>
              <li>В строке <em>Source</em> выберите: <strong className="text-amber-500">GitHub Actions</strong>.</li>
              <li>Через 1-2 минуты сайт откроется по адресу: <br/><strong className="text-emerald-500">https://ВАШ_НИК.github.io/ege-quest/</strong></li>
            </ol>
          </div>

          {/* Option 2: Manual gh-pages command */}
          <div className={`space-y-3 pt-5 border-t ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
            <div className="flex items-center gap-2 font-black text-sm">
              <span className="w-5 h-5 rounded-full bg-slate-600 text-white flex items-center justify-center text-xs">2</span>
              <span>Альтернатива: публикация через ветку gh-pages</span>
            </div>
            <div className={`relative rounded-2xl p-3.5 font-mono text-xs border ${
              isDark ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-slate-900 border-slate-800 text-slate-200'
            }`}>
              <button
                onClick={() => copySnippet(2, manualBuildCommands)}
                className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center gap-1 text-[11px] font-sans font-bold cursor-pointer transition-colors"
              >
                {copiedIndex === 2 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedIndex === 2 ? 'Скопировано' : 'Копировать'}</span>
              </button>
              <pre className="whitespace-pre-wrap">{manualBuildCommands}</pre>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={`p-5 border-t flex justify-end shrink-0 ${
          isDark ? 'border-slate-800 bg-slate-900/90' : 'border-slate-100 bg-slate-50/80'
        }`}>
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold cursor-pointer shadow-md"
          >
            Всё понятно!
          </button>
        </div>
      </div>
    </div>
  );
};
