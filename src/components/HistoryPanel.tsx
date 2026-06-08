import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { History, Trash2, ChevronDown, ChevronUp, Clock } from 'lucide-react';
import type { HistoryItem } from '../engines/types';

const formatTime = (timestamp: number): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return '刚刚';
  if (minutes < 60) return `${minutes} 分钟前`;
  if (hours < 24) return `${hours} 小时前`;
  if (days < 7) return `${days} 天前`;
  return date.toLocaleDateString('zh-CN');
};

const truncateText = (text: string, maxLen: number = 50): string => {
  if (text.length <= maxLen) return text;
  return text.substring(0, maxLen - 3) + '...';
};

export function HistoryPanel() {
  const { 
    history, 
    loadHistory, 
    loadFromHistory, 
    deleteHistoryItem, 
    clearHistory 
  } = useAppStore();
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const handleLoad = (item: HistoryItem, e: React.MouseEvent) => {
    e.stopPropagation();
    loadFromHistory(item.id);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteHistoryItem(id);
  };

  const handleClearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('确定要清空所有历史记录吗？')) {
      clearHistory();
    }
  };

  if (history.length === 0) {
    return null;
  }

  return (
    <div className="border-b-2 border-current terminal-border">
      <button
        className="w-full p-3 flex items-center justify-between hover:bg-opacity-10 hover:bg-current transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <History size={18} className="terminal-accent" />
          <span className="text-sm font-bold">历史记录</span>
          <span className="terminal-dim text-xs">({history.length} 条)</span>
        </div>
        {isExpanded ? (
          <ChevronUp size={18} className="terminal-dim" />
        ) : (
          <ChevronDown size={18} className="terminal-dim" />
        )}
      </button>

      {isExpanded && (
        <div className="p-3 pt-0 space-y-2 max-h-64 overflow-y-auto terminal-scrollbar">
          <div className="flex justify-end mb-2">
            <button
              className="text-xs terminal-dim hover:terminal-text transition-colors flex items-center gap-1"
              onClick={handleClearAll}
            >
              <Trash2 size={14} />
              清空全部
            </button>
          </div>
          {history.map((item) => (
            <div
              key={item.id}
              className="p-3 border border-current terminal-border hover:bg-opacity-5 hover:bg-current cursor-pointer group transition-all"
              onClick={(e) => handleLoad(item, e)}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-sm font-medium truncate">
                    <span
                      className="text-xs px-2 py-0.5 border border-current terminal-border uppercase"
                    >
                      {item.renderStyle}
                    </span>
                    <span className="truncate" title={item.title}>
                      {truncateText(item.title)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 mt-1 text-xs terminal-dim">
                    <Clock size={12} />
                    <span>{formatTime(item.timestamp)}</span>
                    <span className="ml-2">
                      {item.renderResult.lines.length} 行
                    </span>
                  </div>
                </div>
                <button
                  className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 transition-all"
                  onClick={(e) => handleDelete(item.id, e)}
                  title="删除"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
