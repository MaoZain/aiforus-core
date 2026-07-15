import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import { describe, expect, expectTypeOf, it } from 'vitest';

import type { QuizContent, Slide } from '@aiforus/dsl';
import SlideCanvas from '../src/components/SlideCanvas.vue';
import type { SlideCanvasProps } from '../src/types.js';
import { baselineSlide } from './fixtures.js';

describe('SlideCanvas', () => {
  it('renders every baseline element discriminant, including audio', () => {
    const wrapper = mount(SlideCanvas, {
      props: { slide: baselineSlide, scale: 1 },
    });
    expect(wrapper.findAll('.aiforus-element')).toHaveLength(10);
    for (const type of [
      'text',
      'image',
      'shape',
      'line',
      'chart',
      'table',
      'latex',
      'video',
      'audio',
      'code',
    ]) {
      expect(wrapper.find(`.aiforus-element-${type}`).exists()).toBe(true);
    }
  });

  it('draws spotlight and laser from the same design-coordinate element box', () => {
    const wrapper = mount(SlideCanvas, {
      props: {
        slide: baselineSlide,
        scale: 1,
        effects: {
          spotlight: { elementId: 'el-text' },
          laser: { elementId: 'el-text' },
        },
      },
    });
    const hole = wrapper.find('mask rect:nth-child(2)');
    expect(hole.attributes('x')).toBe('14');
    expect(hole.attributes('y')).toBe('14');
    expect(wrapper.find('.aiforus-laser').attributes('style')).toContain('left: 170px');
    expect(wrapper.find('.aiforus-laser').attributes('style')).toContain('top: 50px');
  });

  it('reports a missing teacher-focus target instead of falling back to an index', async () => {
    const wrapper = mount(SlideCanvas, {
      props: {
        slide: baselineSlide,
        scale: 1,
        effects: { spotlight: { elementId: 'missing-id' } },
      },
    });
    await nextTick();
    await nextTick();
    const events = wrapper.emitted('layoutDiagnostics') ?? [];
    expect(events.flat()).toEqual(
      expect.arrayContaining([
        expect.arrayContaining([
          expect.objectContaining({
            kind: 'missing-effect-target',
            elementId: 'missing-id',
          }),
        ]),
      ]),
    );
  });

  it('keeps the public input typed as Slide, not Quiz or Interactive content', () => {
    expectTypeOf<SlideCanvasProps['slide']>().toEqualTypeOf<Slide>();
    expectTypeOf<QuizContent>().not.toMatchTypeOf<Slide>();
  });
});
