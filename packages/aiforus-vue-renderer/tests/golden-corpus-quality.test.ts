import { createHash } from 'node:crypto';

import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';

import { validateScene, type SlideContent } from '@aiforus/dsl';
import { goldenCorpus } from '../fixtures/golden-corpus.js';
import SlideCanvas from '../src/components/SlideCanvas.vue';
import {
  SlideActionPlayer,
  createSpeechAdapter,
  validateSlideActionReferences,
} from '../src/player/SlideActionPlayer.js';
import { captureSlideAsSvg } from '../src/snapshot.js';
import { getElementBox } from '../src/utils/geometry.js';

const MIN_TEXT_SCALE = 0.65;

function slideFor(caseIndex: number) {
  const content = goldenCorpus[caseIndex]!.scene.content as SlideContent;
  return content.canvas;
}

function estimatedTextFits(content: string, width: number, height: number): boolean {
  const fontSizes = [...content.matchAll(/font-size\s*:\s*([0-9.]+)px/gi)].map((match) =>
    Number(match[1]),
  );
  const fontSize = Math.max(16, ...fontSizes);
  const blocks = content
    .replace(/<\s*br\s*\/?>/gi, '\n')
    .replace(/<\/\s*(p|li|div|h[1-6])\s*>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .split('\n')
    .map((block) => block.trim())
    .filter(Boolean);
  const effectiveWidth = Math.max(1, (width - 20) / MIN_TEXT_SCALE);
  const lineCount = blocks.reduce((total, block) => {
    const weightedCharacters = [...block].reduce(
      (sum, character) => sum + ((character.codePointAt(0) ?? 0) > 0xff ? 1 : 0.55),
      0,
    );
    return total + Math.max(1, Math.ceil((weightedCharacters * fontSize) / effectiveWidth));
  }, 0);
  return lineCount * fontSize * 1.35 * MIN_TEXT_SCALE <= height;
}

function readBlob(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => resolve(String(reader.result || '')), { once: true });
    reader.addEventListener(
      'error',
      () => reject(reader.error || new Error('Unable to read visual snapshot.')),
      { once: true },
    );
    reader.readAsText(blob);
  });
}

function normalizedVisualMarkup(markup: string): string {
  return markup
    .replaceAll(/aiforus-spotlight-mask-\d+/g, 'aiforus-spotlight-mask-STABLE')
    .replaceAll(/data-v-[a-f0-9]+/g, 'data-v-STABLE')
    .replaceAll(/\s+/g, ' ')
    .trim();
}

describe('Phase 7 golden corpus', () => {
  it('covers every required visual and content risk', () => {
    const coverage = new Set(goldenCorpus.flatMap((item) => item.covers));
    expect(coverage).toEqual(
      new Set([
        'Chinese',
        'English',
        'short title',
        'long title',
        'paragraphs',
        'bullets',
        'mathematics',
        'formula',
        'physics diagram',
        'chemistry notation',
        'history timeline',
        'images with different aspect ratios',
        'table',
        'chart',
        'grouped elements',
        'rotated element',
        'spotlight',
        'speech',
        'laser',
        'video',
        'missing font',
        'multiple paragraphs',
      ]),
    );
  });

  it.each(goldenCorpus)(
    '$id is schema-valid with unique ids and valid action targets',
    ({ scene }) => {
      expect(validateScene(scene)).toEqual({ valid: true });
      const slide = (scene.content as SlideContent).canvas;
      const ids = slide.elements.map(({ id }) => id);
      expect(new Set(ids).size).toBe(ids.length);
      expect(validateSlideActionReferences(slide, scene.actions ?? [])).toEqual([]);
    },
  );

  it.each(goldenCorpus)(
    '$id has no estimated text overflow or out-of-canvas element',
    ({ scene }) => {
      const slide = (scene.content as SlideContent).canvas;
      const height = slide.viewportSize * slide.viewportRatio;
      for (const element of slide.elements) {
        const box = getElementBox(element);
        expect(box.x, element.id).toBeGreaterThanOrEqual(0);
        expect(box.y, element.id).toBeGreaterThanOrEqual(0);
        expect(box.x + box.width, element.id).toBeLessThanOrEqual(slide.viewportSize);
        expect(box.y + box.height, element.id).toBeLessThanOrEqual(height);
        if (element.type === 'text') {
          expect(
            estimatedTextFits(element.content, element.width, element.height),
            element.id,
          ).toBe(true);
        }
      }
    },
  );

  it.each(goldenCorpus)(
    '$id keeps every speech immediately aligned to its declared focus',
    ({ scene }) => {
      const actions = scene.actions ?? [];
      for (let index = 0; index < actions.length; index += 1) {
        const action = actions[index];
        if (action?.type !== 'speech') continue;
        const focus = actions[index - 1];
        expect(['spotlight', 'laser'], action.id).toContain(focus?.type);
        expect(focus && 'elementId' in focus ? focus.elementId : '', action.id).not.toBe('');
      }
    },
  );

  it.each(goldenCorpus)('$id renders focus overlays on the exact target geometry', ({ scene }) => {
    const slide = (scene.content as SlideContent).canvas;
    const targets = (scene.actions ?? []).filter(
      (action) => action.type === 'spotlight' || action.type === 'laser',
    );
    for (const target of targets) {
      expect('elementId' in target ? target.elementId : '').not.toBe('');
      if (!('elementId' in target)) continue;
      const box = getElementBox(slide.elements.find(({ id }) => id === target.elementId)!);
      const wrapper = mount(SlideCanvas, {
        props: {
          slide,
          scale: 1,
          chrome: false,
          effects: {
            spotlight: { elementId: target.elementId },
            laser: { elementId: target.elementId },
          },
        },
      });
      const spotlightHole = wrapper.find('mask rect:nth-child(2)');
      expect(Number(spotlightHole.attributes('x'))).toBe(box.x - 6);
      expect(Number(spotlightHole.attributes('y'))).toBe(box.y - 6);
      expect(Number(spotlightHole.attributes('width'))).toBe(box.width + 12);
      expect(Number(spotlightHole.attributes('height'))).toBe(box.height + 12);
      const laserStyle = wrapper.find('.aiforus-laser').attributes('style');
      expect(laserStyle).toContain(`left: ${box.centerX}px`);
      expect(laserStyle).toContain(`top: ${box.centerY}px`);
      wrapper.unmount();
    }
  });

  it('keeps missing-font text visible with browser fallback behavior', () => {
    const slide = slideFor(0);
    const wrapper = mount(SlideCanvas, { props: { slide, scale: 1, chrome: false } });
    const missingFontText = wrapper.find('[data-element-id="language-english"] .aiforus-rich-text');
    expect(missingFontText.exists()).toBe(true);
    expect((missingFontText.element as HTMLElement).style.fontFamily).toContain(
      'Definitely Missing Classroom Font',
    );
    expect(missingFontText.text()).toContain('English summary');
  });

  it('plays all focus, speech, laser and video sequences without target drift', async () => {
    vi.useFakeTimers();
    for (const item of goldenCorpus) {
      const slide = item.scene.content as SlideContent;
      const started: string[] = [];
      const speech = vi.fn(async () => undefined);
      const video = vi.fn(async () => undefined);
      const player = new SlideActionPlayer({
        slide: slide.canvas,
        speechAdapter: createSpeechAdapter(speech),
        mediaAdapter: { playVideo: video },
        onActionStart: (action) => started.push(action.id),
      });
      await player.play(item.scene.actions ?? []);
      expect(started).toEqual((item.scene.actions ?? []).map(({ id }) => id));
      await player.stop();
    }
    vi.useRealTimers();
  });

  it('keeps deterministic serialized visual screenshots at small and large scales', async () => {
    const hashes: Record<string, string> = {};
    for (let index = 0; index < goldenCorpus.length; index += 1) {
      const item = goldenCorpus[index]!;
      const slide = slideFor(index);
      const focus = (item.scene.actions ?? []).find((action) => action.type === 'spotlight');
      for (const [size, scale] of [
        ['small', 0.32],
        ['large', 1.28],
      ] as const) {
        const wrapper = mount(SlideCanvas, {
          props: {
            slide,
            scale,
            chrome: false,
            effects:
              focus && 'elementId' in focus ? { spotlight: { elementId: focus.elementId } } : {},
          },
        });
        const root = wrapper.find('[data-aiforus-slide-viewport]').element as HTMLElement;
        const svg = await readBlob(captureSlideAsSvg(root, 1000, 562.5));
        const normalized = normalizedVisualMarkup(svg);
        hashes[`${item.id}:${size}`] = createHash('sha256').update(normalized).digest('hex');
      }
    }
    expect(hashes).toMatchSnapshot();
  });
});
