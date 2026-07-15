import type { Action, PPTElement, PPTElementType, Slide, SlideBackground } from '@aiforus/dsl';
import type { Component } from 'vue';

export interface LaserEffectOptions {
  elementId: string;
  color?: string;
  duration?: number;
}

export interface SpotlightEffectOptions {
  elementId: string;
  dimOpacity?: number;
  padding?: number;
  radius?: number;
}

export interface HighlightEffectOptions {
  elementId: string;
  color?: string;
  opacity?: number;
  borderWidth?: number;
  animated?: boolean;
}

export interface ZoomEffectOptions {
  elementId: string;
  scale: number;
}

export interface SlideEffects {
  laser?: LaserEffectOptions;
  spotlight?: SpotlightEffectOptions;
  highlight?: HighlightEffectOptions;
  zoom?: ZoomEffectOptions;
}

export interface ElementBox {
  x: number;
  y: number;
  width: number;
  height: number;
  rotate: number;
  centerX: number;
  centerY: number;
}

export type LayoutDiagnosticKind =
  'text-overflow' | 'missing-effect-target' | 'unsupported-element';

export interface LayoutDiagnostic {
  kind: LayoutDiagnosticKind;
  severity: 'warning' | 'error';
  elementId?: string;
  elementType?: PPTElementType;
  message: string;
  overflowX?: number;
  overflowY?: number;
  appliedScale?: number;
}

export interface SlideCanvasProps {
  slide: Slide;
  scale?: number | undefined;
  background?: SlideBackground;
  effects?: SlideEffects;
  chrome?: boolean;
  autoFitText?: boolean;
  minTextScale?: number;
  registry?: ElementRendererRegistry;
}

export interface ElementRendererProps {
  element: PPTElement;
  elementIndex: number;
  autoFitText: boolean;
  minTextScale: number;
}

export type ElementRendererRegistry = Partial<Record<PPTElementType, Component>>;

export interface SpeechContext {
  slide: Slide;
  actionIndex: number;
  signal: AbortSignal;
}

export interface SpeechAdapter {
  speak(action: Extract<Action, { type: 'speech' }>, context: SpeechContext): Promise<void>;
  stop?(): void | Promise<void>;
}

export interface MediaAdapter {
  playVideo(action: Extract<Action, { type: 'play_video' }>, context: SpeechContext): Promise<void>;
  stop?(): void | Promise<void>;
}

export interface HostActionContext extends SpeechContext {
  setEffects(effects: SlideEffects): void;
}

export type HostActionExecutor = (action: Action, context: HostActionContext) => Promise<void>;

export interface SlideActionPlayerOptions {
  slide: Slide;
  speechAdapter?: SpeechAdapter;
  mediaAdapter?: MediaAdapter;
  hostActionExecutor?: HostActionExecutor;
  onEffectsChange?: (effects: SlideEffects) => void;
  onActionStart?: (action: Action, index: number) => void;
  onActionEnd?: (action: Action, index: number) => void;
}

export interface ActionReferenceIssue {
  actionId: string;
  actionType: Action['type'];
  elementId: string;
  message: string;
}

export interface SlideSnapshotOptions {
  pixelRatio?: number;
  backgroundColor?: string;
  format?: 'blob' | 'dataUrl';
  timeoutMs?: number;
}
