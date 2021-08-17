import { ChessInstance } from "chess.js";
import untypedOpenings from "./openings.json";

export type Opening = {
  id: string;
  code: string;
  description: string;
  line: string;
};

export const openings: Opening[] = untypedOpenings;

const historyToSearchString = (moves: string[]) => {
  for (let i = 0; i < moves.length; i++) {
    if (i % 2 === 0) {
      const prefix = i / 2 + 1 + ".";
      if (!moves[i].startsWith(prefix)) {
        moves[i] = prefix + moves[i];
      }
    }
  }
  return moves.join(" ");
};

const norm = (str: string) => str.replace(/[\s+]/, "").toLowerCase();

const lineMatchesOpening =
  (matchLine: string) =>
  ({ line }: Opening) =>
    norm(line).startsWith(norm(matchLine));

export const getMatchingOpenings = (game: ChessInstance) => {
  const moves = game.history();
  if (moves.length === 0) {
    return [];
  }
  const searchString = historyToSearchString(moves);
  return openings.filter(lineMatchesOpening(searchString));
};

export const getPreciseLine = (game: ChessInstance): Opening | undefined => {
  return getMatchingOpenings(game).sort(
    (a, b) => a.line.length - b.line.length
  )[0];
};

export const getFavoredMoves = (
  favoredOpenings: Opening[],
  game: ChessInstance
) => {
  const history = game.history();

  const initialSet = favoredOpenings.filter(
    lineMatchesOpening(historyToSearchString(history))
  );
  const viableMoves = game.moves().filter((move) => {
    return initialSet.some((opening) => {
      const newHistory = history.slice();
      newHistory.push(move);
      const searchString = historyToSearchString(newHistory);
      debugger;
      return lineMatchesOpening(searchString)(opening);
    });
  });
  return viableMoves;
};
