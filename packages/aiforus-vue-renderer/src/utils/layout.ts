import type { LayoutDiagnostic } from '../types.js';

const EPSILON = 1;

export function inspectSlideLayout(root: HTMLElement): LayoutDiagnostic[] {
  const diagnostics: LayoutDiagnostic[] = [];
  const boxes = root.querySelectorAll<HTMLElement>('[data-aiforus-layout-box][data-element-id]');

  for (const box of boxes) {
    const content = box.querySelector<HTMLElement>('[data-aiforus-layout-content]');
    if (!content) continue;
    const elementId = box.dataset.elementId;
    if (!elementId) continue;
    const elementType = box.dataset.elementType;
    const appliedScale = Number(box.dataset.autoFitScale ?? 1);
    const effectiveScale = Number.isFinite(appliedScale) && appliedScale > 0 ? appliedScale : 1;
    const overflowX = Math.max(0, content.scrollWidth * effectiveScale - box.clientWidth);
    const overflowY = Math.max(0, content.scrollHeight * effectiveScale - box.clientHeight);
    if (overflowX <= EPSILON && overflowY <= EPSILON) continue;

    diagnostics.push({
      kind: 'text-overflow',
      severity: 'warning',
      elementId,
      ...(elementType
        ? { elementType: elementType as NonNullable<LayoutDiagnostic['elementType']> }
        : {}),
      message: `Text exceeds its layout box by ${Math.ceil(overflowX)}px × ${Math.ceil(overflowY)}px.`,
      overflowX,
      overflowY,
      appliedScale: effectiveScale,
    });
  }

  return diagnostics;
}
