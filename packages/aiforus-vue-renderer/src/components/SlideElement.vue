<script setup lang="ts">
import type { PPTElement } from '@aiforus/dsl';
import { computed, useSlots } from 'vue';

import AudioElement from '../elements/AudioElement.vue';
import ChartElement from '../elements/ChartElement.vue';
import CodeElement from '../elements/CodeElement.vue';
import ImageElement from '../elements/ImageElement.vue';
import LatexElement from '../elements/LatexElement.vue';
import LineElement from '../elements/LineElement.vue';
import ShapeElement from '../elements/ShapeElement.vue';
import TableElement from '../elements/TableElement.vue';
import TextElement from '../elements/TextElement.vue';
import VideoElement from '../elements/VideoElement.vue';
import type { ElementRendererRegistry } from '../types.js';

const props = defineProps<{
  element: PPTElement;
  elementIndex: number;
  autoFitText: boolean;
  minTextScale: number;
  registry?: ElementRendererRegistry;
}>();

const emit = defineEmits<{ elementClick: [element: PPTElement, event: MouseEvent] }>();
const slots = useSlots();
const customRenderer = computed(() => props.registry?.[props.element.type]);
</script>

<template>
  <div
    class="aiforus-slide-element-layer"
    :data-element-id="element.id"
    :data-element-type="element.type"
    :style="{ zIndex: elementIndex }"
    @click.stop="emit('elementClick', element, $event)"
  >
    <component
      :is="customRenderer"
      v-if="customRenderer"
      :element="element"
      :element-index="elementIndex"
      :auto-fit-text="autoFitText"
      :min-text-scale="minTextScale"
    />
    <TextElement
      v-else-if="element.type === 'text'"
      :element="element"
      :auto-fit-text="autoFitText"
      :min-text-scale="minTextScale"
    />
    <ShapeElement
      v-else-if="element.type === 'shape'"
      :element="element"
      :auto-fit-text="autoFitText"
      :min-text-scale="minTextScale"
    />
    <ImageElement v-else-if="element.type === 'image'" :element="element">
      <template v-if="slots.image" #default="slotProps">
        <slot name="image" v-bind="slotProps" />
      </template>
    </ImageElement>
    <LineElement v-else-if="element.type === 'line'" :element="element" />
    <ChartElement v-else-if="element.type === 'chart'" :element="element" />
    <TableElement v-else-if="element.type === 'table'" :element="element" />
    <LatexElement v-else-if="element.type === 'latex'" :element="element" />
    <VideoElement v-else-if="element.type === 'video'" :element="element">
      <template v-if="slots.video" #default="slotProps">
        <slot name="video" v-bind="slotProps" />
      </template>
    </VideoElement>
    <AudioElement v-else-if="element.type === 'audio'" :element="element">
      <template v-if="slots.audio" #default="slotProps">
        <slot name="audio" v-bind="slotProps" />
      </template>
    </AudioElement>
    <CodeElement v-else-if="element.type === 'code'" :element="element">
      <template v-if="slots.code" #default="slotProps">
        <slot name="code" v-bind="slotProps" />
      </template>
    </CodeElement>
  </div>
</template>
