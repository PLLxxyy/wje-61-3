import React from 'react';
import { useAppStore } from '../store/useAppStore';

interface TerminalFrameProps {
  children: React.ReactNode;
}

export function TerminalFrame({ children }: TerminalFrameProps) {
  const { crtEffect } = useAppStore();

  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden border-4 border-gray-700 shadow-2xl">
      <div className="bg-gray-800 px-4 py-2 flex items-center gap-2 border-b border-gray-700">
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
        </div>
        <div className="flex-1 text-center text-gray-400 text-sm font-mono">
          ◈ RETRO WEB RENDERER ◈
        </div>
        <div className="w-16"></div>
      </div>
      <div className={`terminal-bg terminal-font ${crtEffect ? 'crt-effect flicker' : ''}`}>
        {children}
      </div>
    </div>
  );
}
