import { create } from 'zustand';
import type { RenderStyle, TerminalTheme, RenderResult, ContentNode, HistoryItem } from '../engines/types';
import { parseContent } from '../engines/parser';
import { renderBBS } from '../engines/bbsRenderer';
import { renderGopher } from '../engines/gopherRenderer';

const HISTORY_STORAGE_KEY = 'retro-renderer-history';
const MAX_HISTORY_ITEMS = 10;

interface AppState {
  inputMode: 'url' | 'text';
  renderStyle: RenderStyle;
  theme: TerminalTheme;
  crtEffect: boolean;
  content: string;
  contentSource: string;
  error: string | null;
  loading: boolean;
  parsedNodes: ContentNode[];
  renderResult: RenderResult | null;
  history: HistoryItem[];
  
  setInputMode: (mode: 'url' | 'text') => void;
  setRenderStyle: (style: RenderStyle) => void;
  setTheme: (theme: TerminalTheme) => void;
  toggleCrtEffect: () => void;
  setContent: (content: string, source: string) => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
  render: () => void;
  clearAll: () => void;
  loadHistory: () => void;
  addToHistory: () => void;
  loadFromHistory: (id: string) => void;
  deleteHistoryItem: (id: string) => void;
  clearHistory: () => void;
}

const createEmptyResult = (): RenderResult => ({
  text: '',
  lines: [],
  linkMap: new Map(),
});

const loadHistoryFromStorage = (): HistoryItem[] => {
  try {
    const stored = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    console.error('Failed to load history from localStorage');
  }
  return [];
};

const saveHistoryToStorage = (history: HistoryItem[]) => {
  try {
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
  } catch {
    console.error('Failed to save history to localStorage');
  }
};

export const useAppStore = create<AppState>((set, get) => ({
  inputMode: 'url',
  renderStyle: 'bbs',
  theme: 'green',
  crtEffect: true,
  content: '',
  contentSource: '',
  error: null,
  loading: false,
  parsedNodes: [],
  renderResult: null,
  history: [],

  setInputMode: (mode) => set({ inputMode: mode }),
  setRenderStyle: (style) => {
    set({ renderStyle: style });
    const { parsedNodes } = get();
    if (parsedNodes.length > 0) {
      get().render();
    }
  },
  setTheme: (theme) => set({ theme }),
  toggleCrtEffect: () => set((state) => ({ crtEffect: !state.crtEffect })),
  
  setContent: (content, source) => {
    set({ content, contentSource: source, error: null });
    try {
      const nodes = parseContent(content);
      set({ parsedNodes: nodes });
      get().render();
    } catch (err) {
      set({ 
        error: err instanceof Error ? err.message : '解析内容失败',
        parsedNodes: [],
        renderResult: createEmptyResult(),
      });
    }
  },
  
  setError: (error) => set({ error }),
  setLoading: (loading) => set({ loading }),

  render: () => {
    const { parsedNodes, renderStyle } = get();
    if (parsedNodes.length === 0) {
      set({ renderResult: null });
      return;
    }

    try {
      let result: RenderResult;
      if (renderStyle === 'bbs') {
        result = renderBBS(parsedNodes);
      } else {
        result = renderGopher(parsedNodes);
      }
      set({ renderResult: result, error: null });
      get().addToHistory();
    } catch (err) {
      set({ 
        error: err instanceof Error ? err.message : '渲染失败',
        renderResult: null,
      });
    }
  },

  clearAll: () => set({
    content: '',
    contentSource: '',
    error: null,
    parsedNodes: [],
    renderResult: null,
  }),

  loadHistory: () => {
    set({ history: loadHistoryFromStorage() });
  },

  addToHistory: () => {
    const { renderResult, contentSource, content, renderStyle, history } = get();
    if (!renderResult || !contentSource) return;

    const generateTitle = (): string => {
      if (contentSource === 'manual-input') {
        const cleanContent = content.replace(/<[^>]*>/g, '').replace(/[#*`_\[\]()]/g, '').trim();
        const firstLine = cleanContent.split('\n').find((line) => line.trim().length > 0) || '';
        const snippet = firstLine.substring(0, 30).trim();
        const count = history.filter((h) => h.contentSource === 'manual-input').length + 1;
        return snippet ? `粘贴 #${count}: ${snippet}` : `粘贴内容 #${count}`;
      }
      const count = history.filter((h) => h.contentSource === contentSource).length + 1;
      return count > 1 ? `${contentSource} (#${count})` : contentSource;
    };

    const newItem: HistoryItem = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: generateTitle(),
      contentSource,
      content,
      renderStyle,
      renderResult: {
        text: renderResult.text,
        lines: renderResult.lines,
        linkMap: Array.from(renderResult.linkMap.entries()),
      },
      timestamp: Date.now(),
    };

    const newHistory = [newItem, ...history].slice(0, MAX_HISTORY_ITEMS);
    set({ history: newHistory });
    saveHistoryToStorage(newHistory);
  },

  loadFromHistory: (id: string) => {
    const { history } = get();
    const item = history.find((h) => h.id === id);
    if (!item) return;

    try {
      const nodes = parseContent(item.content);
      const restoredResult: RenderResult = {
        text: item.renderResult.text,
        lines: item.renderResult.lines,
        linkMap: new Map(item.renderResult.linkMap),
      };
      set({
        content: item.content,
        contentSource: item.contentSource,
        renderStyle: item.renderStyle,
        parsedNodes: nodes,
        renderResult: restoredResult,
        error: null,
      });
    } catch (err) {
      set({ 
        error: err instanceof Error ? err.message : '加载历史记录失败',
      });
    }
  },

  deleteHistoryItem: (id: string) => {
    const newHistory = get().history.filter((h) => h.id !== id);
    set({ history: newHistory });
    saveHistoryToStorage(newHistory);
  },

  clearHistory: () => {
    set({ history: [] });
    saveHistoryToStorage([]);
  },
}));
