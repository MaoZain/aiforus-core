<script setup lang="ts">
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
  type CSSProperties,
} from 'vue';

const props = withDefaults(
  defineProps<{
    elementId: string;
    elementType: string;
    html: string;
    autoFit?: boolean;
    minScale?: number;
    verticalAlign?: 'top' | 'middle' | 'bottom';
    contentStyle?: CSSProperties;
  }>(),
  {
    autoFit: true,
    minScale: 0.65,
    verticalAlign: 'top',
    contentStyle: () => ({}),
  },
);

const boxRef = ref<HTMLElement | null>(null);
const contentRef = ref<HTMLElement | null>(null);
const scale = ref(1);
let resizeObserver: ResizeObserver | undefined;

const alignment = computed(() =>
  props.verticalAlign === 'middle'
    ? 'center'
    : props.verticalAlign === 'bottom'
      ? 'flex-end'
      : 'flex-start',
);

const fittedStyle = computed<CSSProperties>(() => ({
  ...props.contentStyle,
  transform: scale.value < 1 ? `scale(${scale.value})` : undefined,
  transformOrigin: 'top left',
  width: scale.value < 1 ? `${100 / scale.value}%` : '100%',
}));

async function measure(): Promise<void> {
  scale.value = 1;
  await nextTick();
  const box = boxRef.value;
  const content = contentRef.value;
  if (!box || !content || !props.autoFit) return;

  const widthRatio = box.clientWidth > 0 ? box.clientWidth / Math.max(content.scrollWidth, 1) : 1;
  const heightRatio =
    box.clientHeight > 0 ? box.clientHeight / Math.max(content.scrollHeight, 1) : 1;
  const fitted = Math.min(1, widthRatio, heightRatio);
  scale.value = fitted < 1 ? Math.max(props.minScale, fitted) : 1;
}

watch(
  () => [props.html, props.autoFit, props.minScale, props.contentStyle],
  () => void measure(),
  { deep: true },
);

onMounted(() => {
  void measure();
  if (typeof ResizeObserver !== 'undefined' && boxRef.value) {
    resizeObserver = new ResizeObserver(() => void measure());
    resizeObserver.observe(boxRef.value);
  }
});

onBeforeUnmount(() => resizeObserver?.disconnect());
</script>

<template>
  <div
    ref="boxRef"
    class="aiforus-auto-fit-box"
    data-aiforus-layout-box
    :data-element-id="elementId"
    :data-element-type="elementType"
    :data-auto-fit-scale="scale"
    :style="{ justifyContent: alignment }"
  >
    <div
      ref="contentRef"
      class="aiforus-rich-text"
      data-aiforus-layout-content
      :style="fittedStyle"
      v-html="html"
    />
  </div>
</template>
