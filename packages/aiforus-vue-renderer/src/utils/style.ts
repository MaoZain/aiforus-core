import type {
  ImageElementFilterKeys,
  ImageElementFilters,
  PPTElementOutline,
  PPTElementShadow,
  PPTLineElement,
  SlideBackground,
} from '@aiforus/dsl';
import type { CSSProperties } from 'vue';

const FILTER_UNITS: Record<ImageElementFilterKeys, string> = {
  blur: 'px',
  brightness: '%',
  contrast: '%',
  grayscale: '%',
  saturate: '%',
  'hue-rotate': 'deg',
  sepia: '%',
  invert: '%',
  opacity: '%',
};

export function imageFiltersToCss(filters?: ImageElementFilters): string {
  if (!filters) return '';
  return (Object.entries(filters) as Array<[ImageElementFilterKeys, string]>)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .map(([name, value]) => {
      const unit = FILTER_UNITS[name];
      return `${name}(${unit && !value.endsWith(unit) ? `${value}${unit}` : value})`;
    })
    .join(' ');
}

export function shadowToCss(shadow?: PPTElementShadow): string | undefined {
  return shadow ? `${shadow.h}px ${shadow.v}px ${shadow.blur}px ${shadow.color}` : undefined;
}

export function flipToCss(flipH?: boolean, flipV?: boolean): string | undefined {
  if (flipH && flipV) return 'rotateX(180deg) rotateY(180deg)';
  if (flipV) return 'rotateX(180deg)';
  if (flipH) return 'rotateY(180deg)';
  return undefined;
}

export function outlineToCss(outline?: PPTElementOutline): string | undefined {
  if (!outline) return undefined;
  return `${outline.width ?? 1}px ${outline.style ?? 'solid'} ${outline.color ?? '#d14424'}`;
}

export function strokeDashArray(outline?: PPTElementOutline): string {
  const width = outline?.width ?? 0;
  if (outline?.style === 'dashed') {
    return width <= 6 ? `${width * 4.5} ${width * 2}` : `${width * 4} ${width * 1.5}`;
  }
  if (outline?.style === 'dotted') {
    return width <= 6 ? `${width * 1.8} ${width * 1.6}` : `${width * 1.5} ${width * 1.2}`;
  }
  return '0 0';
}

export function backgroundToStyle(background?: SlideBackground): CSSProperties {
  if (!background) return { backgroundColor: '#ffffff' };
  if (background.type === 'solid') return { backgroundColor: background.color ?? '#ffffff' };
  if (background.type === 'image' && background.image?.src) {
    return {
      backgroundImage: `url(${background.image.src})`,
      backgroundPosition: 'center',
      backgroundRepeat: background.image.size === 'repeat' ? 'repeat' : 'no-repeat',
      backgroundSize: background.image.size === 'repeat' ? 'contain' : background.image.size,
    };
  }
  if (background.type === 'gradient' && background.gradient) {
    const stops = background.gradient.colors.map(({ color, pos }) => `${color} ${pos}%`).join(',');
    return {
      backgroundImage:
        background.gradient.type === 'radial'
          ? `radial-gradient(${stops})`
          : `linear-gradient(${background.gradient.rotate}deg, ${stops})`,
    };
  }
  return { backgroundColor: '#ffffff' };
}

export function getLinePath(element: PPTLineElement): string {
  const start = element.start.join(',');
  const end = element.end.join(',');
  if (element.broken) return `M${start} L${element.broken.join(',')} L${end}`;
  if (element.broken2) {
    const [x, y] = element.broken2;
    return Math.abs(element.end[0] - element.start[0]) >=
      Math.abs(element.end[1] - element.start[1])
      ? `M${start} L${x},${element.start[1]} L${x},${element.end[1]} L${end}`
      : `M${start} L${element.start[0]},${y} L${element.end[0]},${y} L${end}`;
  }
  if (element.curve) return `M${start} Q${element.curve.join(',')} ${end}`;
  if (element.cubic) {
    return `M${start} C${element.cubic[0].join(',')} ${element.cubic[1].join(',')} ${end}`;
  }
  return `M${start} L${end}`;
}

export function lineDashArray(element: PPTLineElement): string {
  const width = element.width;
  if (element.style === 'dashed') {
    return width <= 8 ? `${width * 5} ${width * 2.5}` : `${width * 5} ${width * 1.5}`;
  }
  if (element.style === 'dotted') {
    return width <= 8 ? `${width * 1.8} ${width * 1.6}` : `${width * 1.5} ${width * 1.2}`;
  }
  return '0 0';
}
