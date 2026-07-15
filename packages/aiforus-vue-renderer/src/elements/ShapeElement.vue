<script setup lang="ts">
import type { PPTShapeElement } from '@aiforus/dsl';
import { computed, type CSSProperties } from 'vue';

import AutoFitHtml from '../components/AutoFitHtml.vue';
import { flipToCss, shadowToCss, strokeDashArray } from '../utils/style.js';

const props = defineProps<{
  element: PPTShapeElement;
  autoFitText: boolean;
  minTextScale: number;
}>();

const gradientId = computed(() => `aiforus-gradient-${props.element.id}`);
const patternId = computed(() => `aiforus-pattern-${props.element.id}`);
const fill = computed(() => {
  if (props.element.pattern) return `url(#${patternId.value})`;
  if (props.element.gradient) return `url(#${gradientId.value})`;
  return props.element.fill || 'none';
});
const text = computed(
  () =>
    props.element.text ?? {
      content: '',
      align: 'middle' as const,
      defaultFontName: 'Microsoft YaHei',
      defaultColor: '#333333',
    },
);
const textStyle = computed<CSSProperties>(() => ({
  color: text.value.defaultColor,
  fontFamily: text.value.defaultFontName,
  letterSpacing: `${text.value.wordSpace ?? 0}px`,
  lineHeight: text.value.lineHeight,
  '--aiforus-paragraph-space': `${text.value.paragraphSpace ?? 5}px`,
}));

const linearCoordinates = computed(() => {
  const radians = (((props.element.gradient?.rotate ?? 0) - 90) * Math.PI) / 180;
  const x = Math.cos(radians) * 50;
  const y = Math.sin(radians) * 50;
  return { x1: 50 - x, y1: 50 - y, x2: 50 + x, y2: 50 + y };
});
</script>

<template>
  <div
    class="aiforus-element aiforus-element-shape element-content"
    :style="{
      left: `${element.left}px`,
      top: `${element.top}px`,
      width: `${element.width}px`,
      height: `${element.height}px`,
      transform: `rotate(${element.rotate || 0}deg)`,
      opacity: element.opacity,
      filter: shadowToCss(element.shadow)
        ? `drop-shadow(${shadowToCss(element.shadow)})`
        : undefined,
    }"
  >
    <svg
      class="aiforus-shape-svg"
      :viewBox="`0 0 ${element.viewBox[0]} ${element.viewBox[1]}`"
      preserveAspectRatio="none"
      :style="{ transform: flipToCss(element.flipH, element.flipV) }"
    >
      <defs>
        <template v-if="element.gradient">
          <radialGradient v-if="element.gradient.type === 'radial'" :id="gradientId">
            <stop
              v-for="stop in element.gradient.colors"
              :key="`${stop.pos}-${stop.color}`"
              :offset="`${stop.pos}%`"
              :stop-color="stop.color"
            />
          </radialGradient>
          <linearGradient
            v-else
            :id="gradientId"
            :x1="`${linearCoordinates.x1}%`"
            :y1="`${linearCoordinates.y1}%`"
            :x2="`${linearCoordinates.x2}%`"
            :y2="`${linearCoordinates.y2}%`"
          >
            <stop
              v-for="stop in element.gradient.colors"
              :key="`${stop.pos}-${stop.color}`"
              :offset="`${stop.pos}%`"
              :stop-color="stop.color"
            />
          </linearGradient>
        </template>
        <pattern v-if="element.pattern" :id="patternId" width="1" height="1">
          <image :href="element.pattern" width="100%" height="100%" preserveAspectRatio="none" />
        </pattern>
      </defs>
      <path
        :d="element.path"
        :fill="fill"
        :stroke="element.outline?.color ?? 'transparent'"
        :stroke-width="element.outline?.width ?? 0"
        :stroke-dasharray="strokeDashArray(element.outline)"
        vector-effect="non-scaling-stroke"
        stroke-linecap="butt"
        stroke-miterlimit="8"
      />
    </svg>
    <AutoFitHtml
      v-if="text.content"
      class="aiforus-shape-text"
      :element-id="element.id"
      element-type="shape"
      :html="text.content"
      :auto-fit="autoFitText"
      :min-scale="minTextScale"
      :vertical-align="text.align"
      :content-style="textStyle"
    />
  </div>
</template>
