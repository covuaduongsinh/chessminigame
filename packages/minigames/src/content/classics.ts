import type { ClassicGame } from '../types';

/** Ván cờ kinh điển: nước đi là dữ kiện lịch sử công khai, lời bình do Dương Sinh biên soạn. */
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
    id: 'knight-mate-trap',
    title: { vi: 'Bẫy Mã chiếu hết', en: 'The Knight Mate Trap' },
    white: 'Trắng',
    black: 'Đen',
    event: 'Bài học',
    year: 0,
    pgn: '1. e4 e5 2. Nf3 Nc6 3. Bc4 Nd4 4. Nxe5 Qg5 5. Nxf7 Qxg2 6. Rf1 Qxe4+ 7. Be2 Nf3# 0-1',
    intro: {
      vi: 'Trắng thấy hai Tốt "biếu không" ở e5 và f7 nên ăn liền, không để ý Đen đang giăng bẫy. Kết thúc là Mã đen chiếu hết ngạt! Bài học: quân "biếu không" đôi khi là mồi nhử, hãy luôn hỏi xem đối phương định làm gì.',
      en: 'White sees two "free" pawns on e5 and f7 and grabs them without noticing the trap. It ends with a black knight delivering smothered mate! Lesson: a "free" piece can be bait — always ask what your opponent is planning.',
    },
    notes: {
      6: {
        vi: 'Mã đen nhảy vào d4 như mời Trắng ăn Tốt e5.',
        en: 'The black knight hops to d4, inviting White to take the e5 pawn.',
      },
      7: {
        vi: 'Trắng tham ăn Tốt e5 — bẫy đã sẵn sàng!',
        en: 'White grabs the e5 pawn — the trap is set!',
      },
      8: {
        vi: 'Hậu đen nhắm cùng lúc vào Mã e5 và Tốt g2.',
        en: 'The queen eyes the e5 knight and the g2 pawn at once.',
      },
      9: {
        vi: 'Trắng ăn thêm Tốt f7, dọa Hậu và Xe, nhưng quên mất Vua nhà.',
        en: 'White grabs f7, hitting queen and rook, but forgets about his own king.',
      },
      10: {
        vi: 'Hậu đen ăn g2, nhắm Xe h1 và đường chéo tới Vua trắng.',
        en: 'The queen takes g2, hitting the h1 rook and the diagonal to the white king.',
      },
      12: {
        vi: 'Hậu chiếu từ e4. Trắng chặn bằng Tượng e2.',
        en: 'The queen checks from e4. White blocks with the bishop on e2.',
      },
      14: {
        vi: 'Mã f3 chiếu hết! Vua trắng bị chính quân nhà vây kín.',
        en: 'Knight f3 is checkmate! The white king is boxed in by his own pieces.',
      },
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
    id: 'rubinstein-1907',
    title: { vi: 'Kiệt tác của Rubinstein', en: "Rubinstein's Masterpiece" },
    white: 'Georg Rotlewi',
    black: 'Akiba Rubinstein',
    event: 'Łódź',
    year: 1907,
    pgn: `1. d4 d5 2. Nf3 e6 3. e3 c5 4. c4 Nc6 5. Nc3 Nf6 6. dxc5 Bxc5 7. a3 a6
8. b4 Bd6 9. Bb2 O-O 10. Qd2 Qe7 11. Bd3 dxc4 12. Bxc4 b5 13. Bd3 Rd8 14. Qe2 Bb7
15. O-O Ne5 16. Nxe5 Bxe5 17. f4 Bc7 18. e4 Rac8 19. e5 Bb6+ 20. Kh1 Ng4 21. Be4 Qh4
22. g3 Rxc3 23. gxh4 Rd2 24. Qxd2 Bxe4+ 25. Qg2 Rh3 0-1`,
    intro: {
      vi: 'Cầm quân Đen, Rubinstein bỏ cả Hậu rồi một Xe để kéo Hậu trắng vào bẫy và thắng gọn gàng. Nhiều người xem đây là một trong những ván thí quân đẹp nhất mọi thời. Bài học: khi quân mình đã hoạt động tốt, đừng sợ nhường quân để mở đường tấn công.',
      en: 'Playing Black, Rubinstein gave up his queen and then a rook to drag the white queen into a trap, winning in style. Many call it one of the most beautiful sacrificial games ever. Lesson: when your pieces are active, do not fear giving up material to open the attack.',
    },
    notes: {
      22: {
        vi: 'Đen ăn Tốt c4, mở đường cho Tượng và Xe cùng hoạt động.',
        en: 'Black takes the c4 pawn, freeing his bishop and rook.',
      },
      30: {
        vi: 'Mã đen nhảy vào giữa bàn cờ, chuẩn bị nhắm sang cánh Vua trắng.',
        en: "The black knight jumps into the centre, eyeing the white king's side.",
      },
      38: {
        vi: 'Tượng đen chiếu Vua, đẩy Vua trắng vào góc h1.',
        en: 'The black bishop checks, pushing the white king into the h1 corner.',
      },
      42: {
        vi: 'Hậu đen lên h4: đe dọa Qxh2 chiếu hết.',
        en: 'The queen jumps to h4, threatening Qxh2 checkmate.',
      },
      44: {
        vi: 'Đen không cứu Hậu mà ăn Mã c3 — một nước đi bất ngờ!',
        en: 'Black ignores his attacked queen and captures on c3 — a surprise!',
      },
      46: {
        vi: 'Xe đen nhảy tới d2, nhường thêm quân để kéo Hậu trắng đi.',
        en: 'The rook lands on d2, offering more material to drag the white queen away.',
      },
      48: {
        vi: 'Tượng đen ăn e4 và chiếu Vua. Trắng chặn bằng Hậu ở g2.',
        en: 'The black bishop takes on e4 with check. White blocks with the queen on g2.',
      },
      50: {
        vi: 'Hậu trắng bị ghim và Đen sắp chiếu hết. Trắng xin thua.',
        en: 'The white queen is pinned and mate is near. White resigns.',
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
  {
    id: 'fischer-spassky-1972',
    title: { vi: 'Ván tranh ngôi vô địch', en: 'The Championship Game' },
    white: 'Robert James Fischer',
    black: 'Boris Spassky',
    event: 'Reykjavik',
    year: 1972,
    pgn: `1. c4 e6 2. Nf3 d5 3. d4 Nf6 4. Nc3 Be7 5. Bg5 O-O 6. e3 h6 7. Bh4 b6 8. cxd5 Nxd5
9. Bxe7 Qxe7 10. Nxd5 exd5 11. Rc1 Be6 12. Qa4 c5 13. Qa3 Rc8 14. Bb5 a6 15. dxc5 bxc5
16. O-O Ra7 17. Be2 Nd7 18. Nd4 Qf8 19. Nxe6 fxe6 20. e4 d4 21. f4 Qe7 22. e5 Rb8
23. Bc4 Kh8 24. Qh3 Nf8 25. b3 a5 26. f5 exf5 27. Rxf5 Nh7 28. Rcf1 Qd8 29. Qg3 Re7
30. h4 Rbb7 31. e6 Rbc7 32. Qe5 Qe8 33. a4 Qd8 34. R1f2 Qe8 35. R2f3 Qd8 36. Bd3 Qe8
37. Qe4 Nf6 38. Rxf6 gxf6 39. Rxf6 Kg8 40. Bc4 Kh8 41. Qf4 1-0`,
    intro: {
      vi: 'Ván thứ 6 của trận tranh ngôi vô địch thế giới. Fischer mở màn bằng nước 1.c4 hiếm khi dùng, rồi cải thiện thế trận từng bước cho tới khi mọi quân Trắng cùng nhắm vào Vua đen. Người ta kể rằng ngay cả Spassky cũng vỗ tay khen đối thủ. Bài học: kiên nhẫn đặt quân vào chỗ đẹp, đòn quyết định sẽ tự tìm đến.',
      en: 'Game 6 of the World Championship match. Fischer surprised everyone with the rarely used 1.c4, then improved his position step by step until every white piece aimed at the black king. It is said that even Spassky applauded his opponent. Lesson: place your pieces patiently on good squares and the decisive blow will come.',
    },
    notes: {
      1: {
        vi: 'Fischer bất ngờ mở màn bằng Tốt c4, nước mà ông hiếm khi chơi.',
        en: 'Fischer surprises everyone with 1.c4, a move he rarely played.',
      },
      39: {
        vi: 'Tốt e4 chiếm trung tâm: Trắng bắt đầu giành thêm không gian.',
        en: 'The e4 pawn grabs the centre: White starts to win space.',
      },
      41: {
        vi: 'Tốt f4 tiếp tục tiến, mở rộng thế trận ở cánh Vua.',
        en: "The f-pawn advances, widening White's grip on the kingside.",
      },
      51: {
        vi: 'Tốt f5! Trắng mở đường để Xe vào tấn công.',
        en: 'f5! White opens the lines for the rooks to join the attack.',
      },
      61: {
        vi: 'Tốt e6 xông vào hàng 6, xé toang phòng tuyến của Đen.',
        en: "The e-pawn storms to the sixth rank, tearing apart Black's defence.",
      },
      75: {
        vi: 'Trắng đổi một Xe lấy Mã và Tốt để phá hàng Tốt che chắn quanh Vua đen.',
        en: 'White trades a rook for a knight and a pawn to break the pawn shield around the black king.',
      },
      81: {
        vi: 'Mọi quân Trắng đều nhắm vào Vua đen. Spassky xin thua.',
        en: 'Every white piece aims at the black king. Spassky resigns.',
      },
    },
  },
  {
    id: 'deepblue-1997',
    title: { vi: 'Người đấu với Máy', en: 'Man vs Machine' },
    white: 'Deep Blue',
    black: 'Garry Kasparov',
    event: 'New York',
    year: 1997,
    pgn: `1. e4 c6 2. d4 d5 3. Nc3 dxe4 4. Nxe4 Nd7 5. Ng5 Ngf6 6. Bd3 e6 7. N1f3 h6
8. Nxe6 Qe7 9. O-O fxe6 10. Bg6+ Kd8 11. Bf4 b5 12. a4 Bb7 13. Re1 Nd5 14. Bg3 Kc8
15. axb5 cxb5 16. Qd3 Bc6 17. Bf5 exf5 18. Rxe7 Bxe7 19. c4 1-0`,
    intro: {
      vi: 'Năm 1997, siêu máy tính Deep Blue đấu sáu ván với Garry Kasparov, nhà vô địch thế giới. Ván thứ 6 kết thúc chỉ sau 19 nước khi Kasparov xin thua, và máy thắng chung cuộc 3,5–2,5. Bài học: Vua kẹt giữa bàn cờ rất nguy hiểm, hãy nhập thành sớm.',
      en: 'In 1997 the supercomputer Deep Blue played a six-game match against world champion Garry Kasparov. Game 6 ended after only 19 moves when Kasparov resigned, and the machine won the match 3.5–2.5. Lesson: a king stuck in the middle is in danger — castle early.',
    },
    notes: {
      15: {
        vi: 'Máy thí Mã ở e6 để kéo Vua đen ra giữa bàn cờ.',
        en: 'The machine sacrifices a knight on e6 to drag the black king into the open.',
      },
      19: {
        vi: 'Tượng chiếu Vua: Vua đen từ giờ không thể nhập thành nữa.',
        en: 'The bishop checks, and from now on the black king can no longer castle.',
      },
      20: {
        vi: 'Vua đen đứng giữa bàn cờ, rất xa nơi an toàn.',
        en: 'The black king stands in the middle of the board, far from safety.',
      },
      33: {
        vi: 'Tượng trắng lao vào f5, mở đường để Xe ăn Hậu đen.',
        en: 'The white bishop dives into f5, opening the way for the rook to take the queen.',
      },
      35: {
        vi: 'Xe ăn Hậu: Trắng đổi một Xe lấy Hậu và giữ thế tấn công mạnh.',
        en: 'The rook takes the queen: White trades a rook for the queen and keeps a strong attack.',
      },
      37: {
        vi: 'Vua đen vẫn kẹt giữa bàn cờ và quân Trắng đe dọa dồn dập. Kasparov xin thua.',
        en: 'The black king is still stuck in the centre and White keeps up the threats. Kasparov resigns.',
      },
    },
  },
  {
    id: 'kasparov-1999',
    title: { vi: 'Săn Vua xuyên bàn cờ', en: 'The Great King Hunt' },
    white: 'Garry Kasparov',
    black: 'Veselin Topalov',
    event: 'Wijk aan Zee',
    year: 1999,
    pgn: `1. e4 d6 2. d4 Nf6 3. Nc3 g6 4. Be3 Bg7 5. Qd2 c6 6. f3 b5 7. Nge2 Nbd7
8. Bh6 Bxh6 9. Qxh6 Bb7 10. a3 e5 11. O-O-O Qe7 12. Kb1 a6 13. Nc1 O-O-O 14. Nb3 exd4
15. Rxd4 c5 16. Rd1 Nb6 17. g3 Kb8 18. Na5 Ba8 19. Bh3 d5 20. Qf4+ Ka7 21. Rhe1 d4
22. Nd5 Nbxd5 23. exd5 Qd6 24. Rxd4 cxd4 25. Re7+ Kb6 26. Qxd4+ Kxa5 27. b4+ Ka4
28. Qc3 Qxd5 29. Ra7 Bb7 30. Rxb7 Qc4 31. Qxf6 Kxa3 32. Qxa6+ Kxb4 33. c3+ Kxc3
34. Qa1+ Kd2 35. Qb2+ Kd1 36. Bf1 Rd2 37. Rd7 Rxd7 38. Bxc4 bxc4 39. Qxh8 Rd3
40. Qa8 c3 41. Qa4+ Ke1 42. f4 f5 43. Kc1 Rd2 44. Qa7 1-0`,
    intro: {
      vi: 'Kasparov thí Xe hai lần rồi đuổi Vua đen từ góc a7 xuống tận hàng 1. Nhiều người xem đây là ván hay nhất của ông. Bài học: khi Vua đối phương bị hở, hãy kiên trì đưa quân vào tấn công và tính thật kỹ từng nước chiếu.',
      en: 'Kasparov sacrifices a rook twice and chases the black king from a7 all the way down to the first rank. Many call it his finest game. Lesson: when the enemy king is exposed, keep bringing pieces to the attack and calculate every check carefully.',
    },
    notes: {
      15: {
        vi: 'Trắng đổi Tượng ô đen để làm yếu ngôi nhà của Vua đen.',
        en: "White trades off the dark-squared bishop to weaken the black king's home.",
      },
      39: {
        vi: 'Hậu chiếu Vua: Vua đen bị đẩy về góc a7.',
        en: 'The queen checks, and the black king is pushed to the a7 corner.',
      },
      47: {
        vi: 'Thí Xe! Trắng đổi Xe lấy Tốt để mở đường cho quân còn lại.',
        en: 'Rook sacrifice! White gives a rook to open lines for the other pieces.',
      },
      49: {
        vi: 'Lại thí thêm một Xe nữa: Xe e7 chiếu Vua.',
        en: 'Another rook goes forward: the e7 rook checks the king.',
      },
      71: {
        vi: 'Một nước đi lặng lẽ tuyệt đẹp: Tượng f1 cắt đường thoát của Vua đen.',
        en: "A beautiful quiet move: the f1 bishop cuts off the black king's escape.",
      },
      87: {
        vi: 'Hậu vào a7 và Đen xin thua sau cuộc săn Vua dài xuyên bàn cờ.',
        en: 'The queen lands on a7 and Black resigns after the long king hunt across the board.',
      },
    },
  },
];
