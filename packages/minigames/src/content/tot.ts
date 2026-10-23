import {
  colorQuestion,
  diagonal,
  fileSquares,
  movesQuestion,
  rankSquares,
  squaresQuestion,
} from '../questions';
import type { MiniGame } from '../types';

export const TOT: MiniGame[] = [
  {
    id: 'tot-1',
    level: 'tot',
    order: 1,
    title: { vi: 'Tìm ô', en: 'Find the Square' },
    story: {
      vi: 'Buổi đầu đến CLB, bé Na hỏi thầy: "Sao các anh chị nói e4 mà vẫn hiểu nhau ạ?". Thầy cười: mỗi ô trên bàn cờ đều có một cái tên — chữ cái của cột ghép với số của hàng. Mình cùng thử tìm nhé!',
      en: 'On her first day at the club, Na asked: "How do the big kids understand each other just by saying e4?" Every square has a name — the column letter plus the row number. Let\'s find some!',
    },
    goal: { vi: 'Chạm đúng ô được gọi tên.', en: 'Tap the square that is named.' },
    lesson: {
      vi: 'Cột đánh chữ a–h từ trái sang phải, hàng đánh số 1–8 từ phía quân Trắng.',
      en: 'Files are a–h from left to right; ranks are 1–8 starting from White.',
    },
    rounds: [{ mode: 'quiz', questions: [{ kind: 'find-square', count: 8 }] }],
    skills: ['board-vision', 'notation'],
  },
  {
    id: 'tot-2',
    level: 'tot',
    order: 2,
    title: { vi: 'Hàng – Cột – Đường chéo', en: 'Ranks, Files & Diagonals' },
    story: {
      vi: 'Minh xếp hàng vào lớp: các bạn đứng ngang là một hàng, đứng dọc là một cột. Trên bàn cờ cũng vậy, và còn có thêm những "con đường chéo" nữa đấy.',
      en: 'When Minh lines up for class, kids side by side form a row and kids one behind another form a column. The board has rows, columns — and diagonals too!',
    },
    goal: { vi: 'Chạm hết các ô theo yêu cầu.', en: 'Tap every square asked for.' },
    lesson: {
      vi: 'Hàng nằm ngang, cột nằm dọc, đường chéo gồm các ô cùng màu nối góc với nhau.',
      en: 'Ranks go across, files go up and down, diagonals are same-coloured squares touching at corners.',
    },
    rounds: [
      {
        mode: 'quiz',
        questions: [
          squaresQuestion(
            { vi: 'Chạm hết các ô của cột e.', en: 'Tap every square on the e-file.' },
            fileSquares('e'),
          ),
          squaresQuestion(
            { vi: 'Chạm hết các ô của hàng 4.', en: 'Tap every square on rank 4.' },
            rankSquares(4),
          ),
          squaresQuestion(
            {
              vi: 'Chạm hết các ô trên đường chéo a1–h8.',
              en: 'Tap every square on the a1–h8 diagonal.',
            },
            diagonal('a1', 'h8'),
          ),
          squaresQuestion(
            {
              vi: 'Chạm hết các ô trên đường chéo a8–h1.',
              en: 'Tap every square on the a8–h1 diagonal.',
            },
            diagonal('a8', 'h1'),
          ),
          colorQuestion('a1'),
          colorQuestion('h1'),
          colorQuestion('e4'),
        ],
      },
    ],
    skills: ['board-vision'],
  },
  {
    id: 'tot-3',
    level: 'tot',
    order: 3,
    title: { vi: 'Tốt ăn sao', en: 'Pawn Star Hunt' },
    story: {
      vi: 'Chú Tốt nhỏ chỉ biết tiến về phía trước, từng bước một — riêng bước đầu tiên được nhảy hai ô. Khi gặp quân địch ở ô chéo phía trước, Tốt sẽ ăn chéo!',
      en: 'The little pawn only walks forward, one step at a time — except its very first move, which can be two. It captures enemies diagonally forward!',
    },
    goal: { vi: 'Đưa Tốt đi ăn hết các ngôi sao.', en: 'Move the pawn to collect all the stars.' },
    lesson: {
      vi: 'Tốt đi thẳng nhưng ăn chéo. Tốt không bao giờ đi lùi.',
      en: 'Pawns move straight but capture diagonally. Pawns never move backwards.',
    },
    rounds: [
      { mode: 'collect', fen: '8/8/8/8/8/8/3P4/8 w - - 0 1', targets: ['d4', 'd5', 'd6', 'd7'] },
      { mode: 'collect', fen: '8/8/8/5p2/4p3/3p4/2P5/8 w - - 0 1', targets: ['d3', 'e4', 'f5'] },
    ],
    skills: ['pawn'],
  },
  {
    id: 'tot-4',
    level: 'tot',
    order: 4,
    title: { vi: 'Trận chiến Tốt', en: 'Pawn Wars' },
    story: {
      vi: 'Hai đội Tốt đứng đối mặt nhau. Đội nào đưa được một chú Tốt về tới hàng cuối của đối phương trước sẽ chiến thắng. An thì thầm: "Đừng để Tốt của mình bị ăn không công nhé!"',
      en: 'Two pawn armies face each other. Whoever gets a pawn to the other side first wins. An whispers: "Don\'t let your pawns be taken for free!"',
    },
    goal: {
      vi: 'Phong cấp một Tốt trước Máy Tốt, hoặc bắt hết Tốt của máy.',
      en: 'Promote a pawn before the Pawn Bot, or capture all its pawns.',
    },
    lesson: {
      vi: 'Tốt được bảo vệ bởi Tốt khác thì an toàn hơn. Đổi Tốt đúng lúc sẽ mở đường.',
      en: 'Pawns protected by other pawns are safer. Trading at the right moment opens the way.',
    },
    rounds: [{ mode: 'race', fen: '8/pppppppp/8/8/8/8/PPPPPPPP/8 w - - 0 1', engineLevel: 1 }],
    skills: ['pawn', 'strategy'],
  },
  {
    id: 'tot-5',
    level: 'tot',
    order: 5,
    title: { vi: 'Bắt tốt qua đường', en: 'En Passant' },
    story: {
      vi: 'Tốt đen vừa nhảy hai ô để lẻn qua mặt Tốt trắng. Nhưng luật cờ có một chiêu đặc biệt: Tốt trắng được bắt nó "qua đường" — chỉ ngay nước tiếp theo thôi nhé!',
      en: 'A black pawn just jumped two squares to sneak past. But there\'s a special rule: White can capture it "in passing" — only on the very next move!',
    },
    goal: { vi: 'Bắt tốt qua đường.', en: 'Capture en passant.' },
    lesson: {
      vi: 'Bắt tốt qua đường chỉ được làm ngay sau khi Tốt đối phương vừa nhảy hai ô sát cạnh Tốt mình.',
      en: 'En passant is only allowed right after an enemy pawn jumps two squares to land beside yours.',
    },
    rounds: [
      {
        mode: 'puzzle',
        fen: '8/8/8/3pP3/8/8/8/8 w - d6 0 1',
        solution: ['e5d6'],
        prompt: {
          vi: 'Tốt đen vừa đi d7–d5. Bắt nó đi!',
          en: 'Black just played d7–d5. Capture it!',
        },
      },
      {
        mode: 'puzzle',
        fen: '8/8/8/5Pp1/8/8/8/8 w - g6 0 1',
        solution: ['f5g6'],
        prompt: { vi: 'Tốt đen vừa đi g7–g5.', en: 'Black just played g7–g5.' },
      },
      {
        mode: 'puzzle',
        fen: '8/8/8/pP6/8/8/8/8 w - a6 0 1',
        solution: ['b5a6'],
        prompt: { vi: 'Tốt đen vừa đi a7–a5.', en: 'Black just played a7–a5.' },
      },
    ],
    skills: ['pawn', 'rules'],
  },
  {
    id: 'tot-6',
    level: 'tot',
    order: 6,
    title: { vi: 'Phong cấp', en: 'Promotion' },
    story: {
      vi: 'Chú Tốt đã đi một chặng đường thật dài. Khi tới hàng cuối, chú được "lên đời" thành Hậu, Xe, Tượng hoặc Mã. Bông hỏi: "Lúc nào cũng chọn Hậu là tốt nhất ạ?" — Hãy xem bài thứ hai nhé!',
      en: 'The pawn has travelled a long way. On the last rank it becomes a queen, rook, bishop or knight. Bong asks: "Is a queen always best?" — See the second puzzle!',
    },
    goal: { vi: 'Phong cấp đúng quân.', en: 'Promote to the right piece.' },
    lesson: {
      vi: 'Thường phong Hậu, nhưng đôi khi phong Mã để chiếu Vua và bắt quân là nước hay nhất.',
      en: 'Usually promote to a queen — but sometimes a knight that checks and forks is best.',
    },
    rounds: [
      {
        mode: 'puzzle',
        fen: '8/P7/8/8/8/8/8/8 w - - 0 1',
        solution: ['a7a8q'],
        prompt: {
          vi: 'Đưa Tốt lên hàng cuối và phong Hậu.',
          en: 'Push the pawn and promote to a queen.',
        },
      },
      {
        mode: 'puzzle',
        fen: '8/2q1P3/3k4/8/8/8/8/7K w - - 0 1',
        solution: ['e7e8n', 'd6d5', 'e8c7'],
        prompt: {
          vi: 'Phong cấp thành Mã để chiếu Vua, rồi bắt Hậu!',
          en: 'Promote to a knight with check, then win the queen!',
        },
      },
    ],
    skills: ['pawn', 'tactics'],
  },
  {
    id: 'tot-7',
    level: 'tot',
    order: 7,
    title: { vi: 'Cầu thang Tốt', en: 'Pawn Staircase' },
    story: {
      vi: 'Bin và Bông rủ nhau chơi trò leo cầu thang: mỗi bậc thang là một chú Tốt đen. Tốt trắng không bước thẳng lên được, chỉ có cách ăn chéo để bước qua từng bậc. Cùng giúp chú Tốt nhỏ leo lên nào!',
      en: 'Bin and Bong play a staircase game where every step is a black pawn. The white pawn cannot walk straight up — it has to capture diagonally to climb each step. Help the little pawn climb!',
    },
    goal: {
      vi: 'Ăn hết Tốt đen, nước nào cũng phải ăn quân. Sau đó chọn các ô mà Tốt đi tới được.',
      en: 'Capture every black pawn — every move must capture. Then pick the squares a pawn can reach.',
    },
    lesson: {
      vi: 'Tốt đi thẳng nhưng ăn chéo. Tốt bị chặn ngay trước mặt vẫn ăn chéo được nếu có quân địch đứng đó.',
      en: 'Pawns walk straight but capture diagonally. A blocked pawn can still capture diagonally if an enemy stands there.',
    },
    rounds: [
      {
        mode: 'collect',
        mustCapture: true,
        fen: '8/5p2/4p3/3p4/2p5/1p6/P7/8 w - - 0 1',
        targets: ['b3', 'c4', 'd5', 'e6', 'f7'],
      },
      {
        mode: 'collect',
        mustCapture: true,
        fen: '8/8/8/3pp3/2p2p2/1p4p1/P6P/8 w - - 0 1',
        targets: ['b3', 'c4', 'd5', 'g3', 'f4', 'e5'],
      },
      {
        mode: 'quiz',
        questions: [
          movesQuestion('8/8/8/8/8/8/4P3/8 w - - 0 1', 'e2', {
            vi: 'Tốt trắng ở e2 chưa đi lần nào. Nó đi được những ô nào?',
            en: 'The white pawn on e2 has not moved yet. Where can it go?',
          }),
          movesQuestion('8/8/8/3p1p2/4P3/8/8/8 w - - 0 1', 'e4', {
            vi: 'Tốt e4 có hai Tốt đen đứng chéo phía trước. Nó đi được những ô nào?',
            en: 'The pawn on e4 has two black pawns diagonally ahead. Where can it go?',
          }),
          movesQuestion('8/8/8/3pp3/4P3/8/8/8 w - - 0 1', 'e4', {
            vi: 'Tốt e4 bị Tốt đen e5 chắn ngay trước mặt. Nó còn đi được ô nào?',
            en: 'The pawn on e4 is blocked by the black pawn on e5. Where can it still go?',
          }),
        ],
      },
    ],
    skills: ['pawn', 'calculation'],
  },
  {
    id: 'tot-8',
    level: 'tot',
    order: 8,
    title: { vi: 'Tốt thông minh', en: 'Clever Pawns' },
    story: {
      vi: 'Bông phát hiện một bí mật: những chú Tốt đen đứng xếp hàng chéo là đang "nắm tay" bảo vệ nhau! Ai ăn nhầm chú đang được bảo vệ sẽ bị ăn lại ngay. Bông còn khoe thêm: "Tốt chạy tới hàng cuối còn được ăn chéo để lên đời nữa đấy!"',
      en: 'Bong has found a secret: black pawns standing in a diagonal line are "holding hands" to protect each other! Capture a protected pawn and you get captured right back. Bong adds: "A pawn reaching the last rank may even capture diagonally to promote!"',
    },
    goal: {
      vi: 'Ăn đúng thứ tự để không bị ăn lại, rồi phong cấp thật khéo.',
      en: 'Capture in the right order so you are not taken back, then promote cleverly.',
    },
    lesson: {
      vi: 'Trước khi ăn, hãy hỏi: "Có Tốt nào đang bảo vệ quân này không?". Tốt cũng được ăn chéo để phong cấp.',
      en: 'Before capturing, ask: "Is any pawn protecting this piece?" A pawn may also capture diagonally to promote.',
    },
    rounds: [
      {
        mode: 'collect',
        avoidAttacked: true,
        fen: '8/8/8/1p6/P1p5/1P6/8/8 w - - 0 1',
        targets: ['b5', 'c4'],
      },
      {
        mode: 'collect',
        avoidAttacked: true,
        fen: '8/8/3p4/2p1P3/1p1P4/2P5/8/8 w - - 0 1',
        targets: ['d6', 'c5', 'b4'],
      },
      {
        mode: 'puzzle',
        fen: 'r4k2/1P6/8/8/8/8/8/6K1 w - - 0 1',
        solution: ['b7a8q'],
        prompt: {
          vi: 'Tốt b7 đi thế nào để vừa phong Hậu vừa chiếu Vua, lại còn bắt được Xe?',
          en: 'How can the b7 pawn promote to a queen, give check and win the rook all at once?',
        },
      },
      {
        mode: 'puzzle',
        fen: '1n1r2k1/2P5/8/8/8/8/8/1K6 w - - 0 1',
        solution: ['c7d8q'],
        prompt: {
          vi: 'Tốt c7 có hai quân để ăn. Chọn quân nào để Hậu mới không bị ăn lại và còn chiếu Vua?',
          en: 'The c7 pawn can capture two pieces. Which one keeps the new queen safe and gives check?',
        },
      },
    ],
    skills: ['pawn', 'safety', 'promotion'],
  },
];
