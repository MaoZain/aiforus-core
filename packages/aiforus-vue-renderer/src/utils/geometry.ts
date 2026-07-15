import type { PPTElement } from '@aiforus/dsl';

import type { ElementBox } from '../types.js';

export function getElementBox(element: PPTElement): ElementBox {
  if (element.type === 'line') {
    const minX = Math.min(element.start[0], element.end[0]);
    const minY = Math.min(element.start[1], element.end[1]);
    const maxX = Math.max(element.start[0], element.end[0]);
    const maxY = Math.max(element.start[1], element.end[1]);
    const width = Math.max(maxX - minX, element.width);
    const height = Math.max(maxY - minY, element.width);
    const x = element.left + minX;
    const y = element.top + minY;
    return { x, y, width, height, rotate: 0, centerX: x + width / 2, centerY: y + height / 2 };
  }

  const { left: x, top: y, width, height, rotate } = element;
  return {
    x,
    y,
    width,
    height,
    rotate: rotate || 0,
    centerX: x + width / 2,
    centerY: y + height / 2,
  };
}

export function findElementBox(elements: PPTElement[], elementId: string): ElementBox | null {
  const element = elements.find(({ id }) => id === elementId);
  return element ? getElementBox(element) : null;
}

export function getElementPercentageGeometry(
  element: PPTElement,
  viewportSize = 1000,
  viewportRatio = 0.5625,
): ElementBox {
  const box = getElementBox(element);
  const height = viewportSize * viewportRatio;
  return {
    x: (box.x / viewportSize) * 100,
    y: (box.y / height) * 100,
    width: (box.width / viewportSize) * 100,
    height: (box.height / height) * 100,
    rotate: box.rotate,
    centerX: (box.centerX / viewportSize) * 100,
    centerY: (box.centerY / height) * 100,
  };
}

export function findNearestCorner(box: ElementBox): { x: number; y: number } {
  const corners = [
    { x: 0, y: 0 },
    { x: 100, y: 0 },
    { x: 0, y: 100 },
    { x: 100, y: 100 },
  ];
  return corners.reduce((nearest, candidate) => {
    const candidateDistance = Math.hypot(candidate.x - box.centerX, candidate.y - box.centerY);
    const nearestDistance = Math.hypot(nearest.x - box.centerX, nearest.y - box.centerY);
    return candidateDistance < nearestDistance ? candidate : nearest;
  });
}
