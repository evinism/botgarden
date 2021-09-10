import * as ChessJS from "chess.js";
import { ChessInstance } from "chess.js";
import { useEffect, useReducer, useRef } from "react";
import Analyzer from "./analyzer";

export const useAnalyzer = () => {
  const forceUpdate = useReducer(() => ({}), {})[1] as () => void;
  const analyzer = useRef<Analyzer | void>();

  useEffect(() => {
    analyzer.current = new Analyzer();
    forceUpdate();
    return analyzer.current.destructor;
    // eslint-disable-next-line
  }, []);
  return analyzer.current;
};

export const useGame = (): [
  ChessInstance | void,
  (move: ChessJS.ShortMove | string) => void
] => {
  const gameRef = useRef<ChessInstance | void>();
  const forceUpdate = useReducer(() => ({}), {})[1] as () => void;

  useEffect(() => {
    gameRef.current = new (ChessJS as any)() as ChessInstance;
    forceUpdate();
    // eslint-disable-next-line
  }, []);

  const makeMove = (move: ChessJS.ShortMove | string) => {
    gameRef.current?.move(move);
    forceUpdate();
  };
  return [gameRef.current, makeMove];
};
