import { Position, START_FEN } from './position';
import { moveToUci, parseSan, toSan } from './san';

export interface PgnMove {
  san: string;
  uci: string;
  fenAfter: string;
  comment?: string;
}

export interface PgnGame {
  tags: Record<string, string>;
  startFen: string;
  moves: PgnMove[];
  result: string;
  /** Lời bình trước nước đầu tiên. */
  intro?: string;
}

export class PgnError extends Error {
  constructor(
    message: string,
    readonly moveNumber?: number,
  ) {
    super(message);
    this.name = 'PgnError';
  }
}

const RESULTS = new Set(['1-0', '0-1', '1/2-1/2', '½-½', '*']);

/** Tách nhiều ván trong một file PGN. */
export function splitPgn(text: string): string[] {
  const games: string[] = [];
  let current: string[] = [];
  let inMoves = false;
  for (const line of text.replace(/\r\n?/g, '\n').split('\n')) {
    const isTag = /^\s*\[/.test(line);
    if (isTag && inMoves) {
      games.push(current.join('\n'));
      current = [];
      inMoves = false;
    }
    if (!isTag && line.trim()) inMoves = true;
    current.push(line);
  }
  if (current.join('').trim()) games.push(current.join('\n'));
  return games;
}

/** Đọc một ván PGN (bỏ qua biến phụ trong ngoặc tròn và NAG). */
export function parsePgn(text: string): PgnGame {
  const tags: Record<string, string> = {};
  const tagRe = /\[\s*(\w+)\s+"((?:[^"\\]|\\.)*)"\s*\]/g;
  let body = text.replace(/\r\n?/g, '\n');
  for (const m of body.matchAll(tagRe)) tags[m[1]!] = m[2]!.replace(/\\(.)/g, '$1');
  body = body.replace(tagRe, ' ');
  // Bỏ dòng chú thích bắt đầu bằng %, và comment kiểu ";" đến cuối dòng.
  body = body
    .split('\n')
    .filter((l) => !l.startsWith('%'))
    .join('\n');

  const startFen = tags.FEN ?? START_FEN;
  const pos = Position.fromFen(startFen);
  const moves: PgnMove[] = [];
  let result = tags.Result ?? '*';
  let intro: string | undefined;

  let i = 0;
  let depth = 0;
  const attachComment = (c: string) => {
    const text = c.trim();
    if (!text) return;
    const last = moves[moves.length - 1];
    if (last) last.comment = last.comment ? `${last.comment} ${text}` : text;
    else intro = intro ? `${intro} ${text}` : text;
  };
  while (i < body.length) {
    const ch = body[i]!;
    if (ch === '{') {
      const end = body.indexOf('}', i);
      const comment = body.slice(i + 1, end === -1 ? body.length : end);
      if (depth === 0) attachComment(comment);
      i = end === -1 ? body.length : end + 1;
      continue;
    }
    if (ch === ';') {
      const end = body.indexOf('\n', i);
      if (depth === 0) attachComment(body.slice(i + 1, end === -1 ? body.length : end));
      i = end === -1 ? body.length : end + 1;
      continue;
    }
    if (ch === '(') {
      depth++;
      i++;
      continue;
    }
    if (ch === ')') {
      depth = Math.max(0, depth - 1);
      i++;
      continue;
    }
    if (/\s/.test(ch)) {
      i++;
      continue;
    }
    let j = i;
    while (j < body.length && !/[\s{}();]/.test(body[j]!)) j++;
    const token = body.slice(i, j);
    i = j;
    if (depth > 0) continue;
    if (RESULTS.has(token)) {
      result = token === '½-½' ? '1/2-1/2' : token;
      continue;
    }
    if (token.startsWith('$')) continue;
    const san = token.replace(/^\d+\.(\.\.)?/, '').replace(/^\.+/, '');
    if (!san || /^\d+\.*$/.test(san)) continue;
    const move = parseSan(pos, san);
    if (!move) {
      throw new PgnError(`Nước đi không hợp lệ "${san}" tại nước ${pos.fullmove}`, pos.fullmove);
    }
    const legal = pos.legalMoves();
    const sanStd = toSan(pos, move, legal);
    pos.make(move);
    moves.push({ san: sanStd, uci: moveToUci(move), fenAfter: pos.toFen() });
  }
  return { tags, startFen, moves, result, ...(intro ? { intro } : {}) };
}

/** Xuất PGN từ danh sách SAN. */
export function toPgn(game: {
  tags?: Record<string, string>;
  startFen?: string;
  sans: string[];
  result?: string;
}): string {
  const result = game.result ?? '*';
  const tags: Record<string, string> = {
    Event: '?',
    Site: 'Dương Sinh Chess',
    Date: '????.??.??',
    White: '?',
    Black: '?',
    ...game.tags,
    Result: result,
  };
  const startFen = game.startFen ?? START_FEN;
  if (startFen !== START_FEN) {
    tags.SetUp = '1';
    tags.FEN = startFen;
  }
  const header = Object.entries(tags)
    .map(([k, v]) => `[${k} "${v.replace(/"/g, '\\"')}"]`)
    .join('\n');
  const pos = Position.fromFen(startFen);
  let num = pos.fullmove;
  let white = pos.turn === 'w';
  const parts: string[] = [];
  game.sans.forEach((san, idx) => {
    if (white) parts.push(`${num}.`);
    else if (idx === 0) parts.push(`${num}...`);
    parts.push(san);
    if (!white) num++;
    white = !white;
  });
  parts.push(result);
  const lines: string[] = [];
  let line = '';
  for (const p of parts) {
    if (line.length + p.length + 1 > 80) {
      lines.push(line);
      line = p;
    } else line = line ? `${line} ${p}` : p;
  }
  if (line) lines.push(line);
  return `${header}\n\n${lines.join('\n')}\n`;
}
