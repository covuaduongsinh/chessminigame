import type { Color, PieceType } from '@duongsinh/chess-core';
import { memo } from 'react';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { PIECE_PALETTE, PIECE_SHAPES } from './pieceShapes';

export interface PieceProps {
  type: PieceType;
  color: Color;
  size: number;
}

/** Một quân cờ vẽ bằng SVG (bộ quân Dương Sinh). */
export const Piece = memo(function Piece({ type, color, size }: PieceProps) {
  const pal = PIECE_PALETTE[color];
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" pointerEvents="none">
      {PIECE_SHAPES[type].map((s, i) => {
        const fill = s.role === 'line' ? 'none' : s.role === 'detail' ? pal.detail : pal.fill;
        const stroke = s.role === 'line' && color === 'b' ? pal.detail : pal.stroke;
        const common = {
          fill,
          stroke,
          strokeWidth: 3.5,
          strokeLinejoin: 'round' as const,
          strokeLinecap: 'round' as const,
        };
        if (s.kind === 'path') return <Path key={i} d={s.d} {...common} />;
        if (s.kind === 'circle') return <Circle key={i} cx={s.cx} cy={s.cy} r={s.r} {...common} />;
        return <Rect key={i} x={s.x} y={s.y} width={s.w} height={s.h} rx={s.rx} {...common} />;
      })}
    </Svg>
  );
});
