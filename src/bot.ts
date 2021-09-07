import { MoveAnalyses } from "./stockfish";
import * as ChessJS from "chess.js";
import { ChessInstance } from "chess.js";
import { getFavoredMoves, Opening } from "./openings";

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
  worst: lowestOf(({ scores }) => last(scores)),
  best: highestOf(({ scores }) => last(scores)),
  drawish: lowestOf(({ scores }) => Math.abs(last(scores))),
  inscrutable: highestOf(({ scores }) => last(scores) - avg(scores) / 1.5),
  inscrutable2: highestOf(({ scores }) => {
    const firstNegative = scores.findIndex((a) => a < 0);
    const firstPositive = scores.findIndex((a) => a > 0);
    if (firstPositive === -1 || last(scores) < 0) {
      return last(scores);
    }
    let multiplier = 1;
    if (firstNegative < firstPositive) {
      multiplier = firstPositive + 1;
    }
    console.log(scores, multiplier);
    return last(scores) * multiplier;
  }),
};

export interface BotConfig {
  name: string;
  baseEngine: {
    maxDepth: number;
    timeout: number;
  };
  shimStrategy: keyof typeof moveStrategies;
  preferredOpenings: Opening[];
}

export function chooseMove(
  lines: MoveAnalyses,
  config: BotConfig,
  game: ChessInstance
): ChessJS.ShortMove | string {
  const favoredMoves = getFavoredMoves(config.preferredOpenings, game);
  if (favoredMoves.length > 0) {
    return favoredMoves[Math.floor(Math.random() * favoredMoves.length)];
  }

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
    baseEngine: {
      maxDepth: 23,
      timeout: 1500,
    },
    shimStrategy: "best",
    preferredOpenings: [],
  },
  {
    name: "Worst",
    shimStrategy: "worst",
    baseEngine: {
      maxDepth: 23,
      timeout: 500,
    },
    preferredOpenings: [],
  },
  {
    name: "Drawish",
    shimStrategy: "drawish",
    baseEngine: {
      maxDepth: 23,
      timeout: 1500,
    },
    preferredOpenings: [],
  },
  {
    name: "Inscrutable",
    shimStrategy: "inscrutable2",
    baseEngine: {
      maxDepth: 23,
      timeout: 1500,
    },
    preferredOpenings: [],
  },
];
