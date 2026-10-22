import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  type PressableProps,
  type StyleProp,
  StyleSheet,
  Text,
  type TextProps,
  type TextStyle,
  View,
  type ViewStyle,
} from 'react-native';
import Svg, { Path, Polygon, Rect } from 'react-native-svg';
import { colors, fonts, radius, space } from './theme';

// ------------------------------------------------------------------ chữ

type Variant = 'h1' | 'h2' | 'h3' | 'body' | 'small' | 'caption' | 'label';

const TEXT_STYLES: Record<Variant, TextStyle> = {
  h1: { fontFamily: fonts.black, fontSize: 30, lineHeight: 36, color: colors.primary },
  h2: { fontFamily: fonts.bold, fontSize: 22, lineHeight: 28, color: colors.text },
  h3: { fontFamily: fonts.bold, fontSize: 17, lineHeight: 22, color: colors.text },
  body: { fontFamily: fonts.regular, fontSize: 16, lineHeight: 23, color: colors.text },
  small: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 20, color: colors.muted },
  caption: { fontFamily: fonts.medium, fontSize: 12, lineHeight: 16, color: colors.muted },
  label: {
    fontFamily: fonts.bold,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: colors.muted,
  },
};

export function T({ variant = 'body', style, ...rest }: TextProps & { variant?: Variant }) {
  return <Text {...rest} style={[TEXT_STYLES[variant], style]} />;
}

// ---------------------------------------------------------------- nút bấm

type ButtonTone = 'primary' | 'accent' | 'ghost' | 'light' | 'danger' | 'success';

const TONES: Record<ButtonTone, { bg: string; fg: string; border?: string }> = {
  primary: { bg: colors.primary, fg: colors.onPrimary },
  accent: { bg: colors.orange, fg: colors.white },
  success: { bg: colors.green, fg: colors.white },
  danger: { bg: colors.red, fg: colors.white },
  light: { bg: colors.primaryLight, fg: colors.primary },
  ghost: { bg: 'transparent', fg: colors.primary, border: colors.border },
};

export interface ButtonProps extends Omit<PressableProps, 'style' | 'children'> {
  title: string;
  tone?: ButtonTone;
  size?: 'sm' | 'md' | 'lg';
  icon?: ReactNode;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function Button({ title, tone = 'primary', size = 'md', icon, loading, disabled, style, ...rest }: ButtonProps) {
  const t = TONES[tone];
  const pad = size === 'lg' ? 16 : size === 'sm' ? 8 : 12;
  const fs = size === 'lg' ? 18 : size === 'sm' ? 14 : 16;
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      {...rest}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: t.bg,
          paddingVertical: pad,
          paddingHorizontal: pad * 1.6,
          borderColor: t.border ?? t.bg,
          opacity: disabled ? 0.45 : pressed ? 0.85 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
        style,
      ]}
    >
      {loading ? <ActivityIndicator color={t.fg} /> : icon}
      <Text style={{ color: t.fg, fontFamily: fonts.bold, fontSize: fs }}>{title}</Text>
    </Pressable>
  );
}

// ------------------------------------------------------------------ thẻ

export function Card({ children, style, onPress, testID }: { children: ReactNode; style?: StyleProp<ViewStyle>; onPress?: () => void; testID?: string }) {
  if (onPress) {
    return (
      <Pressable
        testID={testID}
        accessibilityRole="button"
        onPress={onPress}
        style={({ pressed }) => [styles.card, pressed && { opacity: 0.9, transform: [{ scale: 0.99 }] }, style]}
      >
        {children}
      </Pressable>
    );
  }
  return (
    <View testID={testID} style={[styles.card, style]}>
      {children}
    </View>
  );
}

export function Pill({ text, color = colors.primary, bg = colors.primaryLight }: { text: string; color?: string; bg?: string }) {
  return (
    <View style={[styles.pill, { backgroundColor: bg }]}>
      <Text style={{ color, fontFamily: fonts.bold, fontSize: 12 }}>{text}</Text>
    </View>
  );
}

// ------------------------------------------------------------------- sao

export function StarIcon({ size = 18, filled = true }: { size?: number; filled?: boolean }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Polygon
        points="12,2 14.9,8.6 22,9.3 16.6,14 18.2,21 12,17.3 5.8,21 7.4,14 2,9.3 9.1,8.6"
        fill={filled ? colors.gold : '#E3E6F0'}
        stroke={filled ? colors.orange : '#C9CEDF'}
        strokeWidth={1.4}
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function Stars({ value, max = 3, size = 18 }: { value: number; max?: number; size?: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: 2 }} accessibilityLabel={`${value}/${max} sao`}>
      {Array.from({ length: max }, (_, i) => (
        <StarIcon key={i} size={size} filled={i < value} />
      ))}
    </View>
  );
}

export function ProgressBar({ value, color = colors.green, height = 8 }: { value: number; color?: string; height?: number }) {
  return (
    <View style={{ height, borderRadius: height, backgroundColor: colors.border, overflow: 'hidden' }}>
      <View style={{ width: `${Math.round(Math.min(1, Math.max(0, value)) * 100)}%`, height, backgroundColor: color, borderRadius: height }} />
    </View>
  );
}

// ----------------------------------------------------------------- logo

/** Biểu tượng Dương Sinh giản lược: ô cờ + vương miện, dùng màu thương hiệu. */
export function LogoMark({ size = 40 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      <Rect x={0} y={0} width={48} height={48} rx={10} fill={colors.primary} />
      <Rect x={8} y={24} width={8} height={8} fill="#FFFFFF" opacity={0.9} />
      <Rect x={24} y={24} width={8} height={8} fill="#FFFFFF" opacity={0.9} />
      <Rect x={16} y={32} width={8} height={8} fill="#FFFFFF" opacity={0.9} />
      <Rect x={32} y={32} width={8} height={8} fill="#FFFFFF" opacity={0.9} />
      <Path d="M10 20 L14 9 L20 15 L24 7 L28 15 L34 9 L38 20 Z" fill={colors.gold} />
    </Svg>
  );
}

export function Logo({ size = 40, slogan = true }: { size?: number; slogan?: boolean }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      <LogoMark size={size} />
      <View>
        <Text style={{ fontFamily: fonts.black, fontSize: size * 0.45, color: colors.primary, letterSpacing: 0.5 }}>
          DƯƠNG SINH
        </Text>
        {slogan && (
          <Text style={{ fontFamily: fonts.medium, fontSize: size * 0.28, color: colors.orange, letterSpacing: 1 }}>
            VUI TRÍ TUỆ
          </Text>
        )}
      </View>
    </View>
  );
}

/** Họa tiết ô cờ mờ làm nền trang trí. */
export function CheckerPattern({ width, height, cell = 18, opacity = 0.06 }: { width: number; height: number; cell?: number; opacity?: number }) {
  const cols = Math.ceil(width / cell);
  const rows = Math.ceil(height / cell);
  const rects: ReactNode[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if ((r + c) % 2 === 0) rects.push(<Rect key={`${r}-${c}`} x={c * cell} y={r * cell} width={cell} height={cell} fill={colors.primary} />);
    }
  }
  return (
    <Svg width={width} height={height} style={StyleSheet.absoluteFill} pointerEvents="none" opacity={opacity}>
      {rects}
    </Svg>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.sm,
    borderRadius: radius.lg,
    borderWidth: 1.5,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    padding: space.md,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#1B2466',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
    alignSelf: 'flex-start',
  },
});
