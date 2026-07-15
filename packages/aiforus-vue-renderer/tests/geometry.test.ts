import { describe, expect, it } from 'vitest';

import type { PPTLineElement, PPTTextElement } from '@aiforus/dsl';
import { getElementBox, getElementPercentageGeometry } from '../src/utils/geometry.js';

const text: PPTTextElement = {
  id: 'target',
  type: 'text',
  left: 100,
  top: 100,
  width: 200,
  height: 100,
  rotate: 15,
  content: '<p>Target</p>',
  defaultFontName: 'Arial',
  defaultColor: '#000000',
};

describe('effect geometry', () => {
  it('uses the actual viewport ratio instead of a hard-coded 16:9 height', () => {
    const geometry = getElementPercentageGeometry(text, 1000, 0.75);
    expect(geometry.y).toBeCloseTo(13.3333, 3);
    expect(geometry.height).toBeCloseTo(13.3333, 3);
    expect(geometry.centerY).toBeCloseTo(20, 3);
  });

  it('derives a focusable box from line endpoints', () => {
    const line: PPTLineElement = {
      id: 'line',
      type: 'line',
      left: 10,
      top: 20,
      width: 2,
      start: [80, 60],
      end: [20, 10],
      style: 'solid',
      color: '#000000',
      points: ['', 'arrow'],
    };
    expect(getElementBox(line)).toMatchObject({
      x: 30,
      y: 30,
      width: 60,
      height: 50,
      centerX: 60,
      centerY: 55,
    });
  });
});
