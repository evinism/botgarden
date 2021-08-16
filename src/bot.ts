import { MoveAnalyses } from "./stockfish";
import * as ChessJS from "chess.js";

const last = (a: number[]) => a[a.length - 1];

function sortBy<T>(sorter: (item: T) => number, arr: T[]): T[] {
  return arr.sort((a, b) => sorter(a) - sorter(b));
}

const sum = (a: number[]) => a.reduce((a, b) => a + b, 0);
const avg = (a: number[]) => sum(a) / a.length;

const lowestOf =
  (sorter: (item: MoveAnalyses[string]) => number) => (moves: MoveAnalyses) =>
    sortBy(([, scores]) => sorter(scores), Object.entries(moves))[0][0];

const highestOf = (sorter: (item: MoveAnalyses[string]) => number) =>
  lowestOf((item) => -sorter(item));

const moveStrategies = {
  worst: lowestOf((scores) => last(scores)),
  best: highestOf((scores) => last(scores)),
  drawish: lowestOf((scores) => Math.abs(last(scores))),
  inscrutable: highestOf((scores) => last(scores) - avg(scores) / 1.5),
  inscrutable2: highestOf((scores) => {
    const idx = scores.findIndex((a) => a > 0);
    if (idx === -1 || last(scores) < 0) {
      return last(scores);
    }
    return last(scores) * Math.sqrt(idx + 1);
  }),
};

export interface BotConfig {
  name: string;
  shimStrategy: keyof typeof moveStrategies;
}

export function chooseMove(
  lines: MoveAnalyses,
  config: BotConfig
): ChessJS.ShortMove {
  const strat = moveStrategies[config.shimStrategy];
  const rawMove = strat(lines);

  const formatForChessJS = (str: string): ChessJS.ShortMove => {
    return {
      from: str.slice(0, 2),
      to: str.slice(2, 4),
      promotion: str.slice(4, 5) || "q",
    } as any;
  };
  return formatForChessJS(rawMove);
}

export const defaultBots: BotConfig[] = [
  {
    name: "Best",
    shimStrategy: "best",
  },
  {
    name: "Worst",
    shimStrategy: "worst",
  },
  {
    name: "Drawish",
    shimStrategy: "drawish",
  },
  {
    name: "Inscrutable",
    shimStrategy: "inscrutable2",
  },
];
