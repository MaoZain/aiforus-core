<script setup lang="ts">
import type { PPTLatexElement } from '@aiforus/dsl';
import { computed } from 'vue';

const props = defineProps<{ element: PPTLatexElement }>();
const alignment = computed(() =>
  props.element.align === 'left'
    ? 'flex-start'
    : props.element.align === 'right'
      ? 'flex-end'
      : 'center',
);
</script>

<template>
  <div
    class="aiforus-element aiforus-element-latex element-content"
    data-aiforus-layout-box
    :data-element-id="element.id"
    data-element-type="latex"
    :style="{
      left: `${element.left}px`,
      top: `${element.top}px`,
      width: `${element.width}px`,
      height: `${element.height}px`,
      transform: `rotate(${element.rotate || 0}deg)`,
      color: element.color,
      justifyContent: alignment,
    }"
  >
    <div
      v-if="element.html"
      class="aiforus-latex-html aiforus-rich-text"
      data-aiforus-layout-content
      v-html="element.html"
    />
    <svg
      v-else-if="element.path && element.viewBox"
      :viewBox="`0 0 ${element.viewBox[0]} ${element.viewBox[1]}`"
      width="100%"
      height="100%"
      fill="none"
      :stroke="element.color ?? 'currentColor'"
      :stroke-width="element.strokeWidth ?? 1"
      preserveAspectRatio="none"
    >
      <path :d="element.path" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
    <span v-else data-aiforus-layout-content>{{ element.latex }}</span>
  </div>
</template>
