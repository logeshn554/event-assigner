import { describe, it, expect, vi, beforeEach } from 'vitest';
import { triggerPrintPlan, downloadJsonFile } from '@/frontend/lib/print';

describe('Print and Export Utilities', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('triggers window.print safely', () => {
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {});
    triggerPrintPlan();
    expect(printSpy).toHaveBeenCalled();
  });

  it('downloads JSON file by creating and clicking an anchor', () => {
    const appendChildSpy = vi.spyOn(document.body, 'appendChild');
    const removeChildSpy = vi.spyOn(document.body, 'removeChild');

    downloadJsonFile('test.json', { event: 'Wedding' });

    expect(appendChildSpy).toHaveBeenCalled();
    expect(removeChildSpy).toHaveBeenCalled();
  });
});
