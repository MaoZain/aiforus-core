<script setup lang="ts">
import type { PPTImageElement } from '@aiforus/dsl';
import { computed, type CSSProperties } from 'vue';

import { flipToCss, imageFiltersToCss, outlineToCss, shadowToCss } from '../utils/style.js';

const props = defineProps<{ element: PPTImageElement }>();

const CLIP_PATHS: Record<string, string> = {
  rect: '',
  rect2: 'polygon(0% 0%, 80% 0%, 100% 20%, 100% 100%, 0 100%)',
  rect3: 'polygon(0% 0%, 80% 0%, 100% 20%, 100% 100%, 20% 100%, 0% 80%)',
  roundRect: 'inset(0 round 10px)',
  ellipse: 'ellipse(50% 50% at 50% 50%)',
  triangle: 'polygon(50% 0%, 0% 100%, 100% 100%)',
  triangle2: 'polygon(50% 100%, 0% 0%, 100% 0%)',
  triangle3: 'polygon(0% 0%, 0% 100%, 100% 100%)',
  rhombus: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
  pentagon: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)',
  hexagon: 'polygon(20% 0%, 80% 0%, 100% 50%, 80% 100%, 20% 100%, 0% 50%)',
  octagon: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)',
  chevron: 'polygon(75% 0%, 100% 50%, 75% 100%, 0% 100%, 25% 50%, 0% 0%)',
  point: 'polygon(0% 0%, 75% 0%, 100% 50%, 75% 100%, 0% 100%)',
  arrow: 'polygon(0% 20%, 60% 20%, 60% 0%, 100% 50%, 60% 100%, 60% 80%, 0% 80%)',
  parallelogram: 'polygon(30% 0%, 100% 0%, 70% 100%, 0% 100%)',
  parallelogram2: 'polygon(30% 100%, 100% 100%, 70% 0%, 0% 0%)',
  trapezoid: 'polygon(25% 0%, 75% 0%, 100% 100%, 0% 100%)',
  trapezoid2: 'polygon(0% 0%, 100% 0%, 75% 100%, 25% 100%)',
};

const clipPath = computed(() => {
  if (props.element.radius !== undefined) return `inset(0 round ${props.element.radius}px)`;
  return CLIP_PATHS[props.element.clip?.shape ?? 'rect'] ?? '';
});

const imageStyle = computed<CSSProperties>(() => {
  const range = props.element.clip?.range;
  let position: CSSProperties = { left: 0, top: 0, width: '100%', height: '100%' };
  if (range) {
    const widthScale = Math.max((range[1][0] - range[0][0]) / 100, 0.0001);
    const heightScale = Math.max((range[1][1] - range[0][1]) / 100, 0.0001);
    position = {
      left: `${-range[0][0] / widthScale}%`,
      top: `${-range[0][1] / heightScale}%`,
      width: `${100 / widthScale}%`,
      height: `${100 / heightScale}%`,
    };
  }
  const edge = props.element.softEdge && props.element.softEdge > 0 ? props.element.softEdge : 0;
  const mask = edge
    ? `linear-gradient(to right, transparent 0, #000 ${edge}px, #000 calc(100% - ${edge}px), transparent 100%), linear-gradient(to bottom, transparent 0, #000 ${edge}px, #000 calc(100% - ${edge}px), transparent 100%)`
    : undefined;
  return {
    ...position,
    filter: imageFiltersToCss(props.element.filters),
    maskImage: mask,
    maskComposite: edge ? 'intersect' : undefined,
  };
});
</script>

<template>
  <div
    class="aiforus-element aiforus-element-image element-content"
    :style="{
      left: `${element.left}px`,
      top: `${element.top}px`,
      width: `${element.width}px`,
      height: `${element.height}px`,
      transform: `rotate(${element.rotate || 0}deg)`,
      filter: shadowToCss(element.shadow)
        ? `drop-shadow(${shadowToCss(element.shadow)})`
        : undefined,
    }"
  >
    <div
      class="aiforus-image-frame"
      :style="{
        clipPath,
        transform: flipToCss(element.flipH, element.flipV),
        border: outlineToCss(element.outline),
      }"
    >
      <slot :element="element" :src="element.src">
        <img
          v-if="element.src"
          class="aiforus-image"
          :src="element.src"
          alt=""
          draggable="false"
          :data-soft-edge="element.softEdge || undefined"
          :style="imageStyle"
        />
      </slot>
      <div
        v-if="element.colorMask"
        class="aiforus-image-color-mask"
        :style="{ backgroundColor: element.colorMask }"
      />
    </div>
  </div>
</template>
