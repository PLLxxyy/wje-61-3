import { LINE_WIDTH } from '../engines/types';

export function makeAsciiBox(title: string, width: number = LINE_WIDTH): string[] {
  const lines: string[] = [];
  const innerWidth = width - 2;
  const paddedTitle = ` ${title} `.padEnd(innerWidth, '═');

  lines.push(`╔${'═'.repeat(innerWidth)}╗`);
  lines.push(`║${paddedTitle}║`);
  lines.push(`╠${'═'.repeat(innerWidth)}╣`);
  return lines;
}

export function makeAsciiBoxEnd(width: number = LINE_WIDTH): string {
  const innerWidth = width - 2;
  return `╚${'═'.repeat(innerWidth)}╝`;
}

export function makeSeparator(style: 'double' | 'single' = 'single', width: number = LINE_WIDTH): string {
  const char = style === 'double' ? '═' : '─';
  return char.repeat(width);
}

export function wrapText(text: string, width: number = LINE_WIDTH, indent: number = 0): string[] {
  const words = text.replace(/\s+/g, ' ').trim().split(' ');
  const lines: string[] = [];
  let currentLine = '';
  const indentStr = ' '.repeat(indent);

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    if (testLine.length <= width - indent) {
      currentLine = testLine;
    } else {
      if (currentLine) {
        lines.push(indentStr + currentLine);
      }
      if (word.length > width - indent) {
        let remaining = word;
        while (remaining.length > 0) {
          const chunk = remaining.slice(0, width - indent);
          lines.push(indentStr + chunk);
          remaining = remaining.slice(width - indent);
        }
        currentLine = '';
      } else {
        currentLine = word;
      }
    }
  }

  if (currentLine) {
    lines.push(indentStr + currentLine);
  }

  return lines.length > 0 ? lines : [indentStr];
}

export function centerText(text: string, width: number = LINE_WIDTH): string {
  const padding = Math.max(0, Math.floor((width - text.length) / 2));
  return ' '.repeat(padding) + text;
}

export function padLine(text: string, width: number = LINE_WIDTH, char: string = ' '): string {
  if (text.length >= width) return text.slice(0, width);
  return text + char.repeat(width - text.length);
}

export function padLineWithBorders(text: string, width: number = LINE_WIDTH): string {
  const contentWidth = width - 4;
  let padded: string;
  if (text.length > contentWidth) {
    padded = text.slice(0, contentWidth - 1) + '…';
  } else {
    padded = text.padEnd(contentWidth, ' ');
  }
  return `║ ${padded} ║`;
}

export function generateFigletTitle(text: string): string[] {
  const lines: string[] = [];
  const upper = text.toUpperCase();
  
  lines.push(centerText(`╔══════════════════════════════════════════════════════════════════════════╗`));
  lines.push(centerText(`║  ${upper.padEnd(70, ' ')}║`));
  lines.push(centerText(`╚══════════════════════════════════════════════════════════════════════════╝`));
  lines.push('');
  
  return lines;
}

export function createErrorBox(title: string, messages: string[], width: number = LINE_WIDTH): string {
  const lines: string[] = [];
  lines.push(...makeAsciiBox(title, width));
  
  for (const msg of messages) {
    const wrapped = wrapText(msg, width - 4, 0);
    for (const line of wrapped) {
      lines.push(padLineWithBorders(line, width));
    }
  }
  
  lines.push(makeAsciiBoxEnd(width));
  return lines.join('\n');
}
