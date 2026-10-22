import type { MiniGame } from '../types';

export const HAU: MiniGame[] = [
  {
    id: 'hau-1',
    level: 'hau',
    order: 1,
    title: { vi: 'Hậu ăn sao', en: 'Queen Star Hunt' },
    story: {
      vi: 'Hậu đi được như Xe và như Tượng gộp lại — thẳng hay chéo đều được. Na reo lên: "Hậu là siêu nhân của bàn cờ!"',
      en: 'The queen moves like a rook and a bishop combined — straight or diagonal. Na cheers: "The queen is the superhero of the board!"',
    },
    goal: {
      vi: 'Đưa Hậu ăn hết sao bằng ít nước nhất.',
      en: 'Collect every star in the fewest moves.',
    },
    lesson: { vi: 'Hậu = Xe + Tượng.', en: 'Queen = Rook + Bishop.' },
    rounds: [
      {
        mode: 'collect',
        fen: '8/8/8/8/8/8/8/3Q4 w - - 0 1',
        targets: ['d8', 'h4', 'a4', 'e5', 'b7'],
      },
    ],
    skills: ['queen'],
  },
  {
    id: 'hau-2',
    level: 'hau',
    order: 2,
    title: { vi: 'Hậu đấu 8 Tốt', en: 'Queen vs Eight Pawns' },
    story: {
      vi: 'Một mình Hậu trắng chống lại cả đội 8 chú Tốt đen. Thầy nói đây là bài tập yêu thích của các kiện tướng nhí trên khắp thế giới!',
      en: 'One white queen against all eight black pawns. A favourite exercise of young champions around the world!',
    },
    goal: {
      vi: 'Không cho Tốt nào phong cấp trong 20 nước, hoặc bắt hết chúng.',
      en: 'Stop every pawn for 20 moves, or capture them all.',
    },
    lesson: {
      vi: 'Ăn trước những Tốt không được bảo vệ, và luôn chặn Tốt tiến xa nhất.',
      en: 'Take unprotected pawns first, and always stop the most advanced pawn.',
    },
    rounds: [
      { mode: 'stop', fen: '8/pppppppp/8/8/8/8/8/3Q4 w - - 0 1', engineLevel: 3, plies: 20 },
    ],
    skills: ['queen', 'endgame'],
  },
  {
    id: 'hau-3',
    level: 'hau',
    order: 3,
    title: { vi: 'Đòn đôi', en: 'The Fork' },
    story: {
      vi: 'Đòn đôi là tấn công hai quân cùng một lúc. Đối phương chỉ cứu được một — quân còn lại là của em! Minh gọi đây là "một mũi tên trúng hai đích".',
      en: 'A fork attacks two pieces at once. Your opponent can only save one! Minh calls it "two birds with one stone".',
    },
    goal: { vi: 'Tìm đòn đôi bằng Hậu.', en: 'Find the queen fork.' },
    lesson: {
      vi: 'Đòn đôi mạnh nhất khi một trong hai mục tiêu là Vua (chiếu).',
      en: 'A fork is strongest when one target is the king (check).',
    },
    rounds: [
      {
        mode: 'puzzle',
        fen: 'r7/7k/8/8/8/8/8/4Q1K1 w - - 0 1',
        solution: ['e1e4', 'h7g7', 'e4a8'],
        prompt: {
          vi: 'Chiếu Vua và tấn công Xe cùng lúc.',
          en: 'Check the king and hit the rook at once.',
        },
      },
      {
        mode: 'puzzle',
        fen: '4k3/8/8/8/7b/8/8/3Q3K w - - 0 1',
        solution: ['d1a4', 'e8e7', 'a4h4'],
        prompt: { vi: 'Chiếu Vua và tấn công Tượng.', en: 'Check the king and hit the bishop.' },
      },
    ],
    skills: ['queen', 'tactics', 'fork'],
  },
  {
    id: 'hau-4',
    level: 'hau',
    order: 4,
    title: { vi: 'Hậu sống sót', en: 'Queen Escape' },
    story: {
      vi: 'Hậu tuy mạnh nhưng cũng là quân quý nhất. Xe và Tượng đen đang rình bắt Hậu. Bông dặn: "Đừng tham ăn quân được bảo vệ nhé!"',
      en: 'The queen is strong but precious. A black rook and bishop are hunting her. Bong warns: "Don\'t grab protected pieces!"',
    },
    goal: { vi: 'Giữ Hậu an toàn trong 10 nước.', en: 'Keep the queen safe for 10 moves.' },
    lesson: {
      vi: 'Đưa Hậu ra quá sớm thường khiến Hậu bị quân nhỏ đuổi chạy mất thời gian.',
      en: 'Bringing the queen out too early lets small pieces chase her around.',
    },
    rounds: [{ mode: 'survive', fen: 'r6b/8/8/8/3Q4/8/8/8 w - - 0 1', engineLevel: 4, plies: 10 }],
    skills: ['queen', 'safety'],
  },
  {
    id: 'hau-5',
    level: 'hau',
    order: 5,
    title: { vi: 'Hậu và Vua chiếu hết', en: 'Queen & King Mate' },
    story: {
      vi: 'Hậu dồn Vua đối phương vào góc, Vua trắng tiến lên hỗ trợ. Nhưng cẩn thận: nếu để Vua đen không còn nước đi mà không bị chiếu thì ván cờ hòa!',
      en: "The queen herds the enemy king, your king comes to help. But careful: leave it with no moves and not in check, and it's a draw!",
    },
    goal: { vi: 'Chiếu hết trong 15 nước.', en: 'Checkmate within 15 moves.' },
    lesson: {
      vi: 'Hậu đi theo nước Mã so với Vua đối phương sẽ thu hẹp "chiếc hộp" rất nhanh.',
      en: "Keeping the queen a knight's move from the enemy king shrinks its box quickly.",
    },
    rounds: [
      { mode: 'mate', fen: '8/8/8/3k4/8/8/8/3QK3 w - - 0 1', engineLevel: 6, moveLimit: 15 },
    ],
    skills: ['queen', 'endgame', 'checkmate'],
  },
  {
    id: 'hau-6',
    level: 'hau',
    order: 6,
    title: { vi: 'Chiếu hết 1 nước', en: 'Mate in One' },
    story: {
      vi: 'Bốn thế cờ, mỗi thế chỉ cần một nước để chiếu hết. An đếm thử: "Vua đen còn đường chạy nào không nhỉ?"',
      en: 'Four positions, each needs just one move to checkmate. An wonders: "Does the black king have any escape?"',
    },
    goal: { vi: 'Chiếu hết trong 1 nước.', en: 'Checkmate in one move.' },
    lesson: {
      vi: 'Chiếu hết = Vua bị chiếu và không có cách nào thoát.',
      en: 'Checkmate = the king is in check and cannot escape.',
    },
    rounds: [
      {
        mode: 'puzzle',
        anyMate: true,
        fen: 'r1bqkbnr/pppp1ppp/2n5/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4',
        solution: ['h5f7'],
      },
      {
        mode: 'puzzle',
        anyMate: true,
        fen: '6k1/5ppp/8/8/8/8/5PPP/3R2K1 w - - 0 1',
        solution: ['d1d8'],
      },
      { mode: 'puzzle', anyMate: true, fen: '6k1/8/6K1/8/8/8/8/1Q6 w - - 0 1', solution: ['b1b8'] },
      {
        mode: 'puzzle',
        anyMate: true,
        fen: '6rk/6pp/8/6N1/8/8/8/6K1 w - - 0 1',
        solution: ['g5f7'],
      },
    ],
    skills: ['checkmate', 'tactics'],
  },
];
