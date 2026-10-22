import type { Square } from '@duongsinh/chess-core';
import type { LevelKey } from '@duongsinh/engine';

export type { LevelKey };

/** Chuỗi song ngữ. */
export interface L10n {
  vi: string;
  en: string;
}

/** Ăn sao / đi theo lộ trình / ăn hết quân đứng yên. Đối phương không đi. */
export interface CollectRound {
  mode: 'collect';
  fen: string;
  /** Ô có sao (hoặc ô có quân địch cần bắt). */
  targets: Square[];
  /** Phải lấy sao theo đúng thứ tự (Mê cung Mã). */
  ordered?: boolean;
  /** Đi vào ô bị quân địch khống chế là thua ("né bẫy"). */
  avoidAttacked?: boolean;
  /** Giới hạn số nước. */
  moveLimit?: number;
}

/** Đua phong cấp: bên nào phong cấp trước thắng; mất hết Tốt là thua. */
export interface RaceRound {
  mode: 'race';
  fen: string;
  engineLevel: number;
}

/** Chặn Tốt địch: không cho phong cấp trong `plies` nước của máy, hoặc bắt hết Tốt. */
export interface StopRound {
  mode: 'stop';
  fen: string;
  engineLevel: number;
  plies: number;
}

/** Sống sót: không để mất quân nào trong `plies` nước của mình. */
export interface SurviveRound {
  mode: 'survive';
  fen: string;
  engineLevel: number;
  plies: number;
}

/** Chiếu hết trong giới hạn nước (tàn cuộc). */
export interface MateRound {
  mode: 'mate';
  fen: string;
  engineLevel: number;
  moveLimit: number;
}

/** Bài tập: tìm đúng chuỗi nước. Nước của đối phương tự động. */
export interface PuzzleRound {
  mode: 'puzzle';
  fen: string;
  /** Chuỗi UCI xen kẽ người chơi / đối phương, bắt đầu bằng người chơi. */
  solution: string[];
  /** Chấp nhận mọi nước chiếu hết ở nước cuối. */
  anyMate?: boolean;
  prompt?: L10n;
}

export type Question =
  | { kind: 'find-square'; count: number }
  | { kind: 'squares'; prompt: L10n; fen?: string; answer: Square[]; highlight?: Square[] }
  | {
      kind: 'choice';
      prompt: L10n;
      fen?: string;
      options: L10n[];
      answer: number;
      highlight?: Square[];
    };

export interface QuizRound {
  mode: 'quiz';
  questions: Question[];
}

/** Ván đầy đủ với máy. */
export interface PlayRound {
  mode: 'play';
  fen: string;
  engineLevel: number;
}

export type Round =
  | CollectRound
  | RaceRound
  | StopRound
  | SurviveRound
  | MateRound
  | PuzzleRound
  | QuizRound
  | PlayRound;

export type Mode = Round['mode'];

export interface MiniGame {
  id: string;
  level: LevelKey;
  order: number;
  title: L10n;
  /** Câu chuyện mở đầu (có nhân vật). */
  story: L10n;
  /** Nhiệm vụ ngắn gọn hiển thị trên màn chơi. */
  goal: L10n;
  /** Mẹo nhỏ / bài học rút ra. */
  lesson: L10n;
  rounds: Round[];
  /** Kỹ năng rèn luyện (để HLV lọc). */
  skills: string[];
}

export interface LevelInfo {
  key: LevelKey;
  index: number;
  name: L10n;
  piece: 'p' | 'n' | 'b' | 'r' | 'q' | 'k';
  color: string;
  description: L10n;
}

export interface Endgame {
  id: string;
  title: L10n;
  description: L10n;
  round: MateRound | RaceRound;
  difficulty: 1 | 2 | 3;
}

export interface ClassicGame {
  id: string;
  title: L10n;
  white: string;
  black: string;
  event: string;
  year: number;
  pgn: string;
  intro: L10n;
  /** Lời bình theo số ply (1 = nước đầu của Trắng). */
  notes: Record<number, L10n>;
}
