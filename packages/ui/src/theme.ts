/** Hệ nhận diện Dương Sinh: navy #2B3990 chủ đạo, vàng/cam làm điểm nhấn, font Roboto. */
export const colors = {
  primary: '#2B3990',
  primaryDark: '#1B2466',
  primaryLight: '#E8EBF7',
  blue: '#2275B4',
  teal: '#3DBB95',
  green: '#2DA44A',
  orange: '#F7941D',
  gold: '#FBB040',
  goldLight: '#FFF4DE',
  red: '#E5484D',
  bg: '#F8F9FC',
  white: '#FFFFFF',
  text: '#1A1A2E',
  muted: '#6B7280',
  border: '#E3E6F0',
  onPrimary: '#FFFFFF',
} as const;

export const space = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 } as const;
export const radius = { sm: 4, md: 8, lg: 12, xl: 20, pill: 999 } as const;

export const fonts = {
  regular: 'Roboto_400Regular',
  medium: 'Roboto_500Medium',
  bold: 'Roboto_700Bold',
  black: 'Roboto_900Black',
} as const;

export interface BoardTheme {
  id: string;
  name: { vi: string; en: string };
  light: string;
  dark: string;
  lastMove: string;
  selected: string;
  coordLight: string;
  coordDark: string;
}

export const BOARD_THEMES: BoardTheme[] = [
  {
    id: 'duongsinh',
    name: { vi: 'Dương Sinh', en: 'Duong Sinh' },
    light: '#EEF1FA',
    dark: '#7584C9',
    lastMove: 'rgba(251,176,64,0.55)',
    selected: 'rgba(247,148,29,0.65)',
    coordLight: '#5B6BC0',
    coordDark: '#EEF1FA',
  },
  {
    id: 'go',
    name: { vi: 'Gỗ', en: 'Wood' },
    light: '#F0D9B5',
    dark: '#B58863',
    lastMove: 'rgba(205,210,106,0.75)',
    selected: 'rgba(130,151,105,0.8)',
    coordLight: '#B58863',
    coordDark: '#F0D9B5',
  },
  {
    id: 'la',
    name: { vi: 'Lá xanh', en: 'Leaf' },
    light: '#EEEED2',
    dark: '#769656',
    lastMove: 'rgba(246,246,105,0.7)',
    selected: 'rgba(186,202,68,0.85)',
    coordLight: '#769656',
    coordDark: '#EEEED2',
  },
];

export function boardTheme(id: string | undefined): BoardTheme {
  return BOARD_THEMES.find((t) => t.id === id) ?? BOARD_THEMES[0]!;
}

/** Màu theo cấp lộ trình. */
export const LEVEL_COLORS: Record<string, string> = {
  tot: colors.teal,
  ma: colors.blue,
  tuong: colors.green,
  xe: colors.gold,
  hau: colors.orange,
  vua: colors.primary,
};
