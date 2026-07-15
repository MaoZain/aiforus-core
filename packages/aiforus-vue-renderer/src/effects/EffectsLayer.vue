<script setup lang="ts">
import type { PPTElement } from '@aiforus/dsl';
import { computed } from 'vue';

import type { SlideEffects } from '../types.js';
import { findElementBox } from '../utils/geometry.js';

let maskSequence = 0;

const props = defineProps<{
  elements: PPTElement[];
  effects?: SlideEffects;
  width: number;
  height: number;
}>();

const maskId = `aiforus-spotlight-mask-${++maskSequence}`;
const spotlightBox = computed(() =>
  props.effects?.spotlight
    ? findElementBox(props.elements, props.effects.spotlight.elementId)
    : null,
);
const highlightBox = computed(() =>
  props.effects?.highlight
    ? findElementBox(props.elements, props.effects.highlight.elementId)
    : null,
);
const laserBox = computed(() =>
  props.effects?.laser ? findElementBox(props.elements, props.effects.laser.elementId) : null,
);
</script>

<template>
  <div class="aiforus-effects-layer" aria-hidden="true">
    <svg
      v-if="effects?.spotlight && spotlightBox"
      class="aiforus-spotlight"
      :viewBox="`0 0 ${width} ${height}`"
      preserveAspectRatio="none"
    >
      <defs>
        <mask :id="maskId">
          <rect x="0" y="0" :width="width" :height="height" fill="white" />
          <rect
            :x="spotlightBox.x - (effects.spotlight.padding ?? 6)"
            :y="spotlightBox.y - (effects.spotlight.padding ?? 6)"
            :width="spotlightBox.width + (effects.spotlight.padding ?? 6) * 2"
            :height="spotlightBox.height + (effects.spotlight.padding ?? 6) * 2"
            :rx="effects.spotlight.radius ?? 8"
            fill="black"
            :transform="`rotate(${spotlightBox.rotate} ${spotlightBox.centerX} ${spotlightBox.centerY})`"
          />
        </mask>
      </defs>
      <rect
        x="0"
        y="0"
        :width="width"
        :height="height"
        fill="#000000"
        :fill-opacity="effects.spotlight.dimOpacity ?? 0.7"
        :mask="`url(#${maskId})`"
      />
      <rect
        :x="spotlightBox.x - (effects.spotlight.padding ?? 6)"
        :y="spotlightBox.y - (effects.spotlight.padding ?? 6)"
        :width="spotlightBox.width + (effects.spotlight.padding ?? 6) * 2"
        :height="spotlightBox.height + (effects.spotlight.padding ?? 6) * 2"
        :rx="effects.spotlight.radius ?? 8"
        fill="none"
        stroke="rgba(255,255,255,0.75)"
        stroke-width="2"
        vector-effect="non-scaling-stroke"
        :transform="`rotate(${spotlightBox.rotate} ${spotlightBox.centerX} ${spotlightBox.centerY})`"
      />
    </svg>

    <div
      v-if="effects?.highlight && highlightBox"
      class="aiforus-highlight"
      :class="{ 'aiforus-highlight--animated': effects.highlight.animated !== false }"
      :style="{
        left: `${highlightBox.x}px`,
        top: `${highlightBox.y}px`,
        width: `${highlightBox.width}px`,
        height: `${highlightBox.height}px`,
        transform: `rotate(${highlightBox.rotate}deg)`,
        borderColor: effects.highlight.color ?? '#ff6b6b',
        borderWidth: `${effects.highlight.borderWidth ?? 3}px`,
        backgroundColor: `${effects.highlight.color ?? '#ff6b6b'}${Math.round(
          (effects.highlight.opacity ?? 0.3) * 255,
        )
          .toString(16)
          .padStart(2, '0')}`,
      }"
    />

    <div
      v-if="effects?.laser && laserBox"
      class="aiforus-laser"
      :style="{
        left: `${laserBox.centerX}px`,
        top: `${laserBox.centerY}px`,
        color: effects.laser.color ?? '#ff3b30',
      }"
    >
      <span class="aiforus-laser-ring" />
      <span class="aiforus-laser-dot" />
    </div>
  </div>
</template>
