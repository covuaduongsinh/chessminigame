import { attacksQuestion, bishopReachQuestion, colorQuestion } from '../questions';
import type { MiniGame } from '../types';

export const TUONG: MiniGame[] = [
  {
    id: 'tuong-1',
    level: 'tuong',
    order: 1,
    title: { vi: 'Tượng ăn sao', en: 'Bishop Star Hunt' },
    story: {
      vi: 'Tượng thích đi đường chéo, đi xa bao nhiêu cũng được nếu không có ai cản. Na phát hiện: sao của Tượng ô đen luôn nằm trên ô đen!',
      en: "Bishops slide along diagonals as far as they like. Na notices: the dark bishop's stars are always on dark squares!",
    },
    goal: { vi: 'Đưa Tượng ăn hết sao.', en: 'Collect all the stars with the bishop.' },
    lesson: { vi: 'Tượng không bao giờ đổi màu ô.', en: 'A bishop never changes square colour.' },
    rounds: [
      { mode: 'collect', fen: '8/8/8/8/8/8/8/2B5 w - - 0 1', targets: ['e3', 'g5', 'd8', 'a5'] },
      { mode: 'collect', fen: '8/8/8/8/8/8/8/5B2 w - - 0 1', targets: ['b5', 'e8', 'h5', 'd1'] },
    ],
    skills: ['bishop'],
  },
  {
    id: 'tuong-2',
    level: 'tuong',
    order: 2,
    title: { vi: 'Tượng ô trắng, Tượng ô đen', en: 'Light & Dark Bishops' },
    story: {
      vi: 'Mỗi bên có hai Tượng: một chú sống ở ô trắng, một chú sống ở ô đen. Chúng là hai anh em không bao giờ gặp nhau trên cùng một ô.',
      en: 'Each side has two bishops: one lives on light squares, one on dark. Brothers who never meet on the same square.',
    },
    goal: { vi: 'Trả lời đúng các câu hỏi về Tượng.', en: 'Answer the bishop questions.' },
    lesson: {
      vi: 'Tượng ở trung tâm khống chế tới 13 ô; ở góc chỉ có 7 ô.',
      en: 'A central bishop controls 13 squares; in the corner only 7.',
    },
    rounds: [
      {
        mode: 'quiz',
        questions: [
          attacksQuestion('8/8/8/8/3B4/8/8/8 w - - 0 1', 'd4', {
            vi: 'Chạm hết các ô mà Tượng d4 khống chế.',
            en: 'Tap every square the bishop on d4 controls.',
          }),
          colorQuestion('d4'),
          bishopReachQuestion('c1', 'h6'),
          bishopReachQuestion('f1', 'f2'),
          bishopReachQuestion('a1', 'h8'),
          attacksQuestion('8/8/8/8/8/8/8/B7 w - - 0 1', 'a1', {
            vi: 'Tượng ở góc a1 khống chế những ô nào?',
            en: 'Which squares does the bishop in the a1 corner control?',
          }),
        ],
      },
    ],
    skills: ['bishop', 'board-vision'],
  },
  {
    id: 'tuong-3',
    level: 'tuong',
    order: 3,
    title: { vi: 'Tượng đấu Tốt', en: 'Bishop vs Pawns' },
    story: {
      vi: 'Hai chú Tốt đen muốn phong cấp. Tượng trắng đứng từ xa vẫn canh được đường đi của chúng — đó là sức mạnh của đường chéo dài.',
      en: 'Two black pawns want to promote. The white bishop can guard their path from far away — the power of long diagonals.',
    },
    goal: {
      vi: 'Không cho Tốt đen phong cấp trong 8 nước, hoặc bắt hết chúng.',
      en: 'Stop the black pawns for 8 moves, or capture them all.',
    },
    lesson: {
      vi: 'Tượng chặn Tốt bằng cách khống chế ô phía trước Tốt. Tốt phong cấp ở ô cùng màu với Tượng thì Tượng mới chặn được.',
      en: 'A bishop stops pawns by controlling the squares in front of them — but only on its own colour.',
    },
    rounds: [{ mode: 'stop', fen: '8/8/8/1p5p/8/8/8/5B2 w - - 0 1', engineLevel: 2, plies: 8 }],
    skills: ['bishop', 'endgame'],
  },
  {
    id: 'tuong-4',
    level: 'tuong',
    order: 4,
    title: { vi: 'Đòn Ghim', en: 'The Pin' },
    story: {
      vi: 'Khi một quân đứng chắn trước Vua của nó, quân đó bị "ghim" — nếu nó bỏ đi, Vua sẽ bị chiếu. An gọi đó là "đóng đinh quân địch".',
      en: 'When a piece stands in front of its own king, it is pinned — if it moves away, the king is in check. An calls it "nailing the enemy down".',
    },
    goal: { vi: 'Tìm nước Tượng ghim quân đối phương.', en: 'Find the bishop move that pins.' },
    lesson: {
      vi: 'Quân bị ghim vào Vua không được phép di chuyển ra khỏi đường ghim.',
      en: 'A piece pinned to its king may not leave the line of the pin.',
    },
    rounds: [
      {
        mode: 'puzzle',
        fen: '4k3/8/2n5/8/8/8/8/4KB2 w - - 0 1',
        solution: ['f1b5'],
        prompt: { vi: 'Ghim Mã đen vào Vua.', en: 'Pin the black knight to its king.' },
      },
      {
        mode: 'puzzle',
        fen: '7k/8/8/4q3/8/8/8/K1B5 w - - 0 1',
        solution: ['c1b2'],
        prompt: {
          vi: 'Vua trắng đang bị chiếu! Chặn chiếu và ghim luôn Hậu đen.',
          en: 'White is in check! Block it and pin the black queen at the same time.',
        },
      },
      {
        mode: 'puzzle',
        fen: '6k1/8/4r3/8/8/8/8/5BK1 w - - 0 1',
        solution: ['f1c4'],
        prompt: { vi: 'Ghim Xe đen vào Vua.', en: 'Pin the black rook to its king.' },
      },
    ],
    skills: ['bishop', 'tactics', 'pin'],
  },
  {
    id: 'tuong-5',
    level: 'tuong',
    order: 5,
    title: { vi: 'Đừng để mất quân', en: "Don't Get Caught" },
    story: {
      vi: 'Xe và Mã đen đang săn Tượng trắng. Minh nhắc: "Mỗi nước đi, nhìn xem quân địch nhắm vào những ô nào đã!"',
      en: 'A black rook and knight are hunting the white bishop. Minh reminds: "Before each move, look at which squares the enemies aim at!"',
    },
    goal: { vi: 'Giữ Tượng an toàn trong 8 nước.', en: 'Keep the bishop safe for 8 moves.' },
    lesson: {
      vi: 'Quân an toàn khi đứng ở ô không bị tấn công hoặc được bảo vệ.',
      en: 'A piece is safe on a square that is not attacked, or is protected.',
    },
    rounds: [{ mode: 'survive', fen: 'r6n/8/8/8/3B4/8/8/8 w - - 0 1', engineLevel: 3, plies: 8 }],
    skills: ['bishop', 'safety'],
  },
  {
    id: 'tuong-6',
    level: 'tuong',
    order: 6,
    title: { vi: 'Tượng và Mã phối hợp', en: 'Bishop & Knight Team' },
    story: {
      vi: 'Tượng nhanh trên đường dài, Mã khéo ở chỗ hẹp. Hai bạn cùng nhau đi nhặt sao — phân công thế nào cho nhanh nhất?',
      en: 'The bishop is fast on long roads, the knight is nimble in tight spots. How should they share the work to be quickest?',
    },
    goal: { vi: 'Dùng cả Tượng và Mã ăn hết sao.', en: 'Use both pieces to collect every star.' },
    lesson: {
      vi: 'Mỗi quân có điểm mạnh riêng — phối hợp tốt thì cả đội mạnh hơn.',
      en: 'Every piece has its own strengths — teamwork makes the team stronger.',
    },
    rounds: [
      {
        mode: 'collect',
        fen: '8/8/8/8/8/8/8/2B3N1 w - - 0 1',
        targets: ['b2', 'h3', 'e5', 'f4', 'c6'],
      },
    ],
    skills: ['bishop', 'knight', 'coordination'],
  },
];
