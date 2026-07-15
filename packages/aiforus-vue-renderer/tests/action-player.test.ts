import { afterEach, describe, expect, it, vi } from 'vitest';

import { ACTION_TYPES, type Action } from '@aiforus/dsl';
import {
  SlideActionPlayer,
  createSpeechAdapter,
  validateSlideActionReferences,
} from '../src/player/SlideActionPlayer.js';
import type { SlideActionPlayerError } from '../src/player/SlideActionPlayer.js';
import { baselineActions, baselineSlide } from './fixtures.js';

afterEach(() => vi.useRealTimers());

describe('SlideActionPlayer', () => {
  it('rejects focus and media actions whose element IDs do not exist', () => {
    const action: Action = { id: 'missing', type: 'spotlight', elementId: 'not-on-slide' };
    expect(validateSlideActionReferences(baselineSlide, [action])).toEqual([
      expect.objectContaining({ actionId: 'missing', elementId: 'not-on-slide' }),
    ]);
  });

  it('keeps spotlight active while awaiting the injected speech adapter', async () => {
    const effects: unknown[] = [];
    const speak = vi.fn(async () => undefined);
    const player = new SlideActionPlayer({
      slide: baselineSlide,
      speechAdapter: createSpeechAdapter(speak),
      onEffectsChange: (next) => effects.push(next),
    });
    await player.play([
      { id: 'focus', type: 'spotlight', elementId: 'el-text', dimOpacity: 0.55 },
      { id: 'say', type: 'speech', text: 'Explain it.' },
    ]);

    expect(effects).toContainEqual({ spotlight: { elementId: 'el-text', dimOpacity: 0.55 } });
    expect(speak).toHaveBeenCalledOnce();
    expect(player.currentEffects.spotlight?.elementId).toBe('el-text');
  });

  it('delegates whiteboard/widget/discussion actions to the host boundary', async () => {
    const execute = vi.fn(async () => undefined);
    const player = new SlideActionPlayer({
      slide: baselineSlide,
      hostActionExecutor: execute,
    });
    const action = baselineActions.find(({ type }) => type === 'wb_open');
    expect(action).toBeDefined();
    await player.play([action!]);
    expect(execute).toHaveBeenCalledWith(action, expect.objectContaining({ slide: baselineSlide }));
  });

  it('handles or explicitly delegates every frozen action discriminant', async () => {
    expect(new Set(baselineActions.map(({ type }) => type))).toEqual(new Set(ACTION_TYPES));

    const speech = vi.fn(async () => undefined);
    const media = vi.fn(async () => undefined);
    const host = vi.fn(async () => undefined);
    const player = new SlideActionPlayer({
      slide: baselineSlide,
      speechAdapter: createSpeechAdapter(speech),
      mediaAdapter: { playVideo: media },
      hostActionExecutor: host,
    });

    await player.play(baselineActions);
    await player.stop();

    expect(speech).toHaveBeenCalledOnce();
    expect(media).toHaveBeenCalledOnce();
    expect(host).toHaveBeenCalledTimes(ACTION_TYPES.length - 4);
  });

  it('fails safely when a host-owned action has no executor', async () => {
    const player = new SlideActionPlayer({ slide: baselineSlide });
    await expect(player.play([{ id: 'wb', type: 'wb_open' }])).rejects.toMatchObject({
      code: 'UNSUPPORTED_ACTION',
    } satisfies Partial<SlideActionPlayerError>);
  });

  it('clears a fire-and-forget laser after its display window', async () => {
    vi.useFakeTimers();
    const effects: unknown[] = [];
    const player = new SlideActionPlayer({
      slide: baselineSlide,
      onEffectsChange: (next) => effects.push(next),
    });
    await player.play([{ id: 'laser', type: 'laser', elementId: 'el-shape' }]);
    expect(player.currentEffects.laser?.elementId).toBe('el-shape');
    await vi.advanceTimersByTimeAsync(3000);
    expect(player.currentEffects.laser).toBeUndefined();
    expect(effects.at(-1)).toEqual({});
  });
});
