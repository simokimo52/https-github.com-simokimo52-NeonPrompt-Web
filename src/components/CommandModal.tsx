import React, { useState, useEffect, useRef } from 'react';
import { Search, X, ArrowRight, Terminal, BookOpen, Layers } from 'lucide-react';
import { PromptItem, Category, filterPrompts } from '../lib/promptEngine';

interface CommandModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  customPrompts: PromptItem[];
  onSelectPrompt: (prompt: PromptItem) => void;
  onSelectCategory: (categorySlug: string, subcategorySlug?: string) => void;
  onNavigate: (view: string) => void;
}

export const CommandModal: React.FC<CommandModalProps> = ({
  isOpen,
  onClose,
  categories,
  customPrompts,
  onSelectPrompt,
  onSelectCategory,
  onNavigate,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 20);
    }
  }, [isOpen]);

  const matchedPrompts = React.useMemo(() => {
    if (!isOpen) return [];
    return filterPrompts({
      query,
      limit: 8,
      customPrompts,
      sortBy: 'popular',
    }).items;
  }, [isOpen, query, customPrompts]);

  const matchedCategories = React.useMemo(() => {
    if (!isOpen) return [];
    const q = query.trim().toLowerCase();
    if (!q) return categories.slice(0, 4);
    return categories
      .filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.subcategories.some((s) => s.name.toLowerCase().includes(q))
      )
      .slice(0, 4);
  }, [isOpen, query, categories]);

  const totalResults = matchedPrompts.length + matchedCategories.length;

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (totalResults > 0 ? (prev + 1) % totalResults : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (totalResults > 0 ? (prev - 1 + totalResults) % totalResults : 0));
      } else if (e.key === 'Enter' && totalResults > 0) {
        e.preventDefault();
        if (selectedIndex < matchedPrompts.length) {
          onSelectPrompt(matchedPrompts[selectedIndex]);
          onClose();
        } else {
          const catIdx = selectedIndex - matchedPrompts.length;
          const cat = matchedCategories[catIdx];
          if (cat) {
            onSelectCategory(cat.slug);
            onClose();
          }
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, totalResults, selectedIndex, matchedPrompts, matchedCategories, onSelectPrompt, onSelectCategory, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-[#1A1A1A]/75 pt-16 px-4"
      role="dialog"
      aria-modal="true"
      aria-label="Global Command Search"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-[#FFFFFF] border-4 border-[#1A1A1A] shadow-[6px_6px_0px_#1A1A1A] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 py-3.5 border-b-4 border-[#1A1A1A] bg-[#FFD700]">
          <Search className="w-5 h-5 text-[#1A1A1A] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search 5,000+ prompts, 200 subcategories, models, or architectures..."
            aria-label="Search prompts and categories"
            className="w-full bg-transparent text-sm font-semibold text-[#1A1A1A] placeholder-[#1A1A1A]/70 focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label="Clear search query"
              className="text-xs font-bold text-[#1A1A1A] bg-[#FFFFFF] border-2 border-[#1A1A1A] px-2 py-0.5 whitespace-nowrap shrink-0"
            >
              Clear
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close command search"
            className="p-1 text-[#1A1A1A] bg-[#FFFFFF] border-2 border-[#1A1A1A] hover:bg-[#E53935] hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="max-h-[65vh] overflow-y-auto divide-y-4 divide-[#1A1A1A]">
          {matchedPrompts.length > 0 && (
            <div className="p-4">
              <div className="px-2 pb-2 text-xs font-bold uppercase tracking-wider text-[#1A1A1A] flex items-center justify-between">
                <span>System Prompts</span>
                <span className="font-mono tabular-nums">{matchedPrompts.length} shown</span>
              </div>
              <div className="space-y-1.5">
                {matchedPrompts.map((prompt, idx) => {
                  const isSelected = idx === selectedIndex;
                  return (
                    <button
                      key={prompt.id}
                      type="button"
                      onClick={() => {
                        onSelectPrompt(prompt);
                        onClose();
                      }}
                      className={`w-full text-left px-3 py-2.5 border-2 transition-colors flex items-center justify-between gap-4 ${
                        isSelected
                          ? 'bg-[#1976D2] text-white border-[#1A1A1A]'
                          : 'bg-[#F5F5F5] hover:bg-[#FFD700]/40 text-[#1A1A1A] border-[#1A1A1A]'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="text-sm font-bold truncate font-display">{prompt.title}</div>
                        <div
                          className={`text-xs flex items-center gap-2 mt-0.5 truncate ${
                            isSelected ? 'text-white/90' : 'text-[#1A1A1A]/75'
                          }`}
                        >
                          <span>{prompt.categoryName}</span>
                          <span aria-hidden="true">·</span>
                          <span>{prompt.subcategoryName}</span>
                          <span aria-hidden="true">·</span>
                          <span>{prompt.model}</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono tabular-nums">{prompt.tokens} tokens</span>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 shrink-0" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {matchedCategories.length > 0 && (
            <div className="p-4">
              <div className="px-2 pb-2 text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">
                Categories & Directories
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {matchedCategories.map((cat, idx) => {
                  const globalIdx = matchedPrompts.length + idx;
                  const isSelected = globalIdx === selectedIndex;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        onSelectCategory(cat.slug);
                        onClose();
                      }}
                      className={`text-left px-3 py-2.5 border-2 border-[#1A1A1A] transition-colors flex items-center justify-between ${
                        isSelected
                          ? 'bg-[#E53935] text-white'
                          : 'bg-[#F5F5F5] hover:bg-[#FFD700] text-[#1A1A1A]'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="text-sm font-bold truncate font-display">{cat.name}</div>
                        <div
                          className={`text-xs font-mono tabular-nums ${
                            isSelected ? 'text-white/90' : 'text-[#1A1A1A]/75'
                          }`}
                        >
                          {cat.subcategories.length} subcategories · {cat.promptCount} prompts
                        </div>
                      </div>
                      <Layers className="w-4 h-4 shrink-0" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {totalResults === 0 && (
            <div className="py-12 px-6 text-center bg-[#FFFFFF]">
              <p className="text-base font-bold text-[#1A1A1A] font-display">No prompts matched "{query}"</p>
              <p className="text-xs text-[#1A1A1A]/75 mt-1">
                Try searching for a model (Claude 3.5 Sonnet, GPT-4o, Midjourney v6) or open the Prompt Builder.
              </p>
              <div className="mt-4 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    onNavigate('builder');
                    onClose();
                  }}
                  className="px-4 py-2 text-xs font-bold bg-[#E53935] text-white border-4 border-[#1A1A1A] shadow-[4px_4px_0px_#1A1A1A] hover:bg-[#1976D2] transition-colors whitespace-nowrap shrink-0"
                >
                  Open Prompt Builder
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="px-4 py-2.5 bg-[#F5F5F5] border-t-4 border-[#1A1A1A] flex items-center justify-between text-xs font-semibold text-[#1A1A1A]">
          <div className="flex items-center gap-3">
            <span>Navigate with Up/Down</span>
            <span aria-hidden="true">·</span>
            <span>Enter to open</span>
            <span aria-hidden="true">·</span>
            <span>Esc to close</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => {
                onNavigate('builder');
                onClose();
              }}
              className="text-[#E53935] hover:underline flex items-center gap-1 whitespace-nowrap shrink-0 font-bold"
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Prompt Builder</span>
            </button>
            <button
              type="button"
              onClick={() => {
                onNavigate('guides');
                onClose();
              }}
              className="text-[#1976D2] hover:underline flex items-center gap-1 whitespace-nowrap shrink-0 font-bold"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Guides</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
