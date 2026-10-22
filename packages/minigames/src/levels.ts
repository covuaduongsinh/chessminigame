import type { LevelInfo } from './types';

/** Lộ trình 6 cấp của Dương Sinh. */
export const LEVELS: readonly LevelInfo[] = [
  {
    key: 'tot',
    index: 1,
    name: { vi: 'Cấp Tốt', en: 'Pawn Level' },
    piece: 'p',
    color: '#3DBB95',
    description: {
      vi: 'Làm quen bàn cờ: tên ô, hàng, cột, đường chéo và chú Tốt dũng cảm.',
      en: 'Meet the board: squares, ranks, files, diagonals and the brave pawn.',
    },
  },
  {
    key: 'ma',
    index: 2,
    name: { vi: 'Cấp Mã', en: 'Knight Level' },
    piece: 'n',
    color: '#2275B4',
    description: {
      vi: 'Chú Mã nhảy hình chữ L — quân duy nhất biết nhảy qua đầu quân khác.',
      en: 'The knight jumps in an L — the only piece that can leap over others.',
    },
  },
  {
    key: 'tuong',
    index: 3,
    name: { vi: 'Cấp Tượng', en: 'Bishop Level' },
    piece: 'b',
    color: '#2DA44A',
    description: {
      vi: 'Tượng đi chéo, mãi mãi ở một màu ô. Học đòn Ghim đầu tiên.',
      en: 'Bishops move diagonally and stay on one colour. Learn the pin.',
    },
  },
  {
    key: 'xe',
    index: 4,
    name: { vi: 'Cấp Xe', en: 'Rook Level' },
    piece: 'r',
    color: '#FBB040',
    description: {
      vi: 'Xe đi thẳng như tàu hỏa. Nhập thành, đòn Xiên và chiếu hết bằng Xe.',
      en: 'Rooks move straight like trains. Castling, skewers and rook mates.',
    },
  },
  {
    key: 'hau',
    index: 5,
    name: { vi: 'Cấp Hậu', en: 'Queen Level' },
    piece: 'q',
    color: '#F7941D',
    description: {
      vi: 'Hậu mạnh nhất bàn cờ. Đòn đôi và chiếu hết bằng Hậu.',
      en: 'The queen is the strongest piece. Forks and queen mates.',
    },
  },
  {
    key: 'vua',
    index: 6,
    name: { vi: 'Cấp Vua', en: 'King Level' },
    piece: 'k',
    color: '#2B3990',
    description: {
      vi: 'Bảo vệ Vua, thoát chiếu, chiếu hết và chơi ván cờ đầy đủ.',
      en: 'Protect the king, escape check, checkmate and play a full game.',
    },
  },
];
