<script setup lang="ts">
import type { PPTAudioElement } from '@aiforus/dsl';

defineProps<{ element: PPTAudioElement }>();
</script>

<template>
  <div
    class="aiforus-element aiforus-element-audio element-content"
    :style="{
      left: `${element.left}px`,
      top: `${element.top}px`,
      width: `${element.width}px`,
      height: `${element.height}px`,
      transform: `rotate(${element.rotate || 0}deg)`,
      color: element.color,
    }"
  >
    <slot :element="element">
      <audio
        v-if="element.src"
        class="aiforus-audio-control"
        :src="element.src"
        :autoplay="element.autoplay"
        :loop="element.loop"
        controls
        preload="metadata"
      />
      <div v-else class="aiforus-media-placeholder" aria-label="Audio placeholder">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M9 18V5l11-2v13" fill="none" stroke="currentColor" stroke-width="2" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="17" cy="16" r="3" />
        </svg>
      </div>
    </slot>
  </div>
</template>
