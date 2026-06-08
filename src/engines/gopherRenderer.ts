import type { ContentNode, RenderResult } from './types';
import { LINE_WIDTH } from './types';
import { wrapText, makeSeparator } from '../utils/ascii';

export function renderGopher(nodes: ContentNode[]): RenderResult {
  const lines: string[] = [];
  const linkMap = new Map<number, string>();

  lines.push('');
  lines.push('  ' + '═'.repeat(LINE_WIDTH - 4));
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
      const linkLines = renderLink(node);
      lines.push(...linkLines);
      lines.push('');
    } else if (node.type === 'list') {
      const listLines = renderList(node);
      lines.push(...listLines);
      lines.push('');
    } else if (node.type === 'image') {
      const imgLines = renderImage(node);
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
      lines.push('  ' + '─'.repeat(LINE_WIDTH - 4));
      lines.push('');
    }
  }

  lines.push('');
  lines.push('  ' + '═'.repeat(LINE_WIDTH - 4));
  lines.push('');

  return {
    text: lines.join('\n'),
    lines,
    linkMap,
  };
}

function renderHeading(node: ContentNode): string[] {
  const result: string[] = [];
  const level = node.level || 1;
  const upperText = node.text.toUpperCase();

  if (level <= 2) {
    result.push(`  📁 ${upperText}`);
    result.push(`  ${'='.repeat(Math.min(upperText.length + 2, LINE_WIDTH - 4))}`);
  } else {
    result.push(`  📂 ${node.text}`);
  }

  return result;
}

function renderParagraph(node: ContentNode): string[] {
  const wrapped = wrapText(node.text, LINE_WIDTH - 4, 4);
  return wrapped.map(line => `  📄 ${line.trimStart()}`);
}

function renderLink(node: ContentNode): string[] {
  const result: string[] = [];
  const text = node.text || node.href || '链接';
  const href = node.href || '';

  if (href) {
    result.push(`  🔗 ${text}`);
    const wrappedHref = wrapText(`(${href})`, LINE_WIDTH - 8, 6);
    for (const line of wrappedHref) {
      result.push(`     ${line.trimStart()}`);
    }
  } else {
    result.push(`  🔗 ${text}`);
  }

  return result;
}

function renderList(node: ContentNode): string[] {
  const result: string[] = [];
  const children = node.children || [];
  const ordered = node.ordered || false;

  children.forEach((child, idx) => {
    const prefix = ordered ? `${idx + 1}. ` : '• ';
    const wrapped = wrapText(child.text, LINE_WIDTH - 8, 8);
    if (wrapped.length > 0) {
      const firstLine = wrapped[0].trimStart();
      result.push(`  📋 ${prefix}${firstLine}`);
      for (let i = 1; i < wrapped.length; i++) {
        result.push(`     ${wrapped[i].trimStart()}`);
      }
    }
  });

  return result;
}

function renderImage(node: ContentNode): string[] {
  const result: string[] = [];
  const alt = node.alt || '图片';
  const src = node.href || '';

  result.push(`  🖼️ ${alt}`);
  if (src) {
    const wrappedSrc = wrapText(`(${src})`, LINE_WIDTH - 8, 6);
    for (const line of wrappedSrc) {
      result.push(`     ${line.trimStart()}`);
    }
  }

  return result;
}

function renderBlock(node: ContentNode): string[] {
  const result: string[] = [];
  result.push(`  💬 引用:`);

  const wrapped = wrapText(node.text, LINE_WIDTH - 8, 6);
  for (const line of wrapped) {
    result.push(`     ${line.trimStart()}`);
  }

  return result;
}

function renderCode(node: ContentNode): string[] {
  const result: string[] = [];
  result.push(`  💻 代码:`);

  const codeLines = node.text.split('\n');
  for (const line of codeLines) {
    const displayLine = line.length > LINE_WIDTH - 8 ? line.slice(0, LINE_WIDTH - 9) + '…' : line;
    result.push(`     ${displayLine}`);
  }

  return result;
}
