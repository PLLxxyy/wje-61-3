import { useState, useCallback } from 'react';
import { createErrorBox } from '../utils/ascii';

export interface FetchResult {
  content: string;
  error: string | null;
  loading: boolean;
  source: string;
}

export function useContentFetch() {
  const [result, setResult] = useState<FetchResult>({
    content: '',
    error: null,
    loading: false,
    source: '',
  });

  const fetchUrl = useCallback(async (url: string) => {
    if (!url.trim()) {
      setResult({
        content: '',
        error: '请输入有效的 URL 地址',
        loading: false,
        source: '',
      });
      return;
    }

    setResult(prev => ({ ...prev, loading: true, error: null }));

    try {
      let finalUrl = url.trim();
      if (!/^https?:\/\//i.test(finalUrl)) {
        finalUrl = 'https://' + finalUrl;
      }

      const response = await fetch(finalUrl, {
        mode: 'cors',
        credentials: 'omit',
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const html = await response.text();
      
      setResult({
        content: html,
        error: null,
        loading: false,
        source: finalUrl,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '未知错误';
      
      const isCorsError = errorMessage.includes('CORS') || 
                         errorMessage.includes('cors') ||
                         errorMessage.includes('Failed to fetch') ||
                         errorMessage.includes('NetworkError');

      let userFriendlyError: string;
      
      if (isCorsError) {
        userFriendlyError = createErrorBox('⚠️ 无法抓取该网页', [
          '可能的原因：',
          '• 目标网站禁止跨域访问 (CORS policy)',
          '• 网络连接问题',
          '• URL 地址无效',
          '',
          '解决方案：',
          '1. 直接复制网页的 HTML 源码粘贴到下方文本框',
          '2. 使用浏览器保存网页为 .html 文件后上传',
          '3. 尝试使用支持 CORS 的代理服务',
        ]);
      } else {
        userFriendlyError = createErrorBox('⚠️ 抓取失败', [
          `错误信息: ${errorMessage}`,
          '',
          '请检查：',
          '• URL 地址是否正确',
          '• 网络连接是否正常',
          '• 或者直接粘贴 HTML 内容到文本框',
        ]);
      }

      setResult({
        content: '',
        error: userFriendlyError,
        loading: false,
        source: url,
      });
    }
  }, []);

  const setContent = useCallback((content: string, source: string = 'manual') => {
    setResult({
      content,
      error: null,
      loading: false,
      source,
    });
  }, []);

  const clear = useCallback(() => {
    setResult({
      content: '',
      error: null,
      loading: false,
      source: '',
    });
  }, []);

  return {
    ...result,
    fetchUrl,
    setContent,
    clear,
  };
}
