import type { Slide } from '@aiforus/dsl';
import { createApp, h } from 'vue';

import SlideCanvas from './components/SlideCanvas.vue';
import type { SlideSnapshotOptions } from './types.js';

const DEFAULT_TIMEOUT = 5000;

function requireBrowser(): void {
  if (typeof document === 'undefined' || typeof window === 'undefined') {
    throw new Error('Slide snapshots require a browser environment.');
  }
}

function nextFrame(): Promise<void> {
  return new Promise((resolve) => requestAnimationFrame(() => resolve()));
}

async function waitForAssets(root: HTMLElement, timeoutMs: number): Promise<void> {
  const images = Array.from(root.querySelectorAll('img')).map((image) => {
    if (image.complete) return Promise.resolve();
    return new Promise<void>((resolve) => {
      image.addEventListener('load', () => resolve(), { once: true });
      image.addEventListener('error', () => resolve(), { once: true });
    });
  });
  const fonts = document.fonts?.ready ?? Promise.resolve();
  await Promise.race([
    Promise.all([fonts, ...images]),
    new Promise<void>((resolve) => setTimeout(resolve, timeoutMs)),
  ]);
}

function collectStyles(): string {
  const css: string[] = [];
  for (const sheet of Array.from(document.styleSheets)) {
    try {
      for (const rule of Array.from(sheet.cssRules)) css.push(rule.cssText);
    } catch {
      // Cross-origin sheets are intentionally skipped. Package styles and
      // inline element styles remain available to the snapshot.
    }
  }
  return css.join('\n').replaceAll('</style>', '<\\/style>');
}

function cloneForSnapshot(root: HTMLElement): HTMLElement {
  const clone = root.cloneNode(true) as HTMLElement;
  for (const video of Array.from(clone.querySelectorAll('video'))) {
    const poster = video.poster || video.getAttribute('poster');
    if (!poster) continue;
    const image = document.createElement('img');
    image.src = poster;
    image.style.cssText = video.style.cssText;
    image.style.width ||= '100%';
    image.style.height ||= '100%';
    image.style.objectFit ||= 'contain';
    video.replaceWith(image);
  }
  return clone;
}

export function captureSlideAsSvg(
  root: HTMLElement,
  width: number,
  height: number,
  backgroundColor = '#ffffff',
): Blob {
  requireBrowser();
  const clone = cloneForSnapshot(root);
  const markup = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <rect width="100%" height="100%" fill="${backgroundColor}" />
      <foreignObject x="0" y="0" width="100%" height="100%">
        <div xmlns="http://www.w3.org/1999/xhtml" style="width:${width}px;height:${height}px;overflow:hidden">
          <style>${collectStyles()}</style>
          ${clone.outerHTML}
        </div>
      </foreignObject>
    </svg>`;
  return new Blob([markup], { type: 'image/svg+xml;charset=utf-8' });
}

export async function captureSlideElementAsPng(
  root: HTMLElement,
  width: number,
  height: number,
  options: SlideSnapshotOptions = {},
): Promise<Blob | string> {
  requireBrowser();
  const pixelRatio = options.pixelRatio ?? window.devicePixelRatio ?? 1;
  const svg = captureSlideAsSvg(root, width, height, options.backgroundColor);
  const url = URL.createObjectURL(svg);
  try {
    const image = new Image();
    await new Promise<void>((resolve, reject) => {
      image.addEventListener('load', () => resolve(), { once: true });
      image.addEventListener('error', () => reject(new Error('Unable to decode slide snapshot.')), {
        once: true,
      });
      image.src = url;
    });
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(width * pixelRatio);
    canvas.height = Math.round(height * pixelRatio);
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Canvas 2D is unavailable.');
    context.scale(pixelRatio, pixelRatio);
    context.drawImage(image, 0, 0, width, height);
    if (options.format === 'dataUrl') return canvas.toDataURL('image/png');
    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Canvas PNG encoding returned null.'));
      }, 'image/png');
    });
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function slideToPng(
  slide: Slide,
  options: SlideSnapshotOptions = {},
): Promise<Blob | string> {
  requireBrowser();
  const width = slide.viewportSize || 1000;
  const height = Math.round(width * (slide.viewportRatio || 0.5625));
  const container = document.createElement('div');
  container.style.cssText = `position:absolute;left:-99999px;top:0;width:${width}px;height:${height}px;overflow:hidden`;
  document.body.appendChild(container);
  const app = createApp({
    render: () => h(SlideCanvas, { slide, scale: 1, chrome: false }),
  });
  try {
    app.mount(container);
    await nextFrame();
    await nextFrame();
    await waitForAssets(container, options.timeoutMs ?? DEFAULT_TIMEOUT);
    const root = container.querySelector<HTMLElement>('[data-aiforus-slide-viewport]');
    if (!root) throw new Error('SlideCanvas did not mount a snapshot viewport.');
    return await captureSlideElementAsPng(root, width, height, options);
  } finally {
    app.unmount();
    container.remove();
  }
}
