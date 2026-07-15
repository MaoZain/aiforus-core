<script setup lang="ts">
import type { PPTChartElement } from '@aiforus/dsl';
import { computed } from 'vue';

const props = defineProps<{ element: PPTChartElement }>();

const palette = computed(() =>
  props.element.themeColors.length > 0
    ? props.element.themeColors
    : ['#2563eb', '#16a34a', '#f59e0b', '#dc2626', '#7c3aed'],
);
const width = computed(() => props.element.width);
const height = computed(() => props.element.height);
const plot = computed(() => ({
  left: 42,
  top: 18,
  width: Math.max(1, width.value - 62),
  height: Math.max(1, height.value - 54),
}));
const maxValue = computed(() => {
  const values = props.element.data.series.flat().map((value) => Math.abs(value));
  return Math.max(1, ...values);
});

function color(index: number): string {
  return palette.value[index % palette.value.length] ?? '#2563eb';
}

const verticalBars = computed(() => {
  const labels = props.element.data.labels;
  const series = props.element.data.series;
  const categoryWidth = plot.value.width / Math.max(labels.length, 1);
  const gap = 3;
  const barWidth = Math.max(
    1,
    (categoryWidth - 8 - gap * Math.max(series.length - 1, 0)) / Math.max(series.length, 1),
  );
  return series.flatMap((values, seriesIndex) =>
    labels.map((label, labelIndex) => {
      const value = values[labelIndex] ?? 0;
      const barHeight = (Math.max(0, value) / maxValue.value) * plot.value.height;
      return {
        key: `${seriesIndex}-${labelIndex}`,
        label,
        value,
        x: plot.value.left + labelIndex * categoryWidth + 4 + seriesIndex * (barWidth + gap),
        y: plot.value.top + plot.value.height - barHeight,
        width: barWidth,
        height: barHeight,
        color: color(seriesIndex),
      };
    }),
  );
});

const horizontalBars = computed(() => {
  const labels = props.element.data.labels;
  const series = props.element.data.series;
  const categoryHeight = plot.value.height / Math.max(labels.length, 1);
  const gap = 3;
  const barHeight = Math.max(
    1,
    (categoryHeight - 8 - gap * Math.max(series.length - 1, 0)) / Math.max(series.length, 1),
  );
  return series.flatMap((values, seriesIndex) =>
    labels.map((label, labelIndex) => {
      const value = values[labelIndex] ?? 0;
      return {
        key: `${seriesIndex}-${labelIndex}`,
        label,
        value,
        x: plot.value.left,
        y: plot.value.top + labelIndex * categoryHeight + 4 + seriesIndex * (barHeight + gap),
        width: (Math.max(0, value) / maxValue.value) * plot.value.width,
        height: barHeight,
        color: color(seriesIndex),
      };
    }),
  );
});

const lineSeries = computed(() =>
  props.element.data.series.map((values, seriesIndex) => {
    const denominator = Math.max(values.length - 1, 1);
    const points = values.map((value, index) => ({
      x: plot.value.left + (index / denominator) * plot.value.width,
      y:
        plot.value.top +
        plot.value.height -
        (Math.max(0, value) / maxValue.value) * plot.value.height,
      value,
    }));
    return {
      key: String(seriesIndex),
      color: color(seriesIndex),
      points,
      pointsString: points.map(({ x, y }) => `${x},${y}`).join(' '),
      areaPoints: `${plot.value.left},${plot.value.top + plot.value.height} ${points
        .map(({ x, y }) => `${x},${y}`)
        .join(' ')} ${plot.value.left + plot.value.width},${plot.value.top + plot.value.height}`,
    };
  }),
);

function polar(cx: number, cy: number, radius: number, angle: number): [number, number] {
  const radians = ((angle - 90) * Math.PI) / 180;
  return [cx + radius * Math.cos(radians), cy + radius * Math.sin(radians)];
}

const pieSegments = computed(() => {
  const values = props.element.data.series[0] ?? [];
  const total = Math.max(
    1,
    values.reduce((sum, value) => sum + Math.max(value, 0), 0),
  );
  const cx = width.value / 2;
  const cy = height.value / 2 - 8;
  const outerRadius = Math.max(1, Math.min(width.value, height.value) * 0.32);
  const innerRadius = props.element.chartType === 'ring' ? outerRadius * 0.55 : 0;
  let angle = 0;
  return values.map((value, index) => {
    const startAngle = angle;
    const sweep = (Math.max(value, 0) / total) * 360;
    angle += sweep;
    const endAngle = angle >= 360 ? 359.999 : angle;
    const [x1, y1] = polar(cx, cy, outerRadius, startAngle);
    const [x2, y2] = polar(cx, cy, outerRadius, endAngle);
    const large = sweep > 180 ? 1 : 0;
    let path = `M${cx},${cy} L${x1},${y1} A${outerRadius},${outerRadius} 0 ${large} 1 ${x2},${y2} Z`;
    if (innerRadius > 0) {
      const [ix1, iy1] = polar(cx, cy, innerRadius, startAngle);
      const [ix2, iy2] = polar(cx, cy, innerRadius, endAngle);
      path = `M${x1},${y1} A${outerRadius},${outerRadius} 0 ${large} 1 ${x2},${y2} L${ix2},${iy2} A${innerRadius},${innerRadius} 0 ${large} 0 ${ix1},${iy1} Z`;
    }
    return {
      key: String(index),
      path,
      color: color(index),
      label: props.element.data.labels[index] ?? '',
      value,
    };
  });
});

const radar = computed(() => {
  const labels = props.element.data.labels;
  const count = Math.max(labels.length, 3);
  const cx = width.value / 2;
  const cy = height.value / 2;
  const radius = Math.max(1, Math.min(width.value, height.value) * 0.34);
  const axes = Array.from({ length: count }, (_, index) => {
    const [x, y] = polar(cx, cy, radius, (index / count) * 360);
    return { x, y, label: labels[index] ?? '' };
  });
  const series = props.element.data.series.map((values, seriesIndex) => {
    const points = Array.from({ length: count }, (_, index) => {
      const value = Math.max(0, values[index] ?? 0);
      const [x, y] = polar(cx, cy, radius * (value / maxValue.value), (index / count) * 360);
      return `${x},${y}`;
    });
    return { key: String(seriesIndex), points: points.join(' '), color: color(seriesIndex) };
  });
  return { cx, cy, axes, series };
});

const scatterPoints = computed(() => {
  const xs = props.element.data.series[0] ?? [];
  const ys = props.element.data.series[1] ?? xs;
  const maxX = Math.max(1, ...xs.map(Math.abs));
  const maxY = Math.max(1, ...ys.map(Math.abs));
  return xs.map((x, index) => ({
    x: plot.value.left + (x / maxX) * plot.value.width,
    y: plot.value.top + plot.value.height - ((ys[index] ?? x) / maxY) * plot.value.height,
  }));
});
</script>

<template>
  <div
    class="aiforus-element aiforus-element-chart element-content"
    :style="{
      left: `${element.left}px`,
      top: `${element.top}px`,
      width: `${element.width}px`,
      height: `${element.height}px`,
      transform: `rotate(${element.rotate || 0}deg)`,
      backgroundColor: element.fill,
      color: element.textColor,
      border: element.outline
        ? `${element.outline.width ?? 1}px ${element.outline.style ?? 'solid'} ${element.outline.color ?? '#000'}`
        : undefined,
    }"
  >
    <svg class="aiforus-chart-svg" :viewBox="`0 0 ${width} ${height}`" preserveAspectRatio="none">
      <template v-if="element.chartType === 'bar'">
        <line
          :x1="plot.left"
          :y1="plot.top + plot.height"
          :x2="plot.left + plot.width"
          :y2="plot.top + plot.height"
          :stroke="element.lineColor ?? '#d1d5db'"
        />
        <rect
          v-for="bar in verticalBars"
          :key="bar.key"
          :x="bar.x"
          :y="bar.y"
          :width="bar.width"
          :height="bar.height"
          :fill="bar.color"
          rx="2"
        />
      </template>
      <template v-else-if="element.chartType === 'column'">
        <line
          :x1="plot.left"
          :y1="plot.top"
          :x2="plot.left"
          :y2="plot.top + plot.height"
          :stroke="element.lineColor ?? '#d1d5db'"
        />
        <rect
          v-for="bar in horizontalBars"
          :key="bar.key"
          :x="bar.x"
          :y="bar.y"
          :width="bar.width"
          :height="bar.height"
          :fill="bar.color"
          rx="2"
        />
      </template>
      <template v-else-if="['line', 'area'].includes(element.chartType)">
        <template v-for="series in lineSeries" :key="series.key">
          <polygon
            v-if="element.chartType === 'area'"
            :points="series.areaPoints"
            :fill="series.color"
            fill-opacity="0.2"
          />
          <polyline
            :points="series.pointsString"
            fill="none"
            :stroke="series.color"
            stroke-width="2"
          />
          <circle
            v-for="point in series.points"
            :key="`${point.x}-${point.y}`"
            :cx="point.x"
            :cy="point.y"
            r="3"
            :fill="series.color"
          />
        </template>
      </template>
      <template v-else-if="element.chartType === 'pie' || element.chartType === 'ring'">
        <path
          v-for="segment in pieSegments"
          :key="segment.key"
          :d="segment.path"
          :fill="segment.color"
          stroke="#ffffff"
          stroke-width="1"
        />
      </template>
      <template v-else-if="element.chartType === 'radar'">
        <polygon
          :points="radar.axes.map(({ x, y }) => `${x},${y}`).join(' ')"
          fill="none"
          :stroke="element.lineColor ?? '#d1d5db'"
        />
        <line
          v-for="axis in radar.axes"
          :key="`${axis.x}-${axis.y}`"
          :x1="radar.cx"
          :y1="radar.cy"
          :x2="axis.x"
          :y2="axis.y"
          :stroke="element.lineColor ?? '#d1d5db'"
        />
        <polygon
          v-for="series in radar.series"
          :key="series.key"
          :points="series.points"
          :fill="series.color"
          fill-opacity="0.2"
          :stroke="series.color"
          stroke-width="2"
        />
      </template>
      <template v-else-if="element.chartType === 'scatter'">
        <circle
          v-for="(point, index) in scatterPoints"
          :key="index"
          :cx="point.x"
          :cy="point.y"
          r="5"
          :fill="color(index)"
        />
      </template>
    </svg>
  </div>
</template>
