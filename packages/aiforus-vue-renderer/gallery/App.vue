<script setup lang="ts">
import type { Slide } from '@aiforus/dsl';
import { ref } from 'vue';

import SlideCanvas from '../src/components/SlideCanvas.vue';
import type { LayoutDiagnostic, SlideEffects } from '../src/types.js';
import slideFixture from '../fixtures/golden-slide.json';
import '../src/style.css';

const slide = slideFixture as Slide;
const effects = ref<SlideEffects>({});
const diagnostics = ref<LayoutDiagnostic[]>([]);

function focus(elementId: string): void {
  effects.value = {
    spotlight: { elementId, dimOpacity: 0.68 },
    laser: { elementId, color: '#ef4444' },
  };
}
</script>

<template>
  <main>
    <header>
      <div>
        <p class="eyebrow">@aiforus/vue-renderer · Phase 3 gallery</p>
        <h1>OpenMAIC-compatible Slide canvas</h1>
      </div>
      <nav>
        <button type="button" @click="effects = {}">Clear</button>
        <button type="button" @click="focus('golden-title')">Focus title</button>
        <button type="button" @click="focus('golden-chart')">Focus chart</button>
        <button type="button" @click="focus('golden-code')">Focus code</button>
      </nav>
    </header>
    <section class="stage">
      <SlideCanvas :slide="slide" :effects="effects" @layout-diagnostics="diagnostics = $event" />
    </section>
    <footer>
      <span>10 element types · ID-aligned effects · auto-fit text</span>
      <span :class="{ warning: diagnostics.length > 0 }">
        {{ diagnostics.length }} layout diagnostics
      </span>
    </footer>
  </main>
</template>

<style scoped>
:global(*) {
  box-sizing: border-box;
}
:global(body) {
  margin: 0;
  color: #0f172a;
  background: #eef2ff;
  font-family: Inter, Arial, sans-serif;
}
main {
  min-height: 100vh;
  padding: 24px;
}
header,
footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1200px;
  margin: 0 auto;
}
header {
  gap: 24px;
  margin-bottom: 18px;
}
.eyebrow {
  margin: 0 0 4px;
  color: #2563eb;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
h1 {
  margin: 0;
  font-size: 24px;
}
nav {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
button {
  padding: 8px 12px;
  color: #1e3a8a;
  background: #fff;
  border: 1px solid #bfdbfe;
  border-radius: 8px;
  cursor: pointer;
}
button:hover {
  background: #eff6ff;
}
.stage {
  width: min(1200px, calc(100vw - 48px));
  aspect-ratio: 16 / 9;
  margin: 0 auto;
  overflow: hidden;
  background: #cbd5e1;
  border-radius: 16px;
  box-shadow: 0 24px 70px rgba(30, 64, 175, 0.18);
}
footer {
  padding-top: 14px;
  color: #475569;
  font-size: 13px;
}
.warning {
  color: #b45309;
  font-weight: 700;
}
</style>
