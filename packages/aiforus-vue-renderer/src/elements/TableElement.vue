<script setup lang="ts">
import type { PPTTableElement, TableCell, TableCellBorder, TableCellStyle } from '@aiforus/dsl';
import { computed, type CSSProperties } from 'vue';

import { outlineToCss } from '../utils/style.js';

const props = defineProps<{ element: PPTTableElement }>();

function borderCss(border?: TableCellBorder): string | undefined {
  return border && border.width > 0
    ? `${border.width}px ${border.style} ${border.color}`
    : undefined;
}

function textStyle(style?: TableCellStyle): CSSProperties {
  return {
    color: style?.color,
    backgroundColor: style?.backcolor,
    fontFamily: style?.fontname,
    fontSize: style?.fontsize,
    fontStyle: style?.em ? 'italic' : undefined,
    fontWeight: style?.bold ? 'bold' : undefined,
    textAlign: style?.align,
    textDecoration:
      [style?.underline ? 'underline' : '', style?.strikethrough ? 'line-through' : '']
        .filter(Boolean)
        .join(' ') || undefined,
  };
}

function alphaColor(color: string, alpha: number): string {
  const hex = color.replace('#', '');
  if (/^[0-9a-f]{6}$/iu.test(hex)) {
    const value = Number.parseInt(hex, 16);
    return `rgba(${(value >> 16) & 255}, ${(value >> 8) & 255}, ${value & 255}, ${alpha})`;
  }
  return color;
}

function cellBackground(cell: TableCell, row: number, column: number): string | undefined {
  if (cell.style?.backcolor) return cell.style.backcolor;
  const theme = props.element.theme;
  if (!theme) return undefined;
  const lastRow = props.element.data.length - 1;
  const lastColumn = (props.element.data[0]?.length ?? 1) - 1;
  if ((theme.rowHeader && row === 0) || (theme.rowFooter && row === lastRow)) return theme.color;
  if ((theme.colHeader && column === 0) || (theme.colFooter && column === lastColumn)) {
    return alphaColor(theme.color, 0.3);
  }
  const effectiveRow = theme.rowHeader ? row - 1 : row;
  return effectiveRow >= 0 && effectiveRow % 2 === 0 ? alphaColor(theme.color, 0.1) : undefined;
}

function cellStyle(cell: TableCell, row: number, column: number): CSSProperties {
  const borders = cell.borders;
  const hasCellBorders = !!(borders?.top || borders?.bottom || borders?.left || borders?.right);
  const theme = props.element.theme;
  const isRowHeader = theme?.rowHeader && row === 0;
  const isRowFooter = theme?.rowFooter && row === props.element.data.length - 1;
  return {
    ...textStyle(cell.style),
    color: cell.style?.color ?? (isRowHeader || isRowFooter ? '#ffffff' : undefined),
    backgroundColor: cellBackground(cell, row, column),
    border: hasCellBorders ? undefined : (outlineToCss(props.element.outline) ?? 'none'),
    borderTop: hasCellBorders ? (borderCss(borders?.top) ?? 'none') : undefined,
    borderBottom: hasCellBorders ? (borderCss(borders?.bottom) ?? 'none') : undefined,
    borderLeft: hasCellBorders ? (borderCss(borders?.left) ?? 'none') : undefined,
    borderRight: hasCellBorders ? (borderCss(borders?.right) ?? 'none') : undefined,
  };
}

const columnStyles = computed(() =>
  props.element.colWidths.map((width) => ({ width: `${width * props.element.width}px` })),
);
</script>

<template>
  <div
    class="aiforus-element aiforus-element-table element-content"
    data-aiforus-layout-box
    :data-element-id="element.id"
    data-element-type="table"
    :style="{
      left: `${element.left}px`,
      top: `${element.top}px`,
      width: `${element.width}px`,
      height: `${element.height}px`,
      transform: `rotate(${element.rotate || 0}deg)`,
    }"
  >
    <table class="aiforus-table" data-aiforus-layout-content>
      <colgroup>
        <col v-for="(style, index) in columnStyles" :key="index" :style="style" />
      </colgroup>
      <tbody>
        <tr
          v-for="(row, rowIndex) in element.data"
          :key="rowIndex"
          :style="{ height: `${element.rowHeights?.[rowIndex] ?? element.cellMinHeight}px` }"
        >
          <td
            v-for="(cell, columnIndex) in row"
            :key="cell.id"
            :colspan="cell.colspan > 1 ? cell.colspan : 1"
            :rowspan="cell.rowspan > 1 ? cell.rowspan : 1"
            :style="cellStyle(cell, rowIndex, columnIndex)"
          >
            <div
              class="aiforus-table-cell-text aiforus-rich-text"
              :style="{
                minHeight: `${(element.rowHeights?.[rowIndex] ?? element.cellMinHeight) - 4}px`,
                padding: cell.padding,
                justifyContent:
                  cell.vAlign === 'top'
                    ? 'flex-start'
                    : cell.vAlign === 'bottom'
                      ? 'flex-end'
                      : cell.vAlign === 'middle'
                        ? 'center'
                        : undefined,
              }"
              v-html="cell.text"
            />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
