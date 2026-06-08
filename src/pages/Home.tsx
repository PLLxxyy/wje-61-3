import { TerminalFrame } from '@/components/TerminalFrame';
import { InputPanel } from '@/components/InputPanel';
import { ControlPanel } from '@/components/ControlPanel';
import { HistoryPanel } from '@/components/HistoryPanel';
import { RenderView } from '@/components/RenderView';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-950 p-4 md:p-8">
      <div className="max-w-6xl mx-auto h-[calc(100vh-4rem)] flex flex-col gap-4">
        <header className="text-center py-2">
          <h1 className="text-2xl md:text-3xl font-bold text-green-400 tracking-widest">
            ═══[ 复古网页渲染器 ]═══
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            RETRO WEB RENDERER - BBS & GOPHER STYLE
          </p>
        </header>

        <TerminalFrame>
          <div className="flex flex-col h-[calc(100vh-12rem)]">
            <InputPanel />
            <ControlPanel />
            <HistoryPanel />
            <RenderView />
          </div>
        </TerminalFrame>

        <footer className="text-center text-gray-600 text-xs">
          <p>
            使用方法: 输入网址或粘贴 HTML/Markdown 内容 → 选择风格和配色 → 导出或复制
          </p>
        </footer>
      </div>
    </div>
  );
}