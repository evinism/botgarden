import * as ChessJS from "chess.js";
import { ChessInstance } from "chess.js";
import { useEffect, useReducer, useRef } from "react";
import StockfishInstance from "./stockfish";

export const useStockfish = () => {
  const forceUpdate = useReducer(() => ({}), {})[1] as () => void;
  const stockfish = useRef<StockfishInstance | void>();

  useEffect(() => {
    stockfish.current = new StockfishInstance();
    forceUpdate();
    return stockfish.current.destructor;
    // eslint-disable-next-line
  }, []);
  return stockfish.current;
};

export const useGame = () => {
  const gameRef = useRef<ChessInstance | void>();
  const forceUpdate = useReducer(() => ({}), {})[1] as () => void;

  useEffect(() => {
    gameRef.current = new (ChessJS as any)() as ChessInstance;
    forceUpdate();
    // eslint-disable-next-line
  }, []);
  return gameRef.current;
};
