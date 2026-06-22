export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
} as const;

export type Breakpoint = keyof typeof BREAKPOINTS;

const DEFAULT_WIDTH = 1280;
const DEFAULT_HEIGHT = 800;

export function setViewport(width: number, height: number): void {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  });
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: height,
  });
  window.dispatchEvent(new Event('resize'));
}

export function resetViewport(): void {
  setViewport(DEFAULT_WIDTH, DEFAULT_HEIGHT);
}

export function isVisible(el: Element | null): boolean {
  if (!el) return false;
  const htmlEl = el as HTMLElement;
  return htmlEl.offsetParent !== null
    && htmlEl.offsetWidth > 0
    && htmlEl.offsetHeight > 0;
}

export function isHidden(el: Element | null): boolean {
  return !isVisible(el);
}

export function setMobileViewport(): void {
  setViewport(375, 667);
}

export function setTabletViewport(): void {
  setViewport(768, 1024);
}

export function setDesktopViewport(): void {
  setViewport(DEFAULT_WIDTH, DEFAULT_HEIGHT);
}
