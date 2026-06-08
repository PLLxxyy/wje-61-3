import { create } from 'zustand';
import type { RenderStyle, TerminalTheme, RenderResult, ContentNode } from '../engines/types';
import { parseContent } from '../engines/parser';
import { renderBBS } from '../engines/bbsRenderer';
import { renderGopher } from '../engines/gopherRenderer';

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
  
  setInputMode: (mode: 'url' | 'text') => void;
  setRenderStyle: (style: RenderStyle) => void;
  setTheme: (theme: TerminalTheme) => void;
  toggleCrtEffect: () => void;
  setContent: (content: string, source: string) => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
  render: () => void;
  clearAll: () => void;
}

const createEmptyResult = (): RenderResult => ({
  text: '',
  lines: [],
  linkMap: new Map(),
});

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
}));
