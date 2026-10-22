import { useWindowDimensions } from 'react-native';

/** Kích thước bàn cờ vừa màn hình (chừa chỗ cho thanh công cụ). */
export function useBoardSize(opts: { max?: number; reserve?: number } = {}): number {
  const { width, height } = useWindowDimensions();
  const max = opts.max ?? 560;
  const wide = width >= 900;
  const byWidth = wide ? width * 0.55 : width - 24;
  const byHeight = height - (opts.reserve ?? (wide ? 140 : 300));
  return Math.floor(Math.max(240, Math.min(max, byWidth, byHeight)) / 8) * 8;
}

export function useIsWide(): boolean {
  return useWindowDimensions().width >= 900;
}
