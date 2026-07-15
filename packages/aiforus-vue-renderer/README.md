# @aiforus/vue-renderer

Vue 3 renderer and action player for the AIForUs OpenMAIC-compatible Slide
DSL. The serialized input is owned by `@aiforus/dsl`; this package is only the
visual/playback layer.

Compatibility is frozen to OpenMAIC commit
`d8a0081c7d229081301dfa5f21ccfd7ba93bda51`. It targets the observable Slide
JSON and playback behavior, not the React component API of
`@openmaic/renderer`.

## Install

Use Node `22.16.0` and Vue `>=3.4.0 <4`:

```sh
pnpm add @aiforus/dsl @aiforus/vue-renderer
```

```ts
import { SlideCanvas } from '@aiforus/vue-renderer';
import '@aiforus/vue-renderer/style.css';
```

## Render a slide

```vue
<script setup lang="ts">
import type { Slide } from '@aiforus/dsl';
import { ref } from 'vue';
import { SlideCanvas, type LayoutDiagnostic } from '@aiforus/vue-renderer';
import '@aiforus/vue-renderer/style.css';

defineProps<{ slide: Slide }>();
const diagnostics = ref<LayoutDiagnostic[]>([]);
</script>

<template>
  <div class="slide-host">
    <SlideCanvas
      :slide="slide"
      :auto-fit-text="true"
      :min-text-scale="0.65"
      @layout-diagnostics="diagnostics = $event"
    />
  </div>
</template>

<style scoped>
.slide-host {
  width: 100%;
  aspect-ratio: 16 / 9;
}
</style>
```

The canvas uses the slide's fixed design coordinate system and scales the
entire viewport to fit its host. Element rendering and teacher effects resolve
the same stable `element.id`, so spotlight, laser, highlight, and zoom do not
depend on a second DOM-coordinate calculation.

## Playback adapters

`SlidePlayer` executes spotlight and laser itself. Speech, media, whiteboard,
discussion, and widget actions cross explicit host adapters and are never
silently ignored:

```ts
import { createSpeechAdapter, SlideActionPlayer } from '@aiforus/vue-renderer';

const player = new SlideActionPlayer({
  slide,
  speechAdapter: createSpeechAdapter(async (action, { signal }) => {
    await tts.play(action.text, { signal });
  }),
  mediaAdapter: {
    async playVideo(action) {
      await media.play(action.elementId);
    },
  },
  async hostActionExecutor(action, context) {
    await coursewareHost.execute(action, context);
  },
});

await player.play(actions);
```

`validateSlideActionReferences(slide, actions)` can reject missing Slide
element IDs before playback begins.

## Layout and snapshots

- Text and shape HTML auto-fit down to a configurable readability floor.
- Code lines wrap inside their design box.
- `inspectSlideLayout()` and the `layout-diagnostics` event report residual
  overflow and missing effect targets.
- `slideToPng()` and `captureSlideElementAsPng()` provide browser-side PNG
  capture without a snapshot runtime dependency.

PNG capture uses browser SVG `foreignObject`. Cross-origin images or
stylesheets still need normal CORS permission; use data URLs or same-origin
assets for deterministic export.

## Extension boundaries

Custom element components can be supplied with `registry`. Image, video,
audio, and code rendering can also be replaced through component slots.

This package accepts only `Slide`. Quiz and Deep Interactive are independent
content modes and deliberately remain outside this package.

See the repository
[`docs/renderer-compatibility.md`](https://github.com/MaoZain/aiforus-core/blob/main/docs/renderer-compatibility.md)
for the frozen parity matrix and intentional differences.
