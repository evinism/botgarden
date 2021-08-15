import * as ChessJS from "chess.js";
import { ChessInstance } from "chess.js";
import Chessboard from "chessboardjsx";
import { useEffect, useRef, useReducer } from "react";
import "./App.css";
import StockfishInstance, { MoveAnalyses } from "./stockfish";

const last = (a: number[]) => a[a.length - 1];

type MoveStrategy = (analyses: MoveAnalyses) => string;

function sortBy<T>(sorter: (item: T) => number, arr: T[]): T[] {
  return arr.sort((a, b) => sorter(a) - sorter(b));
}

const sum = (a: number[]) => a.reduce((a, b) => a + b, 0);
const avg = (a: number[]) => sum(a) / a.length;

const lowestOf =
  (sorter: (item: number[]) => number) => (moves: MoveAnalyses) =>
    sortBy(([, scores]) => sorter(scores), Object.entries(moves))[0][0];

const highestOf = (sorter: (item: number[]) => number) =>
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

function App() {
  const gameRef = useRef<ChessInstance | void>();
  const stockfish = useRef<StockfishInstance | void>();
  const forceUpdate = useReducer(() => ({}), {})[1] as () => void;

  useEffect(() => {
    gameRef.current = new (ChessJS as any)() as ChessInstance;
    stockfish.current = new StockfishInstance();
    forceUpdate();
    return stockfish.current.destructor;
    // eslint-disable-next-line
  }, []);
  if (!gameRef.current) {
    return <></>;
  }
  const game = gameRef.current;

  const makeButtonHandler = (strat: MoveStrategy) => () => {
    const analyses = stockfish.current?.getAnalyses(game.fen());
    analyses?.result.then((moves) => {
      const formatForChessJS = (str: string): ChessJS.ShortMove => {
        return {
          from: str.slice(0, 2),
          to: str.slice(2, 4),
          promotion: str.slice(4, 5) || "q",
        } as any;
      };

      game.move(formatForChessJS(strat(moves)));
      forceUpdate();
    });
  };

  return (
    <div className="App">
      <header className="App-header">
        {game.turn()} to move
        <Chessboard
          position={game.fen()}
          onDrop={({ sourceSquare, targetSquare }) => {
            game.move({
              from: sourceSquare,
              to: targetSquare,
              promotion: "q",
            });
            forceUpdate();
          }}
        />
        <button onClick={makeButtonHandler(moveStrategies.best)}>best</button>
        <button onClick={makeButtonHandler(moveStrategies.worst)}>worst</button>
        <button onClick={makeButtonHandler(moveStrategies.drawish)}>
          drawish
        </button>
        <button onClick={makeButtonHandler(moveStrategies.inscrutable)}>
          inscrutable
        </button>
        <button onClick={makeButtonHandler(moveStrategies.inscrutable2)}>
          inscrutable2
        </button>
      </header>
    </div>
  );
}

export default App;
