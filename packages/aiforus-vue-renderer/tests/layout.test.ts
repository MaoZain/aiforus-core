import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import { afterEach, describe, expect, it, vi } from 'vitest';

import AutoFitHtml from '../src/components/AutoFitHtml.vue';
import { inspectSlideLayout } from '../src/utils/layout.js';

afterEach(() => vi.unstubAllGlobals());

describe('layout diagnostics', () => {
  it('reports exact horizontal and vertical text overflow', () => {
    const root = document.createElement('div');
    const box = document.createElement('div');
    const content = document.createElement('div');
    box.dataset.aiforusLayoutBox = '';
    box.dataset.elementId = 'title';
    box.dataset.elementType = 'text';
    content.dataset.aiforusLayoutContent = '';
    box.appendChild(content);
    root.appendChild(box);
    Object.defineProperties(box, {
      clientWidth: { value: 200 },
      clientHeight: { value: 50 },
    });
    Object.defineProperties(content, {
      scrollWidth: { value: 236 },
      scrollHeight: { value: 68 },
    });

    expect(inspectSlideLayout(root)).toEqual([
      expect.objectContaining({
        kind: 'text-overflow',
        elementId: 'title',
        overflowX: 36,
        overflowY: 18,
      }),
    ]);
  });

  it('measures the rendered dimensions after auto-fit scaling', () => {
    const root = document.createElement('div');
    const box = document.createElement('div');
    const content = document.createElement('div');
    box.dataset.aiforusLayoutBox = '';
    box.dataset.elementId = 'fitted-title';
    box.dataset.elementType = 'text';
    box.dataset.autoFitScale = '0.5';
    content.dataset.aiforusLayoutContent = '';
    box.appendChild(content);
    root.appendChild(box);
    Object.defineProperties(box, {
      clientWidth: { value: 200 },
      clientHeight: { value: 50 },
    });
    Object.defineProperties(content, {
      scrollWidth: { value: 400 },
      scrollHeight: { value: 100 },
    });

    expect(inspectSlideLayout(root)).toEqual([]);
  });

  it('shrinks rich text only to the configured readability floor', async () => {
    let resize: (() => void) | undefined;
    class ResizeObserverStub {
      constructor(callback: () => void) {
        resize = callback;
      }
      observe(): void {}
      disconnect(): void {}
    }
    vi.stubGlobal('ResizeObserver', ResizeObserverStub);
    const wrapper = mount(AutoFitHtml, {
      props: {
        elementId: 'title',
        elementType: 'text',
        html: '<p>Long title</p>',
        minScale: 0.7,
      },
    });
    const box = wrapper.element as HTMLElement;
    const content = wrapper.find('[data-aiforus-layout-content]').element as HTMLElement;
    Object.defineProperties(box, {
      clientWidth: { value: 200 },
      clientHeight: { value: 50 },
    });
    Object.defineProperties(content, {
      scrollWidth: { value: 400 },
      scrollHeight: { value: 100 },
    });
    resize?.();
    await nextTick();
    await nextTick();
    expect(wrapper.attributes('data-auto-fit-scale')).toBe('0.7');
    expect(wrapper.find('[data-aiforus-layout-content]').attributes('style')).toContain(
      'transform: scale(0.7)',
    );
  });
});
