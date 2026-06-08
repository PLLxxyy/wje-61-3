import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { Loader2 } from 'lucide-react';

export function RenderView() {
  const { renderResult, error, loading, contentSource, renderStyle } = useAppStore();

  const getWelcomeMessage = (): string => {
    if (renderStyle === 'bbs') {
      return `
╔══════════════════════════════════════════════════════════════════════════════╗
║  ◈◈◈  欢迎使用复古网页渲染器  ◈◈◈                                           ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║  请在上方输入网址或粘贴 HTML/Markdown 内容开始体验！                            ║
║                                                                              ║
║  功能特点：                                                                   ║
║  [1] BBS 风格 - 大色块背景、荧光字体、ASCII 字符画                            ║
║  [2] Gopher 风格 - 极简目录列表、类型图标                                     ║
║  [3] 四种终端配色 - 绿磷光、琥珀屏、蓝白、黑白                                 ║
║  [4] 导出 TXT 文件或复制到剪贴板                                              ║
║                                                                              ║
║  ═══════════════════════════════════════════════════════════════════════════   ║
║                                                                              ║
║  提示：如果无法抓取网页，请直接复制 HTML 源码粘贴到文本框中。                    ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
`;
    } else {
      return `
  
  ════════════════════════════════════════════════════════════════════════════
  
  📁 欢迎使用复古网页渲染器
  
     请在上方输入网址或粘贴 HTML/Markdown 内容开始体验！
  
  📋 功能特点：
     📄 BBS 风格 - 大色块背景、荧光字体、ASCII 字符画
     📄 Gopher 风格 - 极简目录列表、类型图标
     📄 四种终端配色 - 绿磷光、琥珀屏、蓝白、黑白
     📄 导出 TXT 文件或复制到剪贴板
  
  🔗 提示：如果无法抓取网页，请直接复制 HTML 源码粘贴到文本框中。
  
  ════════════════════════════════════════════════════════════════════════════
  
`;
    }
  };

  const displayContent = (): string => {
    if (loading) {
      return `
╔══════════════════════════════════════════════════════════════════════════════╗
║  正在加载内容，请稍候...                                                      ║
╚══════════════════════════════════════════════════════════════════════════════╝
`;
    }

    if (error) {
      return error;
    }

    if (renderResult) {
      return renderResult.text;
    }

    return getWelcomeMessage();
  };

  return (
    <div className="flex flex-col h-full">
      {contentSource && (
        <div className="px-4 py-2 border-b border-current terminal-border text-sm terminal-dim">
          来源: {contentSource}
        </div>
      )}
      <div className="flex-1 overflow-auto p-4 terminal-scrollbar">
        <pre className="whitespace-pre-wrap break-all terminal-font text-sm leading-relaxed">
          {loading ? (
            <div className="flex items-center gap-2">
              <Loader2 size={16} className="animate-spin" />
              <span>正在加载内容...</span>
            </div>
          ) : (
            displayContent()
          )}
        </pre>
      </div>
    </div>
  );
}
