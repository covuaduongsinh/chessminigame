import { knightQuestion, outcomeQuestion, squaresQuestion } from '../questions';
import type { MiniGame } from '../types';

export const MA: MiniGame[] = [
  {
    id: 'ma-1',
    level: 'ma',
    order: 1,
    title: { vi: 'Mã ăn sao', en: 'Knight Star Hunt' },
    story: {
      vi: 'Chú Mã có cách đi lạ nhất: hai ô thẳng rồi một ô ngang, như chữ L. Bin bảo: "Mã giống con ngựa nhảy rào vậy!" — vì Mã nhảy qua được đầu các quân khác.',
      en: 'The knight moves in the strangest way: two squares straight then one to the side, like an L. Bin says: "It\'s a horse jumping fences!"',
    },
    goal: { vi: 'Đưa Mã ăn hết các ngôi sao.', en: 'Collect all the stars with the knight.' },
    lesson: {
      vi: 'Mỗi nước Mã luôn đổi màu ô: từ ô trắng sang ô đen và ngược lại.',
      en: 'Every knight move changes square colour: light to dark and back.',
    },
    rounds: [
      { mode: 'collect', fen: '8/8/8/8/8/8/8/1N6 w - - 0 1', targets: ['c3', 'e4', 'g5', 'f7'] },
    ],
    skills: ['knight'],
  },
  {
    id: 'ma-2',
    level: 'ma',
    order: 2,
    title: { vi: 'Mê cung Mã', en: 'Knight Maze' },
    story: {
      vi: 'Cả lớp vẽ một mê cung trên sân trường. Chú Mã phải ghé thăm từng ô được đánh số, đúng thứ tự, không được bỏ ô nào.',
      en: 'The class drew a maze in the playground. The knight must visit each numbered square in order, skipping none.',
    },
    goal: { vi: 'Đi qua các ô sao theo đúng thứ tự.', en: 'Visit the star squares in order.' },
    lesson: {
      vi: 'Trước khi đi, hãy đếm nhẩm đường nhảy của Mã tới ô tiếp theo.',
      en: "Count the knight's path to the next square before you move.",
    },
    rounds: [
      {
        mode: 'collect',
        ordered: true,
        fen: '8/8/8/8/8/8/8/N7 w - - 0 1',
        targets: ['b3', 'c5', 'e4', 'g5', 'e6', 'c7', 'a8'],
      },
      {
        mode: 'collect',
        ordered: true,
        fen: '8/8/8/8/8/8/8/7N w - - 0 1',
        targets: ['f2', 'd1', 'b2', 'a4', 'c3', 'e4'],
      },
    ],
    skills: ['knight', 'calculation'],
  },
  {
    id: 'ma-3',
    level: 'ma',
    order: 3,
    title: { vi: 'Mã né bẫy', en: 'Dodge the Traps' },
    story: {
      vi: 'Những chú Tốt đen đứng canh khắp nơi. Ô nào bị Tốt đen nhìn chéo là ô "bẫy" — Mã nhảy vào là bị ăn ngay!',
      en: 'Black pawns are on guard. Any square a black pawn watches is a trap — land there and the knight is captured!',
    },
    goal: {
      vi: 'Ăn hết sao mà không nhảy vào ô bẫy.',
      en: 'Collect every star without landing on a trap.',
    },
    lesson: {
      vi: 'Trước mỗi nước, tự hỏi: "Ô mình định đến có bị quân địch tấn công không?"',
      en: 'Before every move ask: "Is the square I\'m going to attacked?"',
    },
    rounds: [
      {
        mode: 'collect',
        avoidAttacked: true,
        fen: '8/8/2p3p1/4p3/8/8/8/1N6 w - - 0 1',
        targets: ['d2', 'e4', 'c5', 'e6'],
      },
      {
        mode: 'collect',
        avoidAttacked: true,
        fen: '8/8/8/2p2p2/8/3p4/8/6N1 w - - 0 1',
        targets: ['f3', 'd2', 'b3', 'c1'],
      },
    ],
    skills: ['knight', 'safety'],
  },
  {
    id: 'ma-4',
    level: 'ma',
    order: 4,
    title: { vi: 'Mã đấu Tốt', en: 'Knight vs Pawns' },
    story: {
      vi: 'Hai chú Tốt đen đang lao về phía hàng 1 để phong Hậu. Chú Mã trắng phải chặn chúng lại!',
      en: 'Two black pawns are racing to rank 1 to become queens. The white knight must stop them!',
    },
    goal: {
      vi: 'Không cho Tốt đen phong cấp cho tới khi hết lượt, hoặc bắt hết chúng.',
      en: 'Stop the black pawns promoting until time runs out, or capture them all.',
    },
    lesson: {
      vi: 'Mã chặn Tốt tốt nhất khi đứng ngay ô phía trước Tốt.',
      en: 'A knight blocks a pawn best by standing right in front of it.',
    },
    rounds: [
      { mode: 'stop', fen: '8/8/2p5/8/8/8/8/6N1 w - - 0 1', engineLevel: 2, plies: 8 },
      { mode: 'stop', fen: '8/2p2p2/8/8/3N4/8/8/8 w - - 0 1', engineLevel: 2, plies: 10 },
    ],
    skills: ['knight', 'endgame'],
  },
  {
    id: 'ma-5',
    level: 'ma',
    order: 5,
    title: { vi: 'Mã đi mấy nước?', en: 'How Many Jumps?' },
    story: {
      vi: 'Thầy đố cả lớp: "Ô ngay bên cạnh mà Mã lại phải đi tới 3 nước — có lạ không?" Cùng đếm xem nhé.',
      en: 'The coach asks: "A square right next door can take the knight three jumps — isn\'t that strange?" Let\'s count.',
    },
    goal: { vi: 'Chọn đúng số nước ít nhất.', en: 'Choose the fewest number of moves.' },
    lesson: {
      vi: 'Mã đi chậm ở quãng gần, nhưng rất linh hoạt ở trung tâm.',
      en: 'Knights are slow over short distances but flexible in the centre.',
    },
    rounds: [
      {
        mode: 'quiz',
        questions: [
          knightQuestion('b1', 'c3'),
          knightQuestion('g1', 'g3'),
          knightQuestion('e4', 'e5'),
          knightQuestion('a1', 'b2'),
          knightQuestion('a1', 'h8'),
        ],
      },
    ],
    skills: ['knight', 'calculation'],
  },
  {
    id: 'ma-6',
    level: 'ma',
    order: 6,
    title: { vi: 'Mã bắt hết quân', en: 'Knight Round-up' },
    story: {
      vi: 'Những chú Tốt đen ngủ quên trên bàn cờ. Chú Mã phải đi bắt hết chúng bằng ít nước nhất.',
      en: 'Black pawns have fallen asleep on the board. The knight must catch them all in the fewest moves.',
    },
    goal: { vi: 'Bắt hết quân đen.', en: 'Capture every black piece.' },
    lesson: {
      vi: 'Tìm thứ tự bắt hợp lý trước khi đi — giống như lên kế hoạch đường đi.',
      en: 'Plan the order of captures first — like planning a route.',
    },
    rounds: [
      {
        mode: 'collect',
        fen: '8/8/5p2/3p4/8/4p3/2p5/N7 w - - 0 1',
        targets: ['c2', 'e3', 'd5', 'f6'],
      },
      {
        mode: 'collect',
        fen: '8/1p4p1/8/8/3N4/8/1p4p1/8 w - - 0 1',
        targets: ['b2', 'g2', 'b7', 'g7'],
      },
    ],
    skills: ['knight', 'calculation'],
  },
  {
    id: 'ma-7',
    level: 'ma',
    order: 7,
    title: { vi: 'Mã ăn liên hoàn', en: 'Knight Chain Captures' },
    story: {
      vi: 'Thử thách khó dành cho bạn nào đã thành thạo chú Mã: nước nào cũng phải ăn một quân. Đi sai thứ tự là sẽ bị "kẹt" giữa đường đấy!',
      en: 'A tough challenge for knight experts: every move must capture. Take them in the wrong order and you get stuck!',
    },
    goal: {
      vi: 'Ăn hết Tốt đen, nước nào cũng phải ăn quân.',
      en: 'Capture every black pawn — every move must capture.',
    },
    lesson: {
      vi: 'Nghĩ trước vài nước: thứ tự quan trọng không kém nước đi.',
      en: 'Think a few moves ahead: order matters as much as the moves.',
    },
    rounds: [
      {
        mode: 'collect',
        mustCapture: true,
        fen: '8/5p2/3p4/1p4p1/4p3/2p5/8/1N6 w - - 0 1',
        targets: ['c3', 'e4', 'g5', 'f7', 'd6', 'b5'],
      },
    ],
    skills: ['knight', 'calculation'],
  },
  {
    id: 'ma-8',
    level: 'ma',
    order: 8,
    title: { vi: 'Đòn đôi của Mã', en: 'Knight Forks' },
    story: {
      vi: 'Bông kể rằng chú Mã rất tinh nghịch: chỉ một cú nhảy là nhìn thấy hai quân đen cùng lúc, như bắt được hai chú bướm bằng một cái vợt. Đối phương chỉ cứu được một, quân còn lại thuộc về chú Mã!',
      en: 'Bong says the knight is a cheeky jumper: one hop and it spots two black pieces at once, like catching two butterflies with one net. Your opponent can only save one — the other belongs to the knight!',
    },
    goal: {
      vi: 'Tìm ô Mã nhảy tới để tấn công hai quân cùng một lúc.',
      en: 'Find the square where the knight attacks two pieces at once.',
    },
    lesson: {
      vi: 'Mã nhảy qua đầu mọi quân nên đòn đôi của Mã rất khó đỡ. Nếu một mục tiêu là Vua thì đối phương buộc phải lo cho Vua trước.',
      en: 'The knight jumps over everything, so its forks are hard to stop. If one target is the king, your opponent must save the king first.',
    },
    rounds: [
      {
        mode: 'quiz',
        questions: [
          squaresQuestion(
            {
              vi: 'Mã trắng ở d5 đang tấn công những quân đen nào? Chạm vào từng quân.',
              en: 'Which black pieces does the white knight on d5 attack? Tap each one.',
            },
            ['c7', 'e7'],
            '6k1/2r1q3/p5p1/3N4/8/8/8/6K1 w - - 0 1',
            ['d5'],
          ),
          squaresQuestion(
            {
              vi: 'Mã ở e4 nhảy tới ô nào thì tấn công cùng lúc cả Hậu và Xe đen?',
              en: 'Which square lets the knight on e4 attack the black queen and rook at the same time?',
            },
            ['d6'],
            '2r1q2k/6pp/8/8/4N3/8/8/6K1 w - - 0 1',
            ['e4'],
          ),
        ],
      },
      {
        mode: 'puzzle',
        fen: 'r3k3/p7/4N3/8/8/8/8/6K1 w - - 0 1',
        solution: ['e6c7', 'e8f7', 'c7a8'],
        prompt: {
          vi: 'Mã nhảy chiếu Vua và nhắm luôn vào Xe a8.',
          en: 'Jump with check and attack the rook on a8 as well.',
        },
      },
      {
        mode: 'puzzle',
        fen: '3q3k/6pp/8/6N1/8/8/8/6K1 w - - 0 1',
        solution: ['g5f7', 'h8g8', 'f7d8'],
        prompt: {
          vi: 'Chiếu Vua đen và tấn công Hậu cùng lúc!',
          en: 'Check the black king and attack the queen at the same time!',
        },
      },
    ],
    skills: ['knight', 'tactics', 'fork'],
  },
  {
    id: 'ma-9',
    level: 'ma',
    order: 9,
    title: { vi: 'Chiếu hết ngạt', en: 'Smothered Mate' },
    story: {
      vi: 'Vua đen ngồi trong góc nhà, xung quanh toàn quân nhà đứng sát. Bin thì thầm: "Ôi, Vua tự nhốt mình rồi!" Đúng lúc đó chú Mã lao tới. Mã nhảy qua đầu mọi quân nên không ai chặn nổi — Vua không còn đường chạy!',
      en: 'The black king sits in a corner with its own pieces packed around it. Bin whispers: "Oh no, the king locked itself in!" Then the knight swoops in. Knights jump over everything, so nobody can block — the king has nowhere to run!',
    },
    goal: {
      vi: 'Nhận ra và tìm nước Mã chiếu hết ngạt.',
      en: "Spot and find the knight's smothered mate.",
    },
    lesson: {
      vi: 'Vua nằm trong góc và bị chính quân nhà vây quanh rất dễ bị Mã chiếu hết. Đôi khi phải thí Hậu để dụ Xe đen vào chặn đường Vua.',
      en: 'A king in the corner, boxed in by its own pieces, is easy prey for a knight. Sometimes you sacrifice the queen to lure a rook next to the king.',
    },
    rounds: [
      {
        mode: 'quiz',
        questions: [
          outcomeQuestion('6rk/5Npp/8/8/8/8/8/6K1 b - - 0 1'),
          outcomeQuestion('7k/5Npp/8/8/8/8/8/6K1 b - - 0 1'),
          outcomeQuestion('kr6/ppN5/8/8/8/8/8/6K1 b - - 0 1'),
          outcomeQuestion('6rk/5N1p/8/8/8/8/8/6K1 b - - 0 1'),
        ],
      },
      {
        mode: 'puzzle',
        anyMate: true,
        fen: '6rk/6pp/8/4N3/8/8/8/6K1 w - - 0 1',
        solution: ['e5f7'],
        prompt: {
          vi: 'Vua đen bị Xe và Tốt vây kín. Mã nhảy vào đâu để chiếu hết?',
          en: 'The black king is boxed in by its rook and pawns. Where does the knight jump to checkmate?',
        },
      },
      {
        mode: 'puzzle',
        anyMate: true,
        fen: 'kr6/pp6/8/3N4/8/8/8/6K1 w - - 0 1',
        solution: ['d5c7'],
        prompt: {
          vi: 'Lần này Vua đen ở góc bên trái. Mã chiếu hết ở đâu?',
          en: 'This time the black king hides in the left corner. Where is the mate?',
        },
      },
      {
        mode: 'puzzle',
        anyMate: true,
        fen: '5r1k/6pp/7N/3Q4/8/8/8/6K1 w - - 0 1',
        solution: ['d5g8', 'f8g8', 'h6f7'],
        prompt: {
          vi: 'Thí Hậu để dụ Xe đen vào g8, rồi Mã chiếu hết!',
          en: 'Sacrifice the queen to lure the rook onto g8, then the knight mates!',
        },
      },
    ],
    skills: ['knight', 'checkmate', 'tactics', 'smothered-mate'],
  },
];
