import './style.css';

export { default as SlideCanvas } from './components/SlideCanvas.vue';
export { default as SlideElement } from './components/SlideElement.vue';
export { default as SlidePlayer } from './components/SlidePlayer.vue';

export { default as TextElement } from './elements/TextElement.vue';
export { default as ImageElement } from './elements/ImageElement.vue';
export { default as ShapeElement } from './elements/ShapeElement.vue';
export { default as LineElement } from './elements/LineElement.vue';
export { default as ChartElement } from './elements/ChartElement.vue';
export { default as TableElement } from './elements/TableElement.vue';
export { default as LatexElement } from './elements/LatexElement.vue';
export { default as VideoElement } from './elements/VideoElement.vue';
export { default as AudioElement } from './elements/AudioElement.vue';
export { default as CodeElement } from './elements/CodeElement.vue';

export {
  SlideActionPlayer,
  SlideActionPlayerError,
  createSpeechAdapter,
  validateSlideActionReferences,
} from './player/SlideActionPlayer.js';
export { captureSlideAsSvg, captureSlideElementAsPng, slideToPng } from './snapshot.js';
export {
  findElementBox,
  findNearestCorner,
  getElementBox,
  getElementPercentageGeometry,
} from './utils/geometry.js';
export { inspectSlideLayout } from './utils/layout.js';
export { backgroundToStyle, imageFiltersToCss } from './utils/style.js';
export type * from './types.js';
