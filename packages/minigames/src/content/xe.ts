import { castleQuestion } from '../questions';
import type { MiniGame } from '../types';

export const XE: MiniGame[] = [
  {
    id: 'xe-1',
    level: 'xe',
    order: 1,
    title: { vi: 'Xe ăn sao', en: 'Rook Star Hunt' },
    story: {
      vi: 'Xe chạy thẳng như đoàn tàu hỏa: ngang hoặc dọc, xa bao nhiêu cũng được. Bông thích Xe nhất vì "nó chạy nhanh vèo vèo"!',
      en: "The rook runs straight like a train: across or up and down, as far as it likes. Bong loves it because it's so fast!",
    },
    goal: {
      vi: 'Đưa Xe ăn hết sao bằng ít nước nhất.',
      en: 'Collect every star in the fewest moves.',
    },
    lesson: {
      vi: 'Xe tới mọi ô trên bàn cờ chỉ trong tối đa 2 nước.',
      en: 'A rook can reach any square on the board in at most two moves.',
    },
    rounds: [
      { mode: 'collect', fen: '8/8/8/8/8/8/8/R7 w - - 0 1', targets: ['a8', 'h8', 'h1', 'd4'] },
      { mode: 'collect', fen: '8/8/8/8/3R4/8/8/8 w - - 0 1', targets: ['b6', 'f2', 'g7', 'c3'] },
    ],
    skills: ['rook'],
  },
  {
    id: 'xe-2',
    level: 'xe',
    order: 2,
    title: { vi: 'Xe chặn Tốt', en: 'Rook Stops Pawns' },
    story: {
      vi: 'Hai chú Tốt đen ở hai cánh cùng lúc tiến xuống. Xe trắng phải chạy qua chạy lại để chặn — nhớ là Tốt phong cấp là thua đấy!',
      en: 'Two black pawns on opposite wings march down at once. The rook must dash back and forth — a promotion means you lose!',
    },
    goal: {
      vi: 'Không cho Tốt phong cấp trong 10 nước, hoặc bắt hết chúng.',
      en: 'Stop the pawns for 10 moves, or capture them all.',
    },
    lesson: { vi: 'Xe mạnh nhất khi đứng phía sau Tốt.', en: 'Rooks are strongest behind pawns.' },
    rounds: [{ mode: 'stop', fen: '8/8/8/8/1p4p1/8/8/R7 w - - 0 1', engineLevel: 3, plies: 10 }],
    skills: ['rook', 'endgame'],
  },
  {
    id: 'xe-3',
    level: 'xe',
    order: 3,
    title: { vi: 'Đòn Xiên', en: 'The Skewer' },
    story: {
      vi: 'Đòn xiên ngược với đòn ghim: chiếu vào quân giá trị lớn đứng trước, nó phải tránh đi và để lộ quân phía sau. Thầy ví như "xiên que thịt nướng".',
      en: 'A skewer is a reverse pin: attack the big piece in front, it must move, and the piece behind is lost — like a kebab skewer!',
    },
    goal: { vi: 'Xiên Vua để bắt Hậu.', en: 'Skewer the king to win the queen.' },
    lesson: {
      vi: 'Khi Vua và quân khác đứng thẳng hàng, hãy tìm đòn xiên.',
      en: 'When the king and another piece are on one line, look for a skewer.',
    },
    rounds: [
      {
        mode: 'puzzle',
        fen: '8/8/8/3k3q/8/8/8/R5K1 w - - 0 1',
        solution: ['a1a5', 'd5e4', 'a5h5'],
        prompt: {
          vi: 'Vua và Hậu đen cùng ở hàng 5.',
          en: 'The black king and queen share rank 5.',
        },
      },
      {
        mode: 'puzzle',
        fen: '7R/8/1k6/8/8/8/1q6/7K w - - 0 1',
        solution: ['h8b8', 'b6c5', 'b8b2'],
        prompt: {
          vi: 'Vua và Hậu đen cùng ở cột b.',
          en: 'The black king and queen share the b-file.',
        },
      },
    ],
    skills: ['rook', 'tactics', 'skewer'],
  },
  {
    id: 'xe-4',
    level: 'xe',
    order: 4,
    title: { vi: 'Nhập thành', en: 'Castling' },
    story: {
      vi: 'Nhập thành là nước đặc biệt: Vua đi 2 ô về phía Xe, Xe nhảy qua đứng cạnh Vua. Nhưng có những lúc không được nhập thành — mình cùng tìm hiểu nhé.',
      en: "Castling is special: the king steps two squares toward a rook and the rook hops over. But sometimes it isn't allowed — let's find out when.",
    },
    goal: { vi: 'Trả lời đúng và tự nhập thành.', en: 'Answer correctly, then castle yourself.' },
    lesson: {
      vi: 'Không nhập thành khi: đang bị chiếu, Vua đi qua ô bị tấn công, có quân đứng giữa, hoặc Vua/Xe đã từng di chuyển.',
      en: 'You cannot castle out of check, through an attacked square, with pieces in between, or if the king/rook has moved.',
    },
    rounds: [
      {
        mode: 'quiz',
        questions: [
          castleQuestion('r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1', 'king'),
          castleQuestion('4kr2/8/8/8/8/8/8/R3K2R w KQ - 0 1', 'king'),
          castleQuestion('4kr2/8/8/8/8/8/8/R3K2R w KQ - 0 1', 'queen'),
          castleQuestion('4k3/8/8/8/8/8/4r3/R3K2R w KQ - 0 1', 'king'),
          castleQuestion('4k3/8/8/8/8/8/8/RN2K2R w KQ - 0 1', 'queen'),
        ],
      },
      {
        mode: 'puzzle',
        fen: '4k3/8/8/8/8/8/5PPP/4K2R w K - 0 1',
        solution: ['e1g1'],
        prompt: {
          vi: 'Nhập thành ngắn: kéo Vua sang phải 2 ô.',
          en: 'Castle kingside: drag the king two squares right.',
        },
      },
    ],
    skills: ['rook', 'king', 'rules'],
  },
  {
    id: 'xe-5',
    level: 'xe',
    order: 5,
    title: { vi: 'Xe dọn đường', en: 'Clear the Way' },
    story: {
      vi: 'Ba chú Tốt đen đứng bảo vệ nhau. Nếu Xe ăn nhầm Tốt đang được bảo vệ, Xe sẽ bị ăn lại! Phải ăn quân "không có ai che" trước.',
      en: 'Three black pawns protect each other. Take a protected pawn and the rook is captured back! Take the unprotected one first.',
    },
    goal: {
      vi: 'Bắt hết Tốt đen mà không để Xe bị ăn.',
      en: 'Capture every black pawn without losing the rook.',
    },
    lesson: {
      vi: 'Trước khi ăn quân, kiểm tra xem quân đó có được bảo vệ không.',
      en: 'Before capturing, check whether the piece is protected.',
    },
    rounds: [
      {
        mode: 'collect',
        avoidAttacked: true,
        fen: '8/1p6/p1p5/8/8/8/8/R7 w - - 0 1',
        targets: ['b7', 'a6', 'c6'],
      },
      {
        mode: 'collect',
        avoidAttacked: true,
        fen: '8/8/8/4p3/3p1p2/8/8/7R w - - 0 1',
        targets: ['e5', 'd4', 'f4'],
      },
    ],
    skills: ['rook', 'safety'],
  },
  {
    id: 'xe-6',
    level: 'xe',
    order: 6,
    title: { vi: 'Xe và Vua chiếu hết', en: 'Rook & King Mate' },
    story: {
      vi: 'Chỉ với một Xe và Vua, em vẫn chiếu hết được Vua đối phương — dồn nó về sát mép bàn cờ như dồn bóng vào góc sân.',
      en: 'With just a rook and king you can checkmate — push the enemy king to the edge like herding a ball into a corner.',
    },
    goal: { vi: 'Chiếu hết trong 20 nước.', en: 'Checkmate within 20 moves.' },
    lesson: {
      vi: 'Xe cắt hàng, Vua tiến lên giữ đối diện, rồi Xe chiếu hết ở mép.',
      en: 'The rook cuts off ranks, the king walks up to face the enemy king, then the rook mates on the edge.',
    },
    rounds: [
      { mode: 'mate', fen: '7k/8/8/8/8/8/1R6/4K3 w - - 0 1', engineLevel: 6, moveLimit: 20 },
    ],
    skills: ['rook', 'endgame', 'checkmate'],
  },
];
