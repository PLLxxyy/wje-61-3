import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { useContentFetch } from '../hooks/useContentFetch';
import { Globe, FileText, Loader2 } from 'lucide-react';

export function InputPanel() {
  const { inputMode, setInputMode, setContent, setError, setLoading } = useAppStore();
  const { 
    content: fetchedContent, 
    error: fetchError, 
    loading: fetchLoading, 
    source: fetchedSource,
    fetchUrl,
  } = useContentFetch();
  const [urlInput, setUrlInput] = useState('');
  const [textInput, setTextInput] = useState('');

  useEffect(() => {
    setLoading(fetchLoading);
  }, [fetchLoading, setLoading]);

  useEffect(() => {
    if (fetchedContent) {
      setContent(fetchedContent, fetchedSource);
    }
  }, [fetchedContent, fetchedSource, setContent]);

  useEffect(() => {
    if (fetchError) {
      setError(fetchError);
    }
  }, [fetchError, setError]);

  const handleFetchUrl = async () => {
    setError(null);
    await fetchUrl(urlInput);
  };

  const handleTextRender = () => {
    if (textInput.trim()) {
      setContent(textInput, 'manual-input');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (inputMode === 'url') {
        handleFetchUrl();
      } else {
        handleTextRender();
      }
    }
  };

  return (
    <div className="p-4 space-y-4 border-b-2 border-current terminal-border">
      <div className="flex gap-2">
        <button
          className={`terminal-button flex-1 flex items-center justify-center gap-2 ${inputMode === 'url' ? 'active' : ''}`}
          onClick={() => setInputMode('url')}
        >
          <Globe size={16} />
          网址输入
        </button>
        <button
          className={`terminal-button flex-1 flex items-center justify-center gap-2 ${inputMode === 'text' ? 'active' : ''}`}
          onClick={() => setInputMode('text')}
        >
          <FileText size={16} />
          粘贴内容
        </button>
      </div>

      {inputMode === 'url' ? (
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              className="terminal-input flex-1"
              placeholder="输入网址，例如: example.com"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <button
              className="terminal-button flex items-center gap-2"
              onClick={handleFetchUrl}
              disabled={fetchLoading}
            >
              {fetchLoading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : null}
              {fetchLoading ? '抓取中...' : '抓取'}
            </button>
          </div>
          <p className="text-xs terminal-dim">
            ⚠ 某些网站可能因为跨域限制无法抓取，建议直接粘贴 HTML 内容
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          <textarea
            className="terminal-input w-full h-32 resize-none"
            placeholder="粘贴 HTML 或 Markdown 内容..."
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <div className="flex gap-2 justify-end">
            <button
              className="terminal-button"
              onClick={() => setTextInput('')}
            >
              清空
            </button>
            <button
              className="terminal-button"
              onClick={handleTextRender}
            >
              渲染
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
