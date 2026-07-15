<script setup lang="ts">
import type { PPTElement } from '@aiforus/dsl';
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
  type CSSProperties,
} from 'vue';

import EffectsLayer from '../effects/EffectsLayer.vue';
import type { LayoutDiagnostic, SlideCanvasProps } from '../types.js';
import { findElementBox } from '../utils/geometry.js';
import { inspectSlideLayout } from '../utils/layout.js';
import { backgroundToStyle } from '../utils/style.js';
import SlideElement from './SlideElement.vue';

const props = withDefaults(defineProps<SlideCanvasProps>(), {
  chrome: true,
  autoFitText: true,
  minTextScale: 0.65,
  effects: () => ({}),
  registry: () => ({}),
});

const emit = defineEmits<{
  elementClick: [element: PPTElement, event: MouseEvent];
  layoutDiagnostics: [diagnostics: LayoutDiagnostic[]];
}>();

const containerRef = ref<HTMLElement | null>(null);
const slideRef = ref<HTMLElement | null>(null);
const containerWidth = ref(0);
const containerHeight = ref(0);
const diagnostics = ref<LayoutDiagnostic[]>([]);
let resizeObserver: ResizeObserver | undefined;

const designWidth = computed(() => props.slide.viewportSize || 1000);
const designHeight = computed(() => designWidth.value * (props.slide.viewportRatio || 0.5625));
const fitScale = computed(() => {
  if (props.scale !== undefined) return props.scale;
  if (containerWidth.value <= 0 || containerHeight.value <= 0) return 1;
  return Math.min(
    containerWidth.value / designWidth.value,
    containerHeight.value / designHeight.value,
  );
});
const viewportLeft = computed(() =>
  Math.max(0, (containerWidth.value - designWidth.value * fitScale.value) / 2),
);
const viewportTop = computed(() =>
  Math.max(0, (containerHeight.value - designHeight.value * fitScale.value) / 2),
);
const zoomBox = computed(() =>
  props.effects.zoom ? findElementBox(props.slide.elements, props.effects.zoom.elementId) : null,
);
const zoomScale = computed(() => (zoomBox.value ? (props.effects.zoom?.scale ?? 1) : 1));
const slideStyle = computed<CSSProperties>(() => ({
  width: `${designWidth.value}px`,
  height: `${designHeight.value}px`,
  left: `${viewportLeft.value}px`,
  top: `${viewportTop.value}px`,
  transform: `scale(${fitScale.value * zoomScale.value})`,
  transformOrigin: zoomBox.value
    ? `${zoomBox.value.centerX}px ${zoomBox.value.centerY}px`
    : 'top left',
  borderRadius: props.chrome ? '8px' : undefined,
  boxShadow: props.chrome ? '0 0 0 1px rgba(0,0,0,0.01), 0 0 12px rgba(0,0,0,0.1)' : undefined,
}));
const resolvedBackground = computed(() =>
  backgroundToStyle(props.background ?? props.slide.background),
);

function updateContainerSize(): void {
  const container = containerRef.value;
  if (!container) return;
  containerWidth.value = container.clientWidth;
  containerHeight.value = container.clientHeight;
}

async function updateDiagnostics(): Promise<void> {
  await nextTick();
  const root = slideRef.value;
  if (!root) return;
  const nextDiagnostics = inspectSlideLayout(root);
  for (const effect of ['spotlight', 'laser', 'highlight', 'zoom'] as const) {
    const target = props.effects[effect];
    if (target && !props.slide.elements.some(({ id }) => id === target.elementId)) {
      nextDiagnostics.push({
        kind: 'missing-effect-target',
        severity: 'error',
        elementId: target.elementId,
        message: `${effect} references missing element ${JSON.stringify(target.elementId)}.`,
      });
    }
  }
  diagnostics.value = nextDiagnostics;
  emit('layoutDiagnostics', nextDiagnostics);
}

watch(
  () => [props.slide, props.effects, props.autoFitText, props.minTextScale],
  () => void updateDiagnostics(),
  { deep: true },
);

onMounted(() => {
  updateContainerSize();
  void updateDiagnostics();
  if (typeof ResizeObserver !== 'undefined' && containerRef.value) {
    resizeObserver = new ResizeObserver(() => {
      updateContainerSize();
      void updateDiagnostics();
    });
    resizeObserver.observe(containerRef.value);
  }
});

onBeforeUnmount(() => resizeObserver?.disconnect());

defineExpose({
  diagnostics,
  fitScale,
  slideElement: slideRef,
  refreshLayoutDiagnostics: updateDiagnostics,
});
</script>

<template>
  <div ref="containerRef" class="aiforus-slide-canvas">
    <div
      ref="slideRef"
      class="aiforus-slide-viewport"
      data-aiforus-slide-viewport
      :data-slide-id="slide.id"
      :style="slideStyle"
    >
      <div class="aiforus-slide-background" :style="resolvedBackground" />
      <SlideElement
        v-for="(element, index) in slide.elements"
        :key="element.id"
        :element="element"
        :element-index="index + 1"
        :auto-fit-text="autoFitText"
        :min-text-scale="minTextScale"
        :registry="registry"
        @element-click="(clicked, event) => emit('elementClick', clicked, event)"
      >
        <template v-if="$slots.image" #image="slotProps">
          <slot name="image" v-bind="slotProps" />
        </template>
        <template v-if="$slots.video" #video="slotProps">
          <slot name="video" v-bind="slotProps" />
        </template>
        <template v-if="$slots.audio" #audio="slotProps">
          <slot name="audio" v-bind="slotProps" />
        </template>
        <template v-if="$slots.code" #code="slotProps">
          <slot name="code" v-bind="slotProps" />
        </template>
      </SlideElement>
      <EffectsLayer
        :elements="slide.elements"
        :effects="effects"
        :width="designWidth"
        :height="designHeight"
      />
    </div>
  </div>
</template>
