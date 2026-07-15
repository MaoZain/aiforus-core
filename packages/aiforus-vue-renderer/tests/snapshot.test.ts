import { describe, expect, it } from 'vitest';

import { captureSlideAsSvg } from '../src/snapshot.js';

describe('snapshot boundary', () => {
  it('serializes an existing slide viewport without a runtime snapshot dependency', () => {
    const root = document.createElement('div');
    root.dataset.aiforusSlideViewport = '';
    root.innerHTML = '<div style="color:#123456">snapshot</div>';
    const snapshot = captureSlideAsSvg(root, 1000, 562.5);
    expect(snapshot.type).toBe('image/svg+xml;charset=utf-8');
    expect(snapshot.size).toBeGreaterThan(100);
  });
});
