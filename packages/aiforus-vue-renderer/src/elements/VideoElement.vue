<script setup lang="ts">
import type { PPTVideoElement } from '@aiforus/dsl';

defineProps<{ element: PPTVideoElement }>();
</script>

<template>
  <div
    class="aiforus-element aiforus-element-video element-content"
    data-video-element
    :style="{
      left: `${element.left}px`,
      top: `${element.top}px`,
      width: `${element.width}px`,
      height: `${element.height}px`,
      transform: `rotate(${element.rotate || 0}deg)`,
    }"
  >
    <slot :element="element">
      <video
        v-if="element.src || element.poster"
        class="aiforus-media"
        :src="element.src ?? ''"
        :poster="element.poster ?? ''"
        :autoplay="element.autoplay"
        :controls="!!element.src"
        preload="metadata"
      />
      <div v-else class="aiforus-media-placeholder" aria-label="Video placeholder">
        <svg viewBox="0 0 24 24" aria-hidden="true"><polygon points="5 3 19 12 5 21 5 3" /></svg>
      </div>
    </slot>
  </div>
</template>
