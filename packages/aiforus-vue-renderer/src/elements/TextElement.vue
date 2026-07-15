<script setup lang="ts">
import type { PPTTextElement } from '@aiforus/dsl';
import { computed, type CSSProperties } from 'vue';

import AutoFitHtml from '../components/AutoFitHtml.vue';
import { outlineToCss, shadowToCss } from '../utils/style.js';

const props = defineProps<{
  element: PPTTextElement;
  autoFitText: boolean;
  minTextScale: number;
}>();

const contentStyle = computed<CSSProperties>(() => ({
  color: props.element.defaultColor,
  fontFamily: props.element.defaultFontName,
  height: props.element.vertical ? '100%' : undefined,
  letterSpacing: props.element.wordSpace === undefined ? undefined : `${props.element.wordSpace}px`,
  lineHeight: props.element.lineHeight,
  textShadow: shadowToCss(props.element.shadow),
  writingMode: props.element.vertical ? 'vertical-rl' : 'horizontal-tb',
  '--aiforus-paragraph-space': `${props.element.paragraphSpace ?? 0}px`,
}));
</script>

<template>
  <div
    class="aiforus-element aiforus-element-text element-content"
    :style="{
      left: `${element.left}px`,
      top: `${element.top}px`,
      width: `${element.width}px`,
      height: `${element.height}px`,
      transform: `rotate(${element.rotate || 0}deg)`,
      backgroundColor: element.fill,
      opacity: element.opacity,
    }"
  >
    <div
      v-if="element.outline"
      class="aiforus-element-outline"
      :style="{ border: outlineToCss(element.outline) }"
    />
    <AutoFitHtml
      :element-id="element.id"
      element-type="text"
      :html="element.content"
      :auto-fit="autoFitText"
      :min-scale="minTextScale"
      :vertical-align="element.vAlign ?? 'top'"
      :content-style="contentStyle"
    />
  </div>
</template>
