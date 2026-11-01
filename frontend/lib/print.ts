/**
 * Triggers native browser print dialog for accessible printing and PDF export
 */
export function triggerPrintPlan(): void {
  if (typeof window !== 'undefined') {
    window.print();
  }
}

/**
 * Downloads arbitrary string data as a file in the browser
 */
export function downloadJsonFile(filename: string, data: unknown): void {
  if (typeof window === 'undefined') return;

  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();

  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
