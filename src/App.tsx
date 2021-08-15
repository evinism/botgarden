import * as ChessJS from "chess.js";
import { ChessInstance } from "chess.js";
import Chessboard from "chessboardjsx";
import { useEffect, useRef, useReducer } from "react";
import "./App.css";
import StockfishInstance from "./stockfish";

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
      </header>
    </div>
  );
}

export default App;
