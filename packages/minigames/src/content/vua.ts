import { START_FEN } from '@duongsinh/chess-core';
import { movesQuestion, outcomeQuestion, placeKingQuestion } from '../questions';
import type { MiniGame } from '../types';

export const VUA: MiniGame[] = [
  {
    id: 'vua-1',
    level: 'vua',
    order: 1,
    title: { vi: 'Vua đi đâu?', en: 'Where Can the King Go?' },
    story: {
      vi: 'Vua là quân quan trọng nhất nhưng đi rất chậm: mỗi lần một ô, theo mọi hướng. Và Vua không bao giờ được bước vào ô đang bị tấn công.',
      en: 'The king is the most important piece but slow: one square in any direction. And it may never step onto an attacked square.',
    },
    goal: { vi: 'Chạm hết các ô Vua có thể đi tới.', en: 'Tap every square the king can move to.' },
    lesson: {
      vi: 'Hai Vua không bao giờ được đứng sát nhau.',
      en: 'The two kings can never stand next to each other.',
    },
    rounds: [
      {
        mode: 'quiz',
        questions: [
          movesQuestion('8/8/8/8/4K3/8/8/8 w - - 0 1', 'e4', {
            vi: 'Vua ở e4 đi được những ô nào?',
            en: 'Where can the king on e4 go?',
          }),
          movesQuestion('8/8/8/8/4K3/r7/8/8 w - - 0 1', 'e4', {
            vi: 'Xe đen khống chế hàng 3. Vua đi được những ô nào?',
            en: 'The black rook controls rank 3. Where can the king go?',
          }),
          movesQuestion('8/8/8/3k4/8/4K3/8/8 w - - 0 1', 'e3', {
            vi: 'Vua đen đứng gần. Vua trắng đi được những ô nào?',
            en: 'The black king is close. Where can the white king go?',
          }),
        ],
      },
    ],
    skills: ['king', 'rules'],
  },
  {
    id: 'vua-2',
    level: 'vua',
    order: 2,
    title: { vi: 'Thoát chiếu 3 cách', en: 'Three Ways Out of Check' },
    story: {
      vi: 'Khi Vua bị chiếu, có đúng 3 cách thoát: chạy Vua, bắt quân đang chiếu, hoặc lấy quân khác chặn đường chiếu. Mỗi thế dưới đây chỉ có một cách đúng!',
      en: 'When in check there are exactly three escapes: move the king, capture the checker, or block. Each position below has only one!',
    },
    goal: { vi: 'Tìm nước thoát chiếu duy nhất.', en: 'Find the only way out of check.' },
    lesson: { vi: 'Chạy – Bắt – Chặn.', en: 'Run – Capture – Block.' },
    rounds: [
      {
        mode: 'puzzle',
        fen: 'k7/8/8/8/8/8/6P1/r6K w - - 0 1',
        solution: ['h1h2'],
        prompt: { vi: 'Cách 1: chạy Vua.', en: 'Way 1: move the king.' },
      },
      {
        mode: 'puzzle',
        fen: 'k7/8/8/2b5/8/6n1/6PP/7K w - - 0 1',
        solution: ['h2g3'],
        prompt: { vi: 'Cách 2: bắt quân đang chiếu.', en: 'Way 2: capture the checking piece.' },
      },
      {
        mode: 'puzzle',
        fen: '7k/8/8/8/4R3/8/PP6/K6r w - - 0 1',
        solution: ['e4e1'],
        prompt: { vi: 'Cách 3: chặn đường chiếu.', en: 'Way 3: block the check.' },
      },
    ],
    skills: ['king', 'rules', 'check'],
  },
  {
    id: 'vua-3',
    level: 'vua',
    order: 3,
    title: { vi: 'Chiếu hết hay hòa?', en: 'Mate or Stalemate?' },
    story: {
      vi: 'Bin thắng chắc rồi, nhưng lỡ tay đi một nước khiến Vua đen không còn nước nào mà cũng không bị chiếu — ván cờ hòa! Cùng phân biệt chiếu hết và hết nước nhé.',
      en: "Bin was winning but made a move that left the black king no moves and not in check — a draw! Let's tell checkmate from stalemate.",
    },
    goal: { vi: 'Nhận ra thế cờ.', en: 'Identify each position.' },
    lesson: {
      vi: 'Hết nước đi mà không bị chiếu là HÒA, không phải thắng.',
      en: 'No legal moves while not in check is a DRAW, not a win.',
    },
    rounds: [
      {
        mode: 'quiz',
        questions: [
          outcomeQuestion('7k/6Q1/6K1/8/8/8/8/8 b - - 0 1'),
          outcomeQuestion('7k/5Q2/6K1/8/8/8/8/8 b - - 0 1'),
          outcomeQuestion('3R2k1/5ppp/8/8/8/8/8/6K1 b - - 0 1'),
          outcomeQuestion('4k3/8/8/8/8/8/8/R3K3 b - - 0 1'),
          outcomeQuestion('7k/8/6QK/8/8/8/8/8 b - - 0 1'),
        ],
      },
    ],
    skills: ['king', 'rules', 'checkmate'],
  },
  {
    id: 'vua-4',
    level: 'vua',
    order: 4,
    title: { vi: 'Vua dẫn đường cho Tốt', en: 'King Leads the Pawn' },
    story: {
      vi: 'Chỉ còn Vua và một chú Tốt. Vua trắng phải đi trước dọn đường, giành "thế đối Vua" để đưa Tốt về đích.',
      en: 'Just a king and a pawn. The white king must lead the way, winning the opposition to bring the pawn home.',
    },
    goal: { vi: 'Phong cấp Tốt.', en: 'Promote the pawn.' },
    lesson: {
      vi: 'Vua đứng trước Tốt ở hàng 6 thì luôn thắng (trừ Tốt cột a, h).',
      en: 'A king in front of its pawn on the 6th rank always wins (except rook pawns).',
    },
    rounds: [{ mode: 'race', fen: '4k3/8/4K3/4P3/8/8/8/8 w - - 0 1', engineLevel: 6 }],
    skills: ['king', 'pawn', 'endgame', 'opposition'],
  },
  {
    id: 'vua-5',
    level: 'vua',
    order: 5,
    title: { vi: 'Chiếu hết 2 nước', en: 'Mate in Two' },
    story: {
      vi: 'Đôi khi phải hy sinh một quân để chiếu hết. Thầy kể về "chiếu hết Mã ngạt" — Vua bị chính quân nhà vây kín!',
      en: 'Sometimes you sacrifice to checkmate. The coach tells of the "smothered mate" — a king trapped by its own pieces!',
    },
    goal: { vi: 'Chiếu hết trong 2 nước.', en: 'Checkmate in two moves.' },
    lesson: {
      vi: 'Hãy tìm nước chiếu buộc đối phương chỉ còn một cách trả lời.',
      en: 'Look for checks that leave only one reply.',
    },
    rounds: [
      {
        mode: 'puzzle',
        anyMate: true,
        fen: 'r6k/6pp/7N/8/8/1Q6/8/6K1 w - - 0 1',
        solution: ['b3g8', 'a8g8', 'h6f7'],
      },
      {
        mode: 'puzzle',
        anyMate: true,
        fen: '4k3/8/8/8/8/8/1R6/R5K1 w - - 0 1',
        solution: ['a1a7', 'e8f8', 'b2b8'],
      },
    ],
    skills: ['checkmate', 'tactics', 'sacrifice'],
  },
  {
    id: 'vua-6',
    level: 'vua',
    order: 6,
    title: { vi: 'Ván cờ đầu tiên', en: 'Your First Full Game' },
    story: {
      vi: 'Em đã đi qua cả 6 cấp: Tốt, Mã, Tượng, Xe, Hậu và Vua. Giờ là lúc chơi một ván cờ thật sự với Máy Tốt. Nhớ: kiểm soát trung tâm, phát triển quân, nhập thành sớm!',
      en: "You've climbed all six levels. Time for a real game against the Pawn Bot. Remember: control the centre, develop, castle early!",
    },
    goal: { vi: 'Chiếu hết Máy Tốt.', en: 'Checkmate the Pawn Bot.' },
    lesson: {
      vi: 'Thắng hay thua đều là bài học — quan trọng là em đã suy nghĩ thật kỹ.',
      en: 'Win or lose, every game teaches — what matters is that you thought hard.',
    },
    rounds: [{ mode: 'play', fen: START_FEN, engineLevel: 1 }],
    skills: ['game', 'opening', 'strategy'],
  },
  {
    id: 'vua-7',
    level: 'vua',
    order: 7,
    title: { vi: 'Đặt Vua', en: 'Place the King' },
    story: {
      vi: 'Trò chơi ngược: quân Trắng đã đứng sẵn, em là người đặt Vua đen lên bàn. Đặt ở đâu thì Vua bị chiếu? Ở đâu thì bị chiếu hết? Còn ở đâu thì hết nước đi?',
      en: 'A reverse puzzle: White is set up — you place the black king. Where is it in check? Checkmated? Stalemated?',
    },
    goal: { vi: 'Chạm hết các ô đúng.', en: 'Tap every correct square.' },
    lesson: {
      vi: 'Chiếu = bị tấn công. Chiếu hết = bị tấn công và không thoát được. Hết nước = không bị tấn công nhưng không đi được.',
      en: 'Check = attacked. Mate = attacked with no escape. Stalemate = not attacked but no moves.',
    },
    rounds: [
      {
        mode: 'quiz',
        questions: [
          placeKingQuestion('8/8/8/8/3N4/8/8/K7 b - - 0 1', 'check', {
            vi: 'Đặt Vua đen vào đâu thì bị Mã chiếu? Chạm hết các ô.',
            en: 'Where would the black king be in check from the knight? Tap them all.',
          }),
          placeKingQuestion('8/2Q5/1K6/8/8/8/8/8 b - - 0 1', 'stalemate', {
            vi: 'Đặt Vua đen vào đâu thì HẾT NƯỚC ĐI (hòa)?',
            en: 'Where would the black king be STALEMATED?',
          }),
          placeKingQuestion('8/6Q1/5K2/8/8/8/8/8 b - - 0 1', 'mate', {
            vi: 'Đặt Vua đen vào đâu thì bị CHIẾU HẾT?',
            en: 'Where would the black king be CHECKMATED?',
          }),
        ],
      },
    ],
    skills: ['king', 'checkmate', 'board-vision'],
  },
];
