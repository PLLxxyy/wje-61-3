import * as cheerio from 'cheerio';
import type { ContentNode } from './types';

export function parseHtml(html: string): ContentNode[] {
  const $ = cheerio.load(html);
  const nodes: ContentNode[] = [];

  const title = $('title').text().trim();
  if (title) {
    nodes.push({
      type: 'heading',
      level: 1,
      text: title,
    });
  }

  const selectors = [
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'p', 'a', 'ul', 'ol', 'li', 'img',
    'blockquote', 'pre', 'code', 'hr',
    'article', 'section', 'main',
  ];

  const contentSelectors = 'h1, h2, h3, h4, h5, h6, p, a, ul, ol, li, img, blockquote, pre, code, hr';

  $(contentSelectors).each((_, element) => {
    const tagName = element.tagName.toLowerCase();
    const node = parseElement($, element, tagName);
    if (node) {
      nodes.push(node);
    }
  });

  return nodes.filter(n => n && (n.text || n.children?.length));
}

function parseElement($: cheerio.CheerioAPI, element: any, tagName: string): ContentNode | null {
  const text = $(element).clone().find('script, style, nav, footer, header').remove().end().text().trim();

  switch (tagName) {
    case 'h1':
    case 'h2':
    case 'h3':
    case 'h4':
    case 'h5':
    case 'h6':
      return {
        type: 'heading',
        level: parseInt(tagName.slice(1)),
        text: text,
      };

    case 'p':
      return {
        type: 'paragraph',
        text: text,
      };

    case 'a': {
      const href = $(element).attr('href') || '';
      const linkText = text || href;
      return {
        type: 'link',
        text: linkText,
        href: href,
      };
    }

    case 'ul':
    case 'ol': {
      const children: ContentNode[] = [];
      $(element).find('> li').each((_, li) => {
        const liText = $(li).clone().find('script, style').remove().end().text().trim();
        if (liText) {
          children.push({
            type: 'listItem',
            text: liText,
          });
        }
      });
      if (children.length > 0) {
        return {
          type: 'list',
          text: '',
          ordered: tagName === 'ol',
          children,
        };
      }
      return null;
    }

    case 'img': {
      const src = $(element).attr('src') || '';
      const alt = $(element).attr('alt') || '图片';
      return {
        type: 'image',
        text: alt,
        href: src,
        alt: alt,
      };
    }

    case 'blockquote':
      return {
        type: 'block',
        text: text,
      };

    case 'pre':
    case 'code':
      return {
        type: 'code',
        text: $(element).text(),
      };

    case 'hr':
      return {
        type: 'separator',
        text: '',
      };

    default:
      if (text) {
        return {
          type: 'paragraph',
          text: text,
        };
      }
      return null;
  }
}

export function parseMarkdown(md: string): ContentNode[] {
  const nodes: ContentNode[] = [];
  const lines = md.split('\n');
  let i = 0;

  while (i < lines.length) {
    const line = lines[i].trimEnd();
    const trimmed = line.trim();

    if (!trimmed) {
      i++;
      continue;
    }

    if (/^#{1,6}\s+/.test(trimmed)) {
      const match = trimmed.match(/^(#{1,6})\s+(.*)$/);
      if (match) {
        nodes.push({
          type: 'heading',
          level: match[1].length,
          text: match[2].trim(),
        });
      }
      i++;
      continue;
    }

    if (/^---+$/.test(trimmed) || /^\*\*\*+$/.test(trimmed)) {
      nodes.push({
        type: 'separator',
        text: '',
      });
      i++;
      continue;
    }

    if (/^[-*+]\s+/.test(trimmed) || /^\d+\.\s+/.test(trimmed)) {
      const isOrdered = /^\d+\.\s+/.test(trimmed);
      const children: ContentNode[] = [];

      while (i < lines.length) {
        const currentLine = lines[i].trimEnd();
        const currentTrimmed = currentLine.trim();
        const isListItem = /^[-*+]\s+/.test(currentTrimmed) || /^\d+\.\s+/.test(currentTrimmed);

        if (isListItem) {
          const itemText = currentTrimmed.replace(/^[-*+]\s+/, '').replace(/^\d+\.\s+/, '');
          children.push({
            type: 'listItem',
            text: parseInlineMarkdown(itemText),
          });
          i++;
        } else if (!currentTrimmed) {
          i++;
          break;
        } else {
          break;
        }
      }

      if (children.length > 0) {
        nodes.push({
          type: 'list',
          text: '',
          ordered: isOrdered,
          children,
        });
      }
      continue;
    }

    if (/^>\s?/.test(trimmed)) {
      let blockText = '';
      while (i < lines.length && /^>\s?/.test(lines[i].trimEnd())) {
        blockText += lines[i].trimEnd().replace(/^>\s?/, '') + ' ';
        i++;
      }
      nodes.push({
        type: 'block',
        text: blockText.trim(),
      });
      continue;
    }

    if (/^```/.test(trimmed)) {
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !/^```/.test(lines[i].trimEnd())) {
        codeLines.push(lines[i]);
        i++;
      }
      i++;
      nodes.push({
        type: 'code',
        text: codeLines.join('\n'),
      });
      continue;
    }

    let paragraphLines: string[] = [];
    while (i < lines.length && lines[i].trim() && !/^#{1,6}\s+/.test(lines[i]) && !/^[-*+]\s+/.test(lines[i]) && !/^\d+\.\s+/.test(lines[i]) && !/^>\s?/.test(lines[i]) && !/^```/.test(lines[i]) && !/^---+$/.test(lines[i]) && !/^\*\*\*+$/.test(lines[i])) {
      paragraphLines.push(lines[i].trimEnd());
      i++;
    }

    if (paragraphLines.length > 0) {
      nodes.push({
        type: 'paragraph',
        text: parseInlineMarkdown(paragraphLines.join(' ')),
      });
    }
  }

  return nodes;
}

function parseInlineMarkdown(text: string): string {
  return text
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1 ($2)')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '[图片: $1]');
}

export function detectContentType(content: string): 'html' | 'markdown' | 'text' {
  const trimmed = content.trim();
  if (/^\s*<(!DOCTYPE|html|head|body|div|p|h[1-6]|a|span)/i.test(trimmed)) {
    return 'html';
  }
  if (/^#{1,6}\s+|\[.+\]\(.+\)|^[-*+]\s+|^```/m.test(trimmed)) {
    return 'markdown';
  }
  return 'text';
}

export function parseContent(content: string): ContentNode[] {
  const type = detectContentType(content);
  if (type === 'html') {
    return parseHtml(content);
  } else if (type === 'markdown') {
    return parseMarkdown(content);
  } else {
    return [{
      type: 'paragraph',
      text: content,
    }];
  }
}
