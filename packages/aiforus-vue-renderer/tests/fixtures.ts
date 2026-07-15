import type { Scene, SlideContent } from '@aiforus/dsl';
import sceneFixture from '../../aiforus-dsl/fixtures/openmaic-d8a0081-slide-scene.json';

const scene = sceneFixture as Scene;

export const baselineSlide = (scene.content as SlideContent).canvas;
export const baselineActions = scene.actions ?? [];
