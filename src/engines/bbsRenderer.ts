import type { ContentNode, RenderResult } from './types';
import { LINE_WIDTH } from './types';
import {
  makeAsciiBox,
  makeAsciiBoxEnd,
  makeSeparator,
  wrapText,
  padLineWithBorders,
} from '../utils/ascii';

export function renderBBS(nodes: ContentNode[]): RenderResult {
  const lines: string[] = [];
  const linkMap = new Map<number, string>();
  let linkCounter = 1;

  lines.push(makeSeparator('double'));
  lines.push('');

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];

    if (node.type === 'heading') {
      if (i > 0) {
        lines.push('');
      }
      const headingLines = renderHeading(node);
      lines.push(...headingLines);
      lines.push('');
    } else if (node.type === 'paragraph') {
      const paraLines = renderParagraph(node);
      lines.push(...paraLines);
      lines.push('');
    } else if (node.type === 'link') {
      const linkLines = renderLink(node, linkCounter, linkMap);
      linkCounter++;
      lines.push(...linkLines);
      lines.push('');
    } else if (node.type === 'list') {
      const listLines = renderList(node, linkCounter, linkMap);
      lines.push(...listLines);
      lines.push('');
    } else if (node.type === 'image') {
      const imgLines = renderImage(node, linkCounter, linkMap);
      linkCounter++;
      lines.push(...imgLines);
      lines.push('');
    } else if (node.type === 'block') {
      const blockLines = renderBlock(node);
      lines.push(...blockLines);
      lines.push('');
    } else if (node.type === 'code') {
      const codeLines = renderCode(node);
      lines.push(...codeLines);
      lines.push('');
    } else if (node.type === 'separator') {
      lines.push(makeSeparator('single'));
      lines.push('');
    }
  }

  if (linkMap.size > 0) {
    lines.push(makeSeparator('double'));
    lines.push('');
    lines.push('  链接索引:');
    lines.push('');
    linkMap.forEach((url, num) => {
      const wrapped = wrapText(`[${num}] ${url}`, LINE_WIDTH, 4);
      lines.push(...wrapped);
    });
    lines.push('');
  }

  lines.push(makeSeparator('double'));

  return {
    text: lines.join('\n'),
    lines,
    linkMap,
  };
}

function renderHeading(node: ContentNode): string[] {
  const level = node.level || 1;
  const result: string[] = [];

  if (level <= 2) {
    result.push(...makeAsciiBox(node.text));
    result.push(makeAsciiBoxEnd());
  } else {
    const wrapped = wrapText(`◆ ${node.text}`, LINE_WIDTH, 0);
    result.push(...wrapped);
    result.push(makeSeparator('single'));
  }

  return result;
}

function renderParagraph(node: ContentNode): string[] {
  return wrapText(node.text, LINE_WIDTH, 2);
}

function renderLink(node: ContentNode, linkNum: number, linkMap: Map<number, string>): string[] {
  const displayText = node.text || node.href || '链接';
  const href = node.href || '';
  
  if (href) {
    linkMap.set(linkNum, href);
  }

  const wrapped = wrapText(`[${linkNum}] ${displayText}`, LINE_WIDTH, 2);
  return wrapped;
}

function renderList(node: ContentNode, startNum: number, linkMap: Map<number, string>): string[] {
  const result: string[] = [];
  const children = node.children || [];
  const ordered = node.ordered || false;

  children.forEach((child, idx) => {
    const prefix = ordered ? `${idx + 1}. ` : '• ';
    const wrapped = wrapText(child.text, LINE_WIDTH - 4, 4);
    if (wrapped.length > 0) {
      const firstLine = wrapped[0].trimStart();
      result.push(`  ${prefix}${firstLine}`);
      for (let i = 1; i < wrapped.length; i++) {
        result.push(wrapped[i]);
      }
    }
  });

  return result;
}

function renderImage(node: ContentNode, linkNum: number, linkMap: Map<number, string>): string[] {
  const alt = node.alt || '图片';
  const src = node.href || '';
  
  if (src) {
    linkMap.set(linkNum, src);
  }

  const result: string[] = [];
  result.push(`  [${linkNum}] 🖼️  ${alt}`);
  if (src) {
    result.push(`      [图片地址]`);
  }
  return result;
}

function renderBlock(node: ContentNode): string[] {
  const result: string[] = [];
  result.push(...makeAsciiBox('引用', 40));
  
  const wrapped = wrapText(node.text, 36, 0);
  for (const line of wrapped) {
    result.push(padLineWithBorders(line, 40));
  }
  
  result.push(makeAsciiBoxEnd(40));
  return result;
}

function renderCode(node: ContentNode): string[] {
  const result: string[] = [];
  result.push(...makeAsciiBox('代码', LINE_WIDTH));
  
  const codeLines = node.text.split('\n');
  for (const line of codeLines) {
    const displayLine = line.length > LINE_WIDTH - 4 ? line.slice(0, LINE_WIDTH - 5) + '…' : line;
    result.push(padLineWithBorders(displayLine, LINE_WIDTH));
  }
  
  result.push(makeAsciiBoxEnd(LINE_WIDTH));
  return result;
}
