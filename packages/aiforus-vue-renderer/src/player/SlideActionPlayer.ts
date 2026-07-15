import type { Action, Slide } from '@aiforus/dsl';

import type {
  ActionReferenceIssue,
  HostActionContext,
  SlideActionPlayerOptions,
  SlideEffects,
  SpeechAdapter,
  SpeechContext,
} from '../types.js';

const ELEMENT_ACTIONS = new Set<Action['type']>(['spotlight', 'laser', 'play_video']);

export class SlideActionPlayerError extends Error {
  constructor(
    message: string,
    readonly code:
      'INVALID_ELEMENT_REFERENCE' | 'MISSING_ADAPTER' | 'UNSUPPORTED_ACTION' | 'ABORTED',
    readonly action?: Action,
  ) {
    super(message);
    this.name = 'SlideActionPlayerError';
  }
}

export function validateSlideActionReferences(
  slide: Slide,
  actions: readonly Action[],
): ActionReferenceIssue[] {
  const elementIds = new Set(slide.elements.map(({ id }) => id));
  const issues: ActionReferenceIssue[] = [];
  for (const action of actions) {
    if (!ELEMENT_ACTIONS.has(action.type) || !('elementId' in action)) continue;
    if (elementIds.has(action.elementId)) continue;
    issues.push({
      actionId: action.id,
      actionType: action.type,
      elementId: action.elementId,
      message: `${action.type} action ${JSON.stringify(action.id)} references missing slide element ${JSON.stringify(action.elementId)}.`,
    });
  }
  return issues;
}

export function createSpeechAdapter(
  speak: SpeechAdapter['speak'],
  stop?: SpeechAdapter['stop'],
): SpeechAdapter {
  return stop ? { speak, stop } : { speak };
}

export class SlideActionPlayer {
  private controller: AbortController | null = null;
  private effects: SlideEffects = {};
  private laserTimer: ReturnType<typeof setTimeout> | undefined;

  constructor(private readonly options: SlideActionPlayerOptions) {}

  get currentEffects(): SlideEffects {
    return { ...this.effects };
  }

  async play(actions: readonly Action[], startIndex = 0): Promise<void> {
    await this.stop();
    const issues = validateSlideActionReferences(this.options.slide, actions);
    if (issues.length > 0) {
      throw new SlideActionPlayerError(
        issues.map(({ message }) => message).join(' '),
        'INVALID_ELEMENT_REFERENCE',
      );
    }

    this.controller = new AbortController();
    const { signal } = this.controller;
    for (let index = startIndex; index < actions.length; index += 1) {
      const action = actions[index];
      if (!action) continue;
      if (signal.aborted) throw new SlideActionPlayerError('Playback aborted.', 'ABORTED', action);
      this.options.onActionStart?.(action, index);
      await this.execute(action, index, signal);
      this.options.onActionEnd?.(action, index);
    }
  }

  async stop(): Promise<void> {
    this.controller?.abort();
    this.controller = null;
    if (this.laserTimer) clearTimeout(this.laserTimer);
    this.laserTimer = undefined;
    await Promise.all([this.options.speechAdapter?.stop?.(), this.options.mediaAdapter?.stop?.()]);
  }

  reset(): void {
    if (this.laserTimer) clearTimeout(this.laserTimer);
    this.laserTimer = undefined;
    this.setEffects({});
  }

  private context(actionIndex: number, signal: AbortSignal): SpeechContext {
    return { slide: this.options.slide, actionIndex, signal };
  }

  private hostContext(actionIndex: number, signal: AbortSignal): HostActionContext {
    return {
      ...this.context(actionIndex, signal),
      setEffects: (effects) => this.setEffects(effects),
    };
  }

  private async execute(action: Action, actionIndex: number, signal: AbortSignal): Promise<void> {
    if (action.type === 'spotlight') {
      this.setEffects({
        ...this.effects,
        spotlight: {
          elementId: action.elementId,
          ...(action.dimOpacity === undefined ? {} : { dimOpacity: action.dimOpacity }),
        },
      });
      return;
    }

    if (action.type === 'laser') {
      this.setEffects({
        ...this.effects,
        laser: {
          elementId: action.elementId,
          ...(action.color === undefined ? {} : { color: action.color }),
        },
      });
      if (this.laserTimer) clearTimeout(this.laserTimer);
      this.laserTimer = setTimeout(() => {
        const { laser: _laser, ...remaining } = this.effects;
        this.setEffects(remaining);
      }, 3000);
      return;
    }

    if (action.type === 'speech') {
      if (this.options.speechAdapter) {
        await this.options.speechAdapter.speak(action, this.context(actionIndex, signal));
        return;
      }
      await this.delegateOrThrow(action, actionIndex, signal, 'speech adapter');
      return;
    }

    if (action.type === 'play_video') {
      if (this.options.mediaAdapter) {
        await this.options.mediaAdapter.playVideo(action, this.context(actionIndex, signal));
        return;
      }
      await this.delegateOrThrow(action, actionIndex, signal, 'media adapter');
      return;
    }

    await this.delegateOrThrow(action, actionIndex, signal, 'host action executor');
  }

  private async delegateOrThrow(
    action: Action,
    actionIndex: number,
    signal: AbortSignal,
    missing: string,
  ): Promise<void> {
    if (this.options.hostActionExecutor) {
      await this.options.hostActionExecutor(action, this.hostContext(actionIndex, signal));
      return;
    }
    throw new SlideActionPlayerError(
      `${action.type} requires a ${missing}; the slide renderer will not silently interpret host-owned actions.`,
      action.type === 'speech' || action.type === 'play_video'
        ? 'MISSING_ADAPTER'
        : 'UNSUPPORTED_ACTION',
      action,
    );
  }

  private setEffects(effects: SlideEffects): void {
    this.effects = { ...effects };
    this.options.onEffectsChange?.(this.currentEffects);
  }
}
