<script setup lang="ts">
import type { Action, Slide } from '@aiforus/dsl';
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';

import { SlideActionPlayer } from '../player/SlideActionPlayer.js';
import type { HostActionExecutor, MediaAdapter, SlideEffects, SpeechAdapter } from '../types.js';
import SlideCanvas from './SlideCanvas.vue';

const props = withDefaults(
  defineProps<{
    slide: Slide;
    actions?: Action[];
    autoPlay?: boolean;
    scale?: number;
    chrome?: boolean;
    autoFitText?: boolean;
    minTextScale?: number;
    speechAdapter?: SpeechAdapter;
    mediaAdapter?: MediaAdapter;
    hostActionExecutor?: HostActionExecutor;
  }>(),
  {
    actions: () => [],
    autoPlay: false,
    chrome: true,
    autoFitText: true,
    minTextScale: 0.65,
  },
);

const emit = defineEmits<{
  actionStart: [action: Action, index: number];
  actionEnd: [action: Action, index: number];
  effectsChange: [effects: SlideEffects];
  complete: [];
  error: [error: unknown];
}>();

const effects = ref<SlideEffects>({});
let player: SlideActionPlayer | undefined;

function makePlayer(): SlideActionPlayer {
  return new SlideActionPlayer({
    slide: props.slide,
    ...(props.speechAdapter ? { speechAdapter: props.speechAdapter } : {}),
    ...(props.mediaAdapter ? { mediaAdapter: props.mediaAdapter } : {}),
    ...(props.hostActionExecutor ? { hostActionExecutor: props.hostActionExecutor } : {}),
    onEffectsChange: (next) => {
      effects.value = next;
      emit('effectsChange', next);
    },
    onActionStart: (action, index) => emit('actionStart', action, index),
    onActionEnd: (action, index) => emit('actionEnd', action, index),
  });
}

async function play(startIndex = 0): Promise<void> {
  await player?.stop();
  player = makePlayer();
  try {
    await player.play(props.actions, startIndex);
    emit('complete');
  } catch (error) {
    emit('error', error);
    throw error;
  }
}

async function stop(): Promise<void> {
  await player?.stop();
}

function reset(): void {
  player?.reset();
  effects.value = {};
}

watch(
  () => props.slide,
  () => {
    void stop();
    reset();
  },
);

onMounted(() => {
  if (props.autoPlay) void play();
});
onBeforeUnmount(() => void stop());

defineExpose({ play, reset, stop });
</script>

<template>
  <SlideCanvas
    :slide="slide"
    :scale="scale"
    :chrome="chrome"
    :auto-fit-text="autoFitText"
    :min-text-scale="minTextScale"
    :effects="effects"
  >
    <template v-for="(_, name) in $slots" #[name]="slotProps">
      <slot :name="name" v-bind="slotProps ?? {}" />
    </template>
  </SlideCanvas>
</template>
