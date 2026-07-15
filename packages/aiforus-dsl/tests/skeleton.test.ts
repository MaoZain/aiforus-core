import { describe, expect, it } from 'vitest';

import { AIFORUS_DSL_PACKAGE_NAME } from '../src/index.js';

describe('@aiforus/dsl package skeleton', () => {
  it('uses the reserved public package name', () => {
    expect(AIFORUS_DSL_PACKAGE_NAME).toBe('@aiforus/dsl');
  });
});
