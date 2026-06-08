import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { useTerminalTheme } from '../hooks/useTerminalTheme';
import { exportToTxt, copyToClipboard, generateFilename } from '../utils/export';
import { Monitor, Palette, Download, Copy, Check, MonitorCog } from 'lucide-react';
import type { TerminalTheme } from '../engines/types';

export function ControlPanel() {
  const { 
    renderStyle, 
    setRenderStyle, 
    crtEffect, 
    toggleCrtEffect,
    renderResult,
    contentSource,
  } = useAppStore();
  const { theme, setTheme, allThemes } = useTerminalTheme();
  const [copySuccess, setCopySuccess] = useState(false);

  const handleExport = () => {
    if (renderResult) {
      const filename = generateFilename(contentSource, renderStyle);
      exportToTxt(renderResult.text, filename);
    }
  };

  const handleCopy = async () => {
    if (renderResult) {
      const success = await copyToClipboard(renderResult.text);
      if (success) {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      }
    }
  };

  const themeOptions: { value: TerminalTheme; label: string; color: string }[] = [
    { value: 'green', label: '绿磷光', color: '#33FF33' },
    { value: 'amber', label: '琥珀屏', color: '#FFB000' },
    { value: 'blue', label: '蓝白', color: '#ADD8E6' },
    { value: 'mono', label: '黑白', color: '#FFFFFF' },
  ];

  return (
    <div className="p-4 space-y-4 border-b-2 border-current terminal-border">
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Monitor size={18} className="terminal-accent" />
            <span className="terminal-dim text-sm">风格:</span>
            <div className="flex gap-1">
              <button
                className={`terminal-button text-sm ${renderStyle === 'bbs' ? 'active' : ''}`}
                onClick={() => setRenderStyle('bbs')}
              >
                BBS
              </button>
              <button
                className={`terminal-button text-sm ${renderStyle === 'gopher' ? 'active' : ''}`}
                onClick={() => setRenderStyle('gopher')}
              >
                Gopher
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Palette size={18} className="terminal-accent" />
            <span className="terminal-dim text-sm">配色:</span>
            <div className="flex gap-1">
              {themeOptions.map((opt) => (
                <button
                  key={opt.value}
                  className={`w-8 h-8 rounded border-2 transition-all ${
                    theme === opt.value 
                      ? 'border-current scale-110' 
                      : 'border-gray-600 hover:scale-105'
                  }`}
                  style={{ backgroundColor: opt.color }}
                  onClick={() => setTheme(opt.value)}
                  title={opt.label}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <MonitorCog size={18} className="terminal-accent" />
            <span className="terminal-dim text-sm">CRT:</span>
            <button
              className={`terminal-button text-sm ${crtEffect ? 'active' : ''}`}
              onClick={toggleCrtEffect}
            >
              {crtEffect ? '开' : '关'}
            </button>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            className="terminal-button flex items-center gap-2 disabled:opacity-50"
            onClick={handleCopy}
            disabled={!renderResult}
          >
            {copySuccess ? <Check size={16} /> : <Copy size={16} />}
            {copySuccess ? '已复制' : '复制'}
          </button>
          <button
            className="terminal-button flex items-center gap-2 disabled:opacity-50"
            onClick={handleExport}
            disabled={!renderResult}
          >
            <Download size={16} />
            导出 TXT
          </button>
        </div>
      </div>
    </div>
  );
}
