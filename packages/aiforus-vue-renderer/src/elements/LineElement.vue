<script setup lang="ts">
import type { PPTLineElement } from '@aiforus/dsl';
import { computed } from 'vue';

import { getLinePath, lineDashArray, shadowToCss } from '../utils/style.js';

const props = defineProps<{ element: PPTLineElement }>();
const path = computed(() => getLinePath(props.element));
const arrowSize = computed(() => Math.max(4, Math.min(12, props.element.width * 2)));
</script>

<template>
  <div
    class="aiforus-element aiforus-element-line element-content"
    :style="{
      left: `${element.left}px`,
      top: `${element.top}px`,
      filter: shadowToCss(element.shadow)
        ? `drop-shadow(${shadowToCss(element.shadow)})`
        : undefined,
    }"
  >
    <svg class="aiforus-line-svg" overflow="visible">
      <defs>
        <marker
          :id="`aiforus-line-start-${element.id}`"
          markerUnits="strokeWidth"
          markerWidth="8"
          markerHeight="8"
          refX="4"
          refY="4"
          orient="auto-start-reverse"
        >
          <path v-if="element.points[0] === 'arrow'" d="M8,0 L0,4 L8,8 Z" :fill="element.color" />
          <circle
            v-else-if="element.points[0] === 'dot'"
            cx="4"
            cy="4"
            :r="arrowSize / 4"
            :fill="element.color"
          />
        </marker>
        <marker
          :id="`aiforus-line-end-${element.id}`"
          markerUnits="strokeWidth"
          markerWidth="8"
          markerHeight="8"
          refX="4"
          refY="4"
          orient="auto"
        >
          <path v-if="element.points[1] === 'arrow'" d="M0,0 L8,4 L0,8 Z" :fill="element.color" />
          <circle
            v-else-if="element.points[1] === 'dot'"
            cx="4"
            cy="4"
            :r="arrowSize / 4"
            :fill="element.color"
          />
        </marker>
      </defs>
      <path
        :d="path"
        :stroke="element.color"
        :stroke-width="element.width"
        :stroke-dasharray="lineDashArray(element)"
        fill="none"
        :marker-start="element.points[0] ? `url(#aiforus-line-start-${element.id})` : 'none'"
        :marker-end="element.points[1] ? `url(#aiforus-line-end-${element.id})` : 'none'"
      />
    </svg>
  </div>
</template>
