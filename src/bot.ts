import * as ChessJS from "chess.js";
import { ChessInstance } from "chess.js";
import { getFavoredMoves } from "./openings";
import jsonLogic from "json-logic-js";
import getFunction from "./getFunction";
import { BotConfig, MoveAnalyses } from "./types";
import mistql from "mistql/dist/esm";

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
  best: highestOf(({ scoreAtDepth }) => last(scoreAtDepth)),
  worst: highestOf(({ scoreAtDepth }) => -last(scoreAtDepth)),
};

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
  } else if (config.strategy.type === "scorer/mistql") {
    const query = config.strategy.query;
    strat = highestOf((line) => mistql.query(query, line));
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
