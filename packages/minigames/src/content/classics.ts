import type { ClassicGame } from '../types';

/** Ván cờ kinh điển (thuộc phạm vi công cộng), lời bình do Dương Sinh biên soạn. */
export const CLASSICS: ClassicGame[] = [
  {
    id: 'fool-mate',
    title: { vi: 'Chiếu hết nhanh nhất', en: "Fool's Mate" },
    white: 'Trắng',
    black: 'Đen',
    event: 'Bài học',
    year: 0,
    pgn: '1. f3 e5 2. g4 Qh4# 0-1',
    intro: {
      vi: 'Ván cờ ngắn nhất có thể: chỉ 2 nước! Bài học: đừng mở toang đường chéo trước Vua.',
      en: 'The shortest possible game: two moves! Lesson: never open the diagonal in front of your king.',
    },
    notes: {
      1: {
        vi: 'Nước yếu: Tốt f3 làm hở đường chéo e1–h4.',
        en: 'Weak: f3 opens the e1–h4 diagonal.',
      },
      3: { vi: 'Lại thêm một nước yếu nữa.', en: 'Another weakening move.' },
      4: { vi: 'Hậu đen chiếu hết!', en: 'The black queen mates!' },
    },
  },
  {
    id: 'scholar-mate',
    title: { vi: 'Chiếu hết 4 nước', en: "Scholar's Mate" },
    white: 'Trắng',
    black: 'Đen',
    event: 'Bài học',
    year: 0,
    pgn: '1. e4 e5 2. Bc4 Nc6 3. Qh5 Nf6 4. Qxf7# 1-0',
    intro: {
      vi: 'Bẫy kinh điển nhắm vào ô f7 — ô yếu nhất của Đen lúc đầu ván, chỉ có Vua bảo vệ.',
      en: "The classic trap aimed at f7 — Black's weakest square, defended only by the king.",
    },
    notes: {
      5: { vi: 'Hậu và Tượng cùng nhắm vào f7.', en: 'Queen and bishop both aim at f7.' },
      6: {
        vi: 'Sai lầm! Đen cần đi g6 hoặc Qe7 để bảo vệ.',
        en: 'Mistake! Black needed g6 or Qe7.',
      },
      7: {
        vi: 'Chiếu hết. Cách phòng thủ: luôn để ý ô f7!',
        en: 'Mate. Defence: always watch f7!',
      },
    },
  },
  {
    id: 'legal-1750',
    title: { vi: 'Bẫy Légal', en: "Légal's Mate" },
    white: 'Légal de Kermeur',
    black: 'Saint Brie',
    event: 'Paris',
    year: 1750,
    pgn: '1. e4 e5 2. Nf3 d6 3. Bc4 Bg4 4. Nc3 g6 5. Nxe5 Bxd1 6. Bxf7+ Ke7 7. Nd5# 1-0',
    intro: {
      vi: 'Trắng hy sinh cả Hậu để chiếu hết bằng ba quân nhẹ. Bài học: Mã ghim chưa chắc đã bị ghim thật!',
      en: 'White gives up the queen to mate with three minor pieces. A "pinned" knight isn\'t always pinned!',
    },
    notes: {
      6: { vi: 'Đen ghim Mã f3 vào Hậu.', en: 'Black pins the knight to the queen.' },
      9: {
        vi: 'Bất ngờ! Mã bỏ chạy, chấp nhận mất Hậu.',
        en: 'Surprise! The knight jumps away, giving up the queen.',
      },
      10: { vi: 'Đen tham ăn Hậu...', en: 'Black greedily takes the queen...' },
      13: { vi: 'Ba quân nhẹ phối hợp chiếu hết!', en: 'Three minor pieces deliver mate!' },
    },
  },
  {
    id: 'immortal-1851',
    title: { vi: 'Ván cờ Bất tử', en: 'The Immortal Game' },
    white: 'Adolf Anderssen',
    black: 'Lionel Kieseritzky',
    event: 'London',
    year: 1851,
    pgn: `1. e4 e5 2. f4 exf4 3. Bc4 Qh4+ 4. Kf1 b5 5. Bxb5 Nf6 6. Nf3 Qh6 7. d3 Nh5
8. Nh4 Qg5 9. Nf5 c6 10. g4 Nf6 11. Rg1 cxb5 12. h4 Qg6 13. h5 Qg5 14. Qf3 Ng8
15. Bxf4 Qf6 16. Nc3 Bc5 17. Nd5 Qxb2 18. Bd6 Bxg1 19. e5 Qxa1+ 20. Ke2 Na6
21. Nxg7+ Kd8 22. Qf6+ Nxf6 23. Be7# 1-0`,
    intro: {
      vi: 'Anderssen thí cả hai Xe, một Tượng và cả Hậu để chiếu hết. Đây là ván cờ nổi tiếng nhất của thế kỷ 19.',
      en: 'Anderssen sacrificed both rooks, a bishop and his queen to give mate. The most famous game of the 19th century.',
    },
    notes: {
      3: {
        vi: 'Gambit Vua: thí Tốt để mở đường tấn công.',
        en: "King's Gambit: a pawn sacrifice for attack.",
      },
      35: {
        vi: 'Thí Xe lần đầu — để Tượng đen đi xa khỏi Vua.',
        en: 'First rook sacrifice — luring the bishop away.',
      },
      37: {
        vi: 'Bỏ luôn Xe thứ hai! Trắng chỉ cần phát triển quân.',
        en: 'The second rook goes too! White just develops.',
      },
      43: { vi: 'Thí Hậu!', en: 'Queen sacrifice!' },
      45: { vi: 'Chiếu hết bằng ba quân nhẹ.', en: 'Mate with three minor pieces.' },
    },
  },
  {
    id: 'evergreen-1852',
    title: { vi: 'Ván cờ Xanh mãi', en: 'The Evergreen Game' },
    white: 'Adolf Anderssen',
    black: 'Jean Dufresne',
    event: 'Berlin',
    year: 1852,
    pgn: `1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. b4 Bxb4 5. c3 Ba5 6. d4 exd4 7. O-O d3
8. Qb3 Qf6 9. e5 Qg6 10. Re1 Nge7 11. Ba3 b5 12. Qxb5 Rb8 13. Qa4 Bb6 14. Nbd2 Bb7
15. Ne4 Qf5 16. Bxd3 Qh5 17. Nf6+ gxf6 18. exf6 Rg8 19. Rad1 Qxf3 20. Rxe7+ Nxe7
21. Qxd7+ Kxd7 22. Bf5+ Ke8 23. Bd7+ Kf8 24. Bxe7# 1-0`,
    intro: {
      vi: 'Một năm sau Ván cờ Bất tử, Anderssen lại tạo ra một kiệt tác với đòn thí Hậu ở d7.',
      en: 'A year after the Immortal, Anderssen created another masterpiece with a queen sacrifice on d7.',
    },
    notes: {
      7: {
        vi: 'Gambit Evans: thí Tốt b để phát triển nhanh.',
        en: 'Evans Gambit: sacrifice the b-pawn for speed.',
      },
      41: { vi: 'Thí Hậu! Vua đen buộc phải ăn.', en: 'Queen sacrifice! The king must take.' },
      47: { vi: 'Hai Tượng chiếu hết.', en: 'The bishops deliver mate.' },
    },
  },
  {
    id: 'opera-1858',
    title: { vi: 'Ván cờ ở Nhà hát', en: 'The Opera Game' },
    white: 'Paul Morphy',
    black: 'Duke Karl / Count Isouard',
    event: 'Paris',
    year: 1858,
    pgn: `1. e4 e5 2. Nf3 d6 3. d4 Bg4 4. dxe5 Bxf3 5. Qxf3 dxe5 6. Bc4 Nf6 7. Qb3 Qe7
8. Nc3 c6 9. Bg5 b5 10. Nxb5 cxb5 11. Bxb5+ Nbd7 12. O-O-O Rd8 13. Rxd7 Rxd7
14. Rd1 Qe6 15. Bxd7+ Nxd7 16. Qb8+ Nxb8 17. Rd8# 1-0`,
    intro: {
      vi: 'Morphy chơi ván này trong lúc xem opera. Ván cờ là bài học mẫu về phát triển quân nhanh và mở đường tấn công Vua.',
      en: 'Morphy played this during an opera. A model lesson in rapid development and opening lines against the king.',
    },
    notes: {
      11: { vi: 'Phát triển quân và nhắm vào f7.', en: 'Develop and aim at f7.' },
      19: { vi: 'Thí Mã để mở đường cho quân Trắng.', en: 'A knight sacrifice opens lines.' },
      23: {
        vi: 'Nhập thành dài — Xe vào trận ngay lập tức.',
        en: 'Castling long brings the rook straight in.',
      },
      31: { vi: 'Thí Hậu!', en: 'Queen sacrifice!' },
      33: {
        vi: 'Xe chiếu hết. Mọi quân Trắng đều tham gia.',
        en: 'Rook mate. Every white piece took part.',
      },
    },
  },
  {
    id: 'steinitz-1895',
    title: { vi: 'Steinitz – Bardeleben', en: 'Steinitz vs Bardeleben' },
    white: 'Wilhelm Steinitz',
    black: 'Curt von Bardeleben',
    event: 'Hastings',
    year: 1895,
    pgn: `1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. c3 Nf6 5. d4 exd4 6. cxd4 Bb4+ 7. Nc3 d5
8. exd5 Nxd5 9. O-O Be6 10. Bg5 Be7 11. Bxd5 Bxd5 12. Nxd5 Qxd5 13. Bxe7 Nxe7
14. Re1 f6 15. Qe2 Qd7 16. Rac1 c6 17. d5 cxd5 18. Nd4 Kf7 19. Ne6 Rhc8 20. Qg4 g6
21. Ng5+ Ke8 22. Rxe7+ Kf8 23. Rf7+ Kg8 24. Rg7+ Kh8 25. Rxh7+ 1-0`,
    intro: {
      vi: 'Nhà vô địch thế giới đầu tiên Steinitz. Xe trắng chiếu liên tục mà không quân nào ăn được vì Trắng đang bị đe dọa chiếu hết ngược.',
      en: 'The first world champion. The white rook keeps checking and cannot be taken.',
    },
    notes: {
      43: { vi: 'Xe "điên" chiếu liên tục.', en: 'The "desperado" rook keeps checking.' },
      49: {
        vi: 'Bardeleben bỏ cuộc rời khỏi phòng thi đấu.',
        en: 'Bardeleben left the hall rather than resign.',
      },
    },
  },
  {
    id: 'reti-1910',
    title: { vi: 'Réti – Tartakower', en: 'Réti vs Tartakower' },
    white: 'Richard Réti',
    black: 'Savielly Tartakower',
    event: 'Vienna',
    year: 1910,
    pgn: `1. e4 c6 2. d4 d5 3. Nc3 dxe4 4. Nxe4 Nf6 5. Qd3 e5 6. dxe5 Qa5+ 7. Bd2 Qxe5
8. O-O-O Nxe4 9. Qd8+ Kxd8 10. Bg5+ Kc7 11. Bd8# 1-0`,
    intro: {
      vi: 'Chỉ 11 nước! Đen tham ăn Mã, Trắng thí Hậu và chiếu hết bằng hai Tượng và Xe.',
      en: 'Only 11 moves! Black grabs a knight, White sacrifices the queen and mates.',
    },
    notes: {
      15: {
        vi: 'Nhập thành dài, Xe d1 nhắm thẳng Vua đen.',
        en: 'Long castling — the d1 rook eyes the king.',
      },
      17: { vi: 'Thí Hậu!', en: 'Queen sacrifice!' },
      21: { vi: 'Chiếu hết bằng Tượng.', en: 'Mate by the bishop.' },
    },
  },
  {
    id: 'lasker-1912',
    title: { vi: 'Cuộc đi dạo của Vua', en: 'The King Hunt' },
    white: 'Edward Lasker',
    black: 'George Thomas',
    event: 'London',
    year: 1912,
    pgn: `1. d4 e6 2. Nf3 f5 3. Nc3 Nf6 4. Bg5 Be7 5. Bxf6 Bxf6 6. e4 fxe4 7. Nxe4 b6
8. Ne5 O-O 9. Bd3 Bb7 10. Qh5 Qe7 11. Qxh7+ Kxh7 12. Nxf6+ Kh6 13. Neg4+ Kg5
14. h4+ Kf4 15. g3+ Kf3 16. Be2+ Kg2 17. Rh2+ Kg1 18. Kd2# 1-0`,
    intro: {
      vi: 'Sau đòn thí Hậu, Vua đen bị đuổi từ g8 xuống tận g1, rồi bị chiếu hết chỉ bằng một bước đi nhỏ của Vua trắng!',
      en: 'After the queen sacrifice the black king is chased from g8 all the way to g1 — and mated by the white king!',
    },
    notes: {
      21: { vi: 'Thí Hậu, mở màn cuộc săn Vua.', en: 'Queen sacrifice starts the king hunt.' },
      35: { vi: 'Vua trắng đi một bước nhỏ — chiếu hết!', en: 'A small king step — checkmate!' },
    },
  },
  {
    id: 'fischer-1956',
    title: { vi: 'Ván cờ của Thế kỷ', en: 'The Game of the Century' },
    white: 'Donald Byrne',
    black: 'Robert James Fischer',
    event: 'New York',
    year: 1956,
    pgn: `1. Nf3 Nf6 2. c4 g6 3. Nc3 Bg7 4. d4 O-O 5. Bf4 d5 6. Qb3 dxc4 7. Qxc4 c6
8. e4 Nbd7 9. Rd1 Nb6 10. Qc5 Bg4 11. Bg5 Na4 12. Qa3 Nxc3 13. bxc3 Nxe4
14. Bxe7 Qb6 15. Bc4 Nxc3 16. Bc5 Rfe8+ 17. Kf1 Be6 18. Bxb6 Bxc4+ 19. Kg1 Ne2+
20. Kf1 Nxd4+ 21. Kg1 Ne2+ 22. Kf1 Nc3+ 23. Kg1 axb6 24. Qb4 Ra4 25. Qxb6 Nxd1
26. h3 Rxa2 27. Kh2 Nxf2 28. Re1 Rxe1 29. Qd8+ Bf8 30. Nxe1 Bd5 31. Nf3 Ne4
32. Qb8 b5 33. h4 h5 34. Ne5 Kg7 35. Kg1 Bc5+ 36. Kf1 Ng3+ 37. Ke1 Bb4+ 38. Kd1 Bb3+
39. Kc1 Ne2+ 40. Kb1 Nc3+ 41. Kc1 Rc2# 0-1`,
    intro: {
      vi: 'Bobby Fischer mới 13 tuổi đã thí Hậu để đổi lấy một đòn tấn công vũ bão. Một ván cờ truyền cảm hứng cho mọi kỳ thủ nhí!',
      en: 'Thirteen-year-old Bobby Fischer gave up his queen for a crushing attack. An inspiration for every young player!',
    },
    notes: {
      34: {
        vi: 'Nước thí Hậu nổi tiếng nhất lịch sử cờ vua.',
        en: 'The most famous queen sacrifice in chess history.',
      },
      36: {
        vi: '"Cối xay gió": Mã và Tượng chiếu liên tục để ăn quân.',
        en: 'A "windmill" of checks wins material.',
      },
      82: {
        vi: 'Chiếu hết. Quân nhẹ phối hợp hoàn hảo.',
        en: 'Mate. Perfect teamwork by the minor pieces.',
      },
    },
  },
];
