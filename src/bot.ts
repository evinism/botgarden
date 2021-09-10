import { MoveAnalyses } from "./stockfish";
import * as ChessJS from "chess.js";
import { ChessInstance } from "chess.js";
import { getFavoredMoves, Opening } from "./openings";
import jsonLogic from "json-logic-js";
import getFunction from "./getFunction";

const last = (a: number[]) => a[a.length - 1];

function sortBy<T>(sorter: (item: T) => number, arr: T[]): T[] {
  return arr.sort((a, b) => sorter(a) - sorter(b));
}

const lowestOf =
  (sorter: (item: MoveAnalyses[string]) => number) => (moves: MoveAnalyses) =>
    sortBy(([, scores]) => sorter(scores), Object.entries(moves))[0][0];

const highestOf = (sorter: (item: MoveAnalyses[string]) => number) =>
  lowestOf((item) => -sorter(item));

export const hardcodedStrategies = {
  best: highestOf(({ scores }) => last(scores)),
  worst: highestOf(({ scores }) => -last(scores)),
};

type Strategy =
  | {
      type: "hardcoded";
      id: keyof typeof hardcodedStrategies;
    }
  | {
      type: "scorer/jsonlogic";
      logic: jsonLogic.RulesLogic;
    }
  | {
      // DANGEROUS.
      type: "scorer/javascript";
      dangerous: true;
      function: string;
    };

export interface BotConfig {
  builtin?: true;
  name: string;
  baseEngine: {
    maxDepth: number;
    timeout: number;
  };
  strategy: Strategy;
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

  let strat: (moves: MoveAnalyses) => string;
  if (config.strategy.type === "hardcoded") {
    strat = hardcodedStrategies[config.strategy.id];
  } else if (config.strategy.type === "scorer/javascript") {
    // BE VERY WARY OF THIS.
    const fn = getFunction(config.strategy.function);
    if (typeof fn !== "function") {
      alert("Not a valid function for the bot!");
      throw new Error("Not a valid function for the bot");
    }
    strat = highestOf(fn);
  } else {
    const logic = config.strategy.logic;
    strat = highestOf((line) => jsonLogic.apply(logic, line));
  }

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

const drawishFnText = `function score({ scores }){
  return -Math.abs(scores[scores.length - 1])
}`;

const inscrutableFnText = `
function last(arr){
  return arr[arr.length - 1]
}

function score({ scores }) {
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
}`;

export const defaultBots: BotConfig[] = [
  {
    name: "Best",
    builtin: true,
    baseEngine: {
      maxDepth: 23,
      timeout: 1500,
    },
    strategy: {
      type: "scorer/jsonlogic",
      logic: {
        reduce: [{ var: "scores" }, { var: "current" }, 0],
      },
    },
    preferredOpenings: [],
  },
  {
    name: "Worst",
    builtin: true,
    strategy: {
      type: "scorer/jsonlogic",
      logic: {
        "-": {
          reduce: [{ var: "scores" }, { var: "current" }, 0],
        },
      },
    },
    baseEngine: {
      maxDepth: 23,
      timeout: 500,
    },
    preferredOpenings: [],
  },
  {
    name: "Drawish",
    builtin: true,
    strategy: {
      dangerous: true,
      type: "scorer/javascript",
      function: drawishFnText,
    },
    baseEngine: {
      maxDepth: 23,
      timeout: 1500,
    },
    preferredOpenings: [],
  },
  {
    name: "Inscrutable",
    builtin: true,
    strategy: {
      dangerous: true,
      type: "scorer/javascript",
      function: inscrutableFnText,
    },
    baseEngine: {
      maxDepth: 23,
      timeout: 1500,
    },
    preferredOpenings: [],
  },
  {
    name: "Shallow",
    builtin: true,
    baseEngine: {
      maxDepth: 1,
      timeout: 1500,
    },
    strategy: {
      type: "scorer/jsonlogic",
      logic: {
        reduce: [{ var: "scores" }, { var: "current" }, 0],
      },
    },
    preferredOpenings: [],
  },
];
