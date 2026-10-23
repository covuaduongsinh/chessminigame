import { castleQuestion, outcomeQuestion } from '../questions';
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
  {
    id: 'xe-7',
    level: 'xe',
    order: 7,
    title: { vi: 'Xe ăn liên hoàn', en: 'Rook Chain Captures' },
    story: {
      vi: 'Xe như đoàn tàu chở hàng: mỗi chặng phải dừng ở một ga có Tốt đen. Em vạch lộ trình sao cho tàu không bị dừng giữa đường nhé!',
      en: 'The rook is a freight train: every stop must be a station with a black pawn. Plan a route so the train never gets stuck!',
    },
    goal: {
      vi: 'Ăn hết Tốt đen, nước nào cũng phải ăn quân.',
      en: 'Capture every black pawn — every move must capture.',
    },
    lesson: {
      vi: 'Xe đi được xa — hãy nhìn cả hàng và cột trước khi đi.',
      en: 'Rooks travel far — scan the whole rank and file first.',
    },
    rounds: [
      {
        mode: 'collect',
        mustCapture: true,
        fen: '8/1p4p1/8/p2p4/8/8/3p2p1/R7 w - - 0 1',
        targets: ['a5', 'd5', 'd2', 'g2', 'g7', 'b7'],
      },
    ],
    skills: ['rook', 'calculation'],
  },
  {
    id: 'xe-8',
    level: 'xe',
    order: 8,
    title: { vi: 'Chiếu hết hàng cuối', en: 'Back-Rank Mate' },
    story: {
      vi: 'Vua đen xây nhà ở hàng cuối rồi xếp ba chú Tốt đứng chắn ngay trước mặt, như ba cánh cửa đóng kín. Bin cười: "Vua ơi, cửa đóng hết thì cũng không có lối thoát đâu!" Xe trắng chỉ việc lao xuống hàng cuối là xong.',
      en: 'The black king builds a home on the back rank and lines up three pawns right in front, like three closed doors. Bin laughs: "King, with every door shut you have no way out!" The white rook just slides down to the back rank.',
    },
    goal: {
      vi: 'Nhận ra thế chiếu hết hàng cuối và tự tay chiếu hết.',
      en: 'Recognise a back-rank mate, then deliver one yourself.',
    },
    lesson: {
      vi: 'Hãy luôn chừa cho Vua một "ô thở" bằng cách đi một Tốt lên. Khi tấn công, tìm cách loại quân đang canh hàng cuối trước.',
      en: 'Always give your king a "breathing square" by moving a pawn up. When attacking, get rid of the piece guarding the back rank first.',
    },
    rounds: [
      {
        mode: 'quiz',
        questions: [
          outcomeQuestion('R5k1/5ppp/8/8/8/8/8/6K1 b - - 0 1'),
          outcomeQuestion('R5k1/5pp1/7p/8/8/8/8/6K1 b - - 0 1'),
          outcomeQuestion('R4rk1/5ppp/8/8/8/8/8/6K1 b - - 0 1'),
          outcomeQuestion('4R1k1/5ppp/8/8/8/8/8/6K1 b - - 0 1'),
        ],
      },
      {
        mode: 'puzzle',
        anyMate: true,
        fen: 'k7/pp6/8/8/8/8/8/3R2K1 w - - 0 1',
        solution: ['d1d8'],
        prompt: {
          vi: 'Vua đen trốn trong góc sau hai Tốt. Xe đi đâu để chiếu hết?',
          en: 'The black king hides in the corner behind two pawns. Where does the rook go to mate?',
        },
      },
      {
        mode: 'puzzle',
        anyMate: true,
        fen: 'r5k1/5ppp/8/8/8/8/4R3/4R1K1 w - - 0 1',
        solution: ['e2e8', 'a8e8', 'e1e8'],
        prompt: {
          vi: 'Hai Xe cùng cột e. Thí một Xe để dụ Xe đen đi chỗ khác, rồi chiếu hết!',
          en: 'Two rooks stand on the e-file. Sacrifice one to lure the black rook away, then mate!',
        },
      },
    ],
    skills: ['rook', 'checkmate', 'tactics', 'back-rank'],
  },
  {
    id: 'xe-9',
    level: 'xe',
    order: 9,
    title: { vi: 'Hai Xe leo thang', en: 'Rook Ladder' },
    story: {
      vi: 'Hai chú Xe chơi trò leo thang: một chú đứng chắn ngang, chú kia chạy lên chiếu, rồi đổi vai cho nhau. Mỗi bậc thang đẩy Vua đen sát mép bàn cờ thêm một chút. Bông reo lên: "Hai Xe phối hợp thì Vua nào cũng phải chịu thua!"',
      en: 'Two rooks play ladder: one stands guard across a rank, the other runs up and gives check, then they swap roles. Every rung pushes the black king closer to the edge. Bong cheers: "Two rooks working together can beat any king!"',
    },
    goal: {
      vi: 'Dùng hai Xe để chiếu hết Vua đen.',
      en: 'Use two rooks to checkmate the black king.',
    },
    lesson: {
      vi: 'Một Xe chặn Vua ở một hàng, Xe kia chiếu — rồi đổi vai. Hai Xe nên đứng xa nhau để Vua không ăn được quân nào.',
      en: 'One rook cuts the king off along a rank while the other gives check — then swap. Keep the rooks far apart so the king can never attack one.',
    },
    rounds: [
      {
        mode: 'puzzle',
        anyMate: true,
        fen: '1k6/8/8/R7/8/8/7R/3K4 w - - 0 1',
        solution: ['h2h7', 'b8c8', 'a5a8'],
        prompt: {
          vi: 'Xe h2 lên hàng 7 để chặn Vua, rồi Xe a5 chiếu hết.',
          en: 'Send the h2 rook to the 7th rank to cut the king off, then mate with the a5 rook.',
        },
      },
      {
        mode: 'puzzle',
        anyMate: true,
        fen: '4k3/8/5R2/8/8/7R/8/7K w - - 0 1',
        solution: ['h3h7', 'e8d8', 'f6f8'],
        prompt: {
          vi: 'Chặn hàng 7 trước. Vua đen chỉ còn một bước để đi!',
          en: 'Cut off the 7th rank first. The black king will have just one square left!',
        },
      },
      { mode: 'mate', fen: '8/8/8/3k4/8/8/R7/1R2K3 w - - 0 1', engineLevel: 6, moveLimit: 12 },
    ],
    skills: ['rook', 'endgame', 'checkmate', 'coordination'],
  },
];
