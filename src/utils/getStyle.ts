export function getStyle(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}
