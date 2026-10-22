import { knightQuestion } from '../questions';
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
];
