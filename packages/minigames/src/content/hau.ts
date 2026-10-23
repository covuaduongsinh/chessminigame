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
  {
    id: 'hau-7',
    level: 'hau',
    order: 7,
    title: { vi: 'Hậu ăn liên hoàn', en: 'Queen Chain Captures' },
    story: {
      vi: 'Hậu mạnh nhất nhưng hôm nay có luật đặc biệt: mỗi nước đều phải ăn một Tốt. Na bảo: "Nhìn cả đường thẳng lẫn đường chéo nhé!"',
      en: 'The queen is strongest, but today every move must capture a pawn. Na says: "Look along lines AND diagonals!"',
    },
    goal: {
      vi: 'Ăn hết Tốt đen, nước nào cũng phải ăn quân.',
      en: 'Capture every black pawn — every move must capture.',
    },
    lesson: {
      vi: 'Hậu có tới 8 hướng đi — kiểm tra đủ cả 8 hướng.',
      en: 'The queen has 8 directions — check all of them.',
    },
    rounds: [
      {
        mode: 'collect',
        mustCapture: true,
        fen: '8/1p4p1/5p2/8/3p4/8/1p3p2/3Q4 w - - 0 1',
        targets: ['d4', 'g7', 'b7', 'b2', 'f6', 'f2'],
      },
    ],
    skills: ['queen', 'calculation'],
  },
  {
    id: 'hau-8',
    level: 'hau',
    order: 8,
    title: { vi: 'Hậu và Vua cùng nhau', en: 'Queen and King Together' },
    story: {
      vi: 'Hậu rất mạnh, nhưng một mình Hậu khó chiếu hết lắm. Khi có Vua nhà đứng cạnh bảo vệ, Hậu mới "cắn" được Vua đối phương. Na bảo: "Giống hai chị em đi chơi: một người dẫn đường, một người che chở!" Nhưng nhớ cẩn thận, dồn Vua đen chặt quá mà nó hết nước đi thì ván cờ hòa đấy.',
      en: 'The queen is mighty, but alone she struggles to deliver mate. With her own king standing guard, she can finally bite the enemy king. Na says: "Like two sisters out together — one leads, one protects!" But be careful: squeeze too hard and the black king has no moves left, which is a draw.',
    },
    goal: {
      vi: 'Dùng Hậu và Vua phối hợp để chiếu hết.',
      en: 'Use the queen and king as a team to give checkmate.',
    },
    lesson: {
      vi: 'Hậu đứng sát Vua đối phương phải được Vua mình bảo vệ. Hậu cách Vua đối phương một nước Mã sẽ nhốt Vua lại mà không làm hòa.',
      en: "A queen right next to the enemy king must be protected by her own king. A queen a knight's move away traps the king without stalemating it.",
    },
    rounds: [
      {
        mode: 'puzzle',
        anyMate: true,
        fen: '7k/8/5K2/8/8/8/8/6Q1 w - - 0 1',
        solution: ['g1g7'],
        prompt: {
          vi: 'Hậu sát Vua đen và được Vua trắng bảo vệ. Chiếu hết!',
          en: 'Put the queen next to the black king, protected by your own king. Checkmate!',
        },
      },
      {
        mode: 'puzzle',
        anyMate: true,
        fen: 'k7/7Q/2K5/8/8/8/8/8 w - - 0 1',
        solution: ['h7b7'],
        prompt: {
          vi: 'Cẩn thận! Chỉ một nước chiếu hết, còn vài nước khác làm Vua đen hết nước đi (hòa).',
          en: 'Careful! Only one move mates — a few others leave the king with no moves (a draw).',
        },
      },
      {
        mode: 'puzzle',
        anyMate: true,
        fen: '3k4/Q7/5K2/8/8/8/8/8 w - - 0 1',
        solution: ['a7b7', 'd8e8', 'b7e7'],
        prompt: {
          vi: 'Chưa chiếu hết ngay được. Đặt Hậu cách Vua đen một nước Mã để nhốt nó lại!',
          en: "No mate yet. Put the queen a knight's move from the black king to lock it in!",
        },
      },
      { mode: 'mate', fen: '8/8/8/8/3k4/8/8/Q3K3 w - - 0 1', engineLevel: 6, moveLimit: 15 },
    ],
    skills: ['queen', 'king', 'checkmate', 'endgame'],
  },
  {
    id: 'hau-9',
    level: 'hau',
    order: 9,
    title: { vi: 'Thí Hậu giành chiến thắng', en: 'The Queen Sacrifice' },
    story: {
      vi: 'Hôm nay thầy kể chuyện "hy sinh để chiến thắng". Có lúc ta bỏ cả Hậu, quân quý nhất, chỉ để dụ quân đen rời khỏi vị trí rồi chiếu hết gọn gàng bằng một Xe. Minh tròn mắt: "Bỏ Hậu mà vẫn thắng ạ?" Thầy cười: "Miễn là em tính kỹ được nước chiếu hết!"',
      en: 'Today the coach tells a story about "giving up something to win". Sometimes you give away even the queen, your most precious piece, just to lure a defender away — then a rook delivers a tidy checkmate. Minh stares: "You can give up the queen and still win?" The coach grins: "As long as you have calculated the mate!"',
    },
    goal: {
      vi: 'Tìm nước thí Hậu dẫn tới chiếu hết.',
      en: 'Find the queen sacrifice that leads to checkmate.',
    },
    lesson: {
      vi: 'Chỉ thí Hậu khi đã thấy rõ nước chiếu hết. Hãy hỏi: quân nào đang giữ nhà cho Vua? Có cách nào dụ nó đi chỗ khác không?',
      en: "Only sacrifice the queen once you can see the mate. Ask: which piece guards the king's house? Can I lure it away?",
    },
    rounds: [
      {
        mode: 'puzzle',
        anyMate: true,
        fen: '5rk1/5ppp/8/8/8/3Q4/8/6KR w - - 0 1',
        solution: ['d3h7'],
        prompt: {
          vi: 'Hậu ăn Tốt h7 và có Xe h1 bảo vệ. Vua đen không có chỗ chạy!',
          en: 'The queen takes h7, protected by the rook on h1. The black king has nowhere to run!',
        },
      },
      {
        mode: 'puzzle',
        anyMate: true,
        fen: 'q5k1/5ppp/8/8/3Q4/8/3R4/6K1 w - - 0 1',
        solution: ['d4d8', 'a8d8', 'd2d8'],
        prompt: {
          vi: 'Thí Hậu ở d8 để dụ Hậu đen ra khỏi hàng cuối, rồi Xe chiếu hết!',
          en: 'Sacrifice the queen on d8 to lure the black queen off the back rank, then the rook mates!',
        },
      },
      {
        mode: 'puzzle',
        anyMate: true,
        fen: 'Q5rk/5ppp/8/8/2R5/8/8/6K1 w - - 0 1',
        solution: ['a8g8', 'h8g8', 'c4c8'],
        prompt: {
          vi: 'Hậu ăn Xe g8 bằng nước chiếu. Vua đen buộc phải ăn lại, rồi Xe c4 chiếu hết!',
          en: 'The queen takes the g8 rook with check. The king must recapture — then the c4 rook mates!',
        },
      },
    ],
    skills: ['queen', 'checkmate', 'tactics', 'sacrifice'],
  },
];
