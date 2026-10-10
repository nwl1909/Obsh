import React, { useState, useMemo } from 'react';
import { GLOSSARY_ITEMS } from '../data/glossary';
import { SECTIONS } from '../data/sections';
import { sounds } from '../utils/audio';
import { isDarkTheme } from '../utils/themes';
import { ThemeId } from '../types';
import { 
  X, 
  Search, 
  BookMarked, 
  Copy, 
  Check
} from 'lucide-react';

interface GlossaryModalProps {
  onClose: () => void;
  onOpenTopic?: (topicId: number) => void;
  theme?: ThemeId;
}

export const GlossaryModal: React.FC<GlossaryModalProps> = ({ 
  onClose, 
  onOpenTopic,
  theme = 'dark'
}) => {
  const isDark = isDarkTheme(theme);
  const [search, setSearch] = useState('');
  const [selectedSection, setSelectedSection] = useState<number | 'all'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredItems = useMemo(() => {
    return GLOSSARY_ITEMS.filter((item) => {
      if (selectedSection !== 'all' && item.sectionId !== selectedSection) {
        return false;
      }
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        return (
          item.term.toLowerCase().includes(q) ||
          item.definition.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [search, selectedSection]);

  const copyTerm = (id: string, text: string) => {
    sounds.playClick();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className={`relative w-full max-w-4xl rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden border transition-colors ${
        isDark ? 'bg-slate-900 border-slate-700/80 text-white' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-4.5 border-b shrink-0 ${
          isDark ? 'border-slate-800 bg-slate-900/95' : 'border-slate-100 bg-slate-50/80'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shadow-xs">
              <BookMarked className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight">
                Словарь ключевых понятий ЕГЭ
              </h2>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Все определения из конспектов курса ({GLOSSARY_ITEMS.length} терминов)
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

        {/* Search & Filters */}
        <div className={`p-6 pb-4 space-y-4 border-b shrink-0 ${
          isDark ? 'border-slate-800 bg-slate-950/40' : 'border-slate-100 bg-slate-50/60'
        }`}>
          <div className="relative">
            <Search className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${
              isDark ? 'text-slate-400' : 'text-slate-400'
            }`} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Быстрый поиск термина или определения..."
              className={`w-full rounded-2xl pl-10 pr-4 py-2.5 text-sm transition-all border focus:outline-none ${
                isDark 
                  ? 'bg-slate-900 border-slate-800 text-white placeholder-slate-500 focus:border-indigo-500' 
                  : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-indigo-500 shadow-2xs'
              }`}
            />
          </div>

          {/* Section filter tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => {
                sounds.playClick();
                setSelectedSection('all');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition-all ${
                selectedSection === 'all'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : isDark ? 'bg-slate-800 text-slate-400 hover:text-white' : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
              }`}
            >
              Все термины
            </button>
            {SECTIONS.map((sec) => (
              <button
                key={sec.id}
                onClick={() => {
                  sounds.playClick();
                  setSelectedSection(sec.id);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition-all ${
                  selectedSection === sec.id
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : isDark ? 'bg-slate-800 text-slate-400 hover:text-white' : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                }`}
              >
                Раздел {sec.id}: {sec.shortTitle}
              </button>
            ))}
          </div>
        </div>

        {/* List of Definitions */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {filteredItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className={`p-4.5 rounded-2xl border transition-all flex flex-col justify-between group ${
                    isDark 
                      ? 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700' 
                      : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className={`font-black text-sm transition-colors ${
                        isDark ? 'text-white group-hover:text-amber-400' : 'text-slate-900 group-hover:text-indigo-600'
                      }`}>
                        {item.term}
                      </h4>
                      <button
                        onClick={() => copyTerm(item.id, `${item.term} — ${item.definition}`)}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                          isDark ? 'text-slate-500 hover:text-slate-200 hover:bg-slate-800' : 'text-slate-400 hover:text-slate-900 hover:bg-slate-100'
                        }`}
                        title="Копировать определение"
                      >
                        {copiedId === item.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    <p className={`text-xs leading-relaxed ${
                      isDark ? 'text-slate-300' : 'text-slate-600'
                    }`}>
                      {item.definition}
                    </p>
                  </div>

                  <div className={`pt-3 mt-3 border-t flex items-center justify-between text-[11px] ${
                    isDark ? 'border-slate-900 text-slate-500' : 'border-slate-100 text-slate-400'
                  }`}>
                    <span>Тема {item.topicId}</span>
                    <span className="text-indigo-500 font-bold">Раздел {item.sectionId}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={`text-center py-12 text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Ничего не найдено по запросу «{search}»
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
