import { describe, expect, it } from 'vitest';

import { AIFORUS_VUE_RENDERER_PACKAGE_NAME } from '../src/index.js';

describe('@aiforus/vue-renderer package skeleton', () => {
  it('uses the reserved public package name', () => {
    expect(AIFORUS_VUE_RENDERER_PACKAGE_NAME).toBe('@aiforus/vue-renderer');
  });
});
