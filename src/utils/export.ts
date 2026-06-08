export function exportToTxt(content: string, filename: string = 'retro-render.txt'): void {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    } catch (fallbackErr) {
      document.body.removeChild(textArea);
      console.error('Failed to copy:', fallbackErr);
      return false;
    }
  }
}

export function generateFilename(source: string, style: string): string {
  const timestamp = new Date().toISOString().slice(0, 10);
  const cleanSource = source.replace(/[^a-zA-Z0-9]/g, '-').slice(0, 20) || 'content';
  return `${cleanSource}-${style}-${timestamp}.txt`;
}
