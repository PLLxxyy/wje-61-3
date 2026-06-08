export type RenderStyle = 'bbs' | 'gopher';

export type TerminalTheme = 'green' | 'amber' | 'blue' | 'mono';

export type ContentType = 'url' | 'html' | 'markdown';

export type NodeType = 'heading' | 'paragraph' | 'link' | 'list' | 'listItem' | 'image' | 'block' | 'code' | 'separator';

export interface ContentNode {
  type: NodeType;
  level?: number;
  text: string;
  href?: string;
  alt?: string;
  children?: ContentNode[];
  ordered?: boolean;
}

export interface ThemeConfig {
  name: string;
  bg: string;
  text: string;
  accent: string;
  dim: string;
  border: string;
}

export interface RenderResult {
  text: string;
  lines: string[];
  linkMap: Map<number, string>;
}

export interface HistoryItem {
  id: string;
  contentSource: string;
  content: string;
  renderStyle: RenderStyle;
  renderResult: {
    text: string;
    lines: string[];
    linkMap: Array<[number, string]>;
  };
  timestamp: number;
}

export const TERMINAL_THEMES: Record<TerminalTheme, ThemeConfig> = {
  green: {
    name: '绿磷光',
    bg: '#000000',
    text: '#33FF33',
    accent: '#00FF00',
    dim: '#006600',
    border: '#33FF33',
  },
  amber: {
    name: '琥珀屏',
    bg: '#1A0F00',
    text: '#FFB000',
    accent: '#FFD700',
    dim: '#664400',
    border: '#FFB000',
  },
  blue: {
    name: '蓝白',
    bg: '#001A33',
    text: '#ADD8E6',
    accent: '#FFFFFF',
    dim: '#336699',
    border: '#ADD8E6',
  },
  mono: {
    name: '黑白',
    bg: '#000000',
    text: '#FFFFFF',
    accent: '#CCCCCC',
    dim: '#666666',
    border: '#FFFFFF',
  },
};

export const LINE_WIDTH = 78;
