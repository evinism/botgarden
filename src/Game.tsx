import Chessboard from "chessboardjsx";
import { useReducer } from "react";
import "./App.css";
import { chooseMove, defaultBots } from "./bot";
import { useGame, useStockfish } from "./hooks";

function Game() {
  const forceUpdate = useReducer(() => ({}), {})[1] as () => void;
  const game = useGame();
  const stockfish = useStockfish();

  if (!game || !stockfish) {
    return <></>;
  }

  return (
    <>
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
      {defaultBots.map((botConfig) => (
        <button
          onClick={() => {
            stockfish.getAnalyses(game.fen()).then((moves) => {
              game.move(chooseMove(moves, botConfig));
              forceUpdate();
            });
          }}
        >
          {botConfig.name}
        </button>
      ))}
    </>
  );
}

export default Game;
