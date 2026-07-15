import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import type { Slide } from '@aiforus/dsl';
import SlideCanvas from '../src/components/SlideCanvas.vue';
import slideFixture from '../fixtures/golden-slide.json';

describe('golden slide render contract', () => {
  it('keeps the design geometry and effect markup stable for all element types', () => {
    const wrapper = mount(SlideCanvas, {
      props: {
        slide: slideFixture as Slide,
        scale: 1,
        chrome: false,
        effects: {
          spotlight: { elementId: 'golden-chart' },
          laser: { elementId: 'golden-chart' },
        },
      },
    });

    const rendered = {
      viewportStyle: wrapper.find('[data-aiforus-slide-viewport]').attributes('style'),
      elements: wrapper.findAll('.aiforus-element').map((element) => ({
        class: element.attributes('class'),
        style: element.attributes('style'),
      })),
      spotlightHole: wrapper.find('mask rect:nth-child(2)').attributes(),
      laserStyle: wrapper.find('.aiforus-laser').attributes('style'),
    };

    expect(rendered).toMatchSnapshot();
  });
});
