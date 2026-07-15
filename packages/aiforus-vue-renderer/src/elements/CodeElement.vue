<script setup lang="ts">
import type { PPTCodeElement } from '@aiforus/dsl';

defineProps<{ element: PPTCodeElement }>();
</script>

<template>
  <div
    class="aiforus-element aiforus-element-code element-content"
    data-aiforus-layout-box
    :data-element-id="element.id"
    data-element-type="code"
    :style="{
      left: `${element.left}px`,
      top: `${element.top}px`,
      width: `${element.width}px`,
      height: `${element.height}px`,
      transform: `rotate(${element.rotate || 0}deg)`,
      fontSize: `${element.fontSize ?? 14}px`,
    }"
  >
    <slot :element="element">
      <div v-if="element.fileName" class="aiforus-code-header">{{ element.fileName }}</div>
      <div class="aiforus-code-body" data-aiforus-layout-content>
        <div v-for="(line, index) in element.lines" :key="line.id" class="aiforus-code-line">
          <span v-if="element.showLineNumbers !== false" class="aiforus-code-line-number">
            {{ index + 1 }}
          </span>
          <code>{{ line.content }}</code>
        </div>
      </div>
    </slot>
  </div>
</template>
