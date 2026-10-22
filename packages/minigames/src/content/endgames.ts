import type { Endgame } from '../types';

/** 12 thế tàn cuộc cơ bản, xếp từ dễ đến khó. */
export const ENDGAMES: Endgame[] = [
  {
    id: 'eg-xe-bien',
    title: { vi: 'Xe chiếu hết ở mép', en: 'Rook Mate on the Edge' },
    description: {
      vi: 'Vua đen đã ở mép bàn, Vua trắng đứng đối diện. Một nước Xe là xong!',
      en: 'The black king is on the edge facing your king. One rook move finishes it!',
    },
    difficulty: 1,
    round: { mode: 'mate', fen: '4k3/8/4K3/8/8/8/8/7R w - - 0 1', engineLevel: 6, moveLimit: 3 },
  },
  {
    id: 'eg-hau-goc',
    title: { vi: 'Hậu ở góc — coi chừng hòa', en: 'Queen in the Corner — Beware Stalemate' },
    description: {
      vi: 'Vua đen bị kẹt ở góc. Chiếu hết nhanh nhưng đừng để Vua đen hết nước!',
      en: "The black king is cornered. Mate quickly — but don't stalemate it!",
    },
    difficulty: 1,
    round: { mode: 'mate', fen: 'k7/8/2K5/8/8/8/8/7Q w - - 0 1', engineLevel: 6, moveLimit: 6 },
  },
  {
    id: 'eg-hai-hau',
    title: { vi: 'Hai Hậu chiếu hết', en: 'Two Queens Mate' },
    description: {
      vi: 'Hai Hậu thay nhau cắt hàng như bậc thang.',
      en: 'Two queens take turns cutting ranks like a ladder.',
    },
    difficulty: 1,
    round: { mode: 'mate', fen: '8/8/8/4k3/8/8/8/2QQK3 w - - 0 1', engineLevel: 6, moveLimit: 10 },
  },
  {
    id: 'eg-hai-xe',
    title: { vi: 'Hai Xe "leo thang"', en: 'Two-Rook Ladder' },
    description: {
      vi: 'Hai Xe luân phiên chiếu, đẩy Vua đen lên từng hàng một.',
      en: 'The rooks check in turn, pushing the king one rank at a time.',
    },
    difficulty: 1,
    round: { mode: 'mate', fen: '8/8/8/4k3/8/8/8/R3K2R w - - 0 1', engineLevel: 6, moveLimit: 15 },
  },
  {
    id: 'eg-hau-xe',
    title: { vi: 'Hậu và Xe chiếu hết', en: 'Queen & Rook Mate' },
    description: {
      vi: 'Hậu và Xe phối hợp như hai bậc thang.',
      en: 'Queen and rook team up like a ladder.',
    },
    difficulty: 1,
    round: { mode: 'mate', fen: '8/8/8/4k3/8/8/8/R2QK3 w - - 0 1', engineLevel: 6, moveLimit: 12 },
  },
  {
    id: 'eg-hau-vua',
    title: { vi: 'Hậu và Vua chiếu hết', en: 'Queen & King Mate' },
    description: {
      vi: 'Bài tàn cuộc quan trọng nhất: thu hẹp "chiếc hộp" rồi đưa Vua lên.',
      en: 'The most important ending: shrink the box, then bring your king.',
    },
    difficulty: 2,
    round: { mode: 'mate', fen: '8/8/8/4k3/8/8/8/3QK3 w - - 0 1', engineLevel: 6, moveLimit: 20 },
  },
  {
    id: 'eg-xe-goc',
    title: { vi: 'Xe và Vua: dồn vào góc', en: 'Rook & King: Into the Corner' },
    description: {
      vi: 'Vua đen gần góc. Cắt hàng bằng Xe rồi đưa Vua lên.',
      en: 'The black king is near the corner. Cut it off, then bring your king.',
    },
    difficulty: 2,
    round: { mode: 'mate', fen: '1k6/8/2K5/8/8/8/8/7R w - - 0 1', engineLevel: 6, moveLimit: 10 },
  },
  {
    id: 'eg-xe-vua',
    title: { vi: 'Xe và Vua chiếu hết', en: 'Rook & King Mate' },
    description: {
      vi: 'Tàn cuộc kinh điển: Xe cắt đường, Vua tiến lên giành thế đối Vua.',
      en: 'The classic: the rook cuts off, the king takes the opposition.',
    },
    difficulty: 3,
    round: { mode: 'mate', fen: '8/8/8/4k3/8/8/8/4K2R w - - 0 1', engineLevel: 6, moveLimit: 35 },
  },
  {
    id: 'eg-hinh-vuong',
    title: { vi: 'Quy tắc hình vuông', en: 'The Rule of the Square' },
    description: {
      vi: 'Vẽ một hình vuông từ Tốt tới hàng phong cấp: Vua đen ở ngoài hình vuông thì không đuổi kịp!',
      en: "Draw a square from the pawn to the queening rank: if the king is outside, it can't catch up!",
    },
    difficulty: 1,
    round: { mode: 'race', fen: '8/8/8/1P3k2/8/8/8/7K w - - 0 1', engineLevel: 6 },
  },
  {
    id: 'eg-vua-tot',
    title: { vi: 'Vua trước Tốt', en: 'King in Front of the Pawn' },
    description: {
      vi: 'Vua ở hàng 6 trước Tốt: thắng chắc nếu biết giành thế đối Vua.',
      en: 'King on the 6th rank in front of the pawn: a sure win with the opposition.',
    },
    difficulty: 2,
    round: { mode: 'race', fen: '3k4/8/3K4/3P4/8/8/8/8 w - - 0 1', engineLevel: 6 },
  },
  {
    id: 'eg-o-then-chot',
    title: { vi: 'Ô then chốt', en: 'Key Squares' },
    description: {
      vi: 'Vua trắng đã đứng ở ô then chốt (hai hàng trước Tốt): giữ vững và đưa Tốt lên.',
      en: 'Your king already stands on a key square two ranks ahead of the pawn: keep it and push.',
    },
    difficulty: 2,
    round: { mode: 'race', fen: '2k5/8/2K5/8/2P5/8/8/8 w - - 0 1', engineLevel: 6 },
  },
  {
    id: 'eg-dot-pha',
    title: { vi: 'Đột phá Tốt', en: 'Pawn Breakthrough' },
    description: {
      vi: 'Ba Tốt chống ba Tốt. Có một nước thí Tốt bất ngờ giúp phong cấp!',
      en: 'Three pawns against three. A surprising pawn sacrifice breaks through!',
    },
    difficulty: 3,
    round: { mode: 'race', fen: '8/ppp5/8/PPP5/8/8/8/8 w - - 0 1', engineLevel: 6 },
  },
];
