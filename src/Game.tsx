import Chessboard from "chessboardjsx";
import "./App.css";
import { chooseMove, defaultBots } from "./bot";
import { useGame, useStockfish } from "./hooks";

function Game() {
  const [game, move] = useGame();
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
          move({
            from: sourceSquare,
            to: targetSquare,
            promotion: "q",
          });
        }}
      />
      {defaultBots.map((botConfig) => (
        <button
          onClick={() => {
            stockfish.getAnalyses(game.fen()).then((moves) => {
              move(chooseMove(moves, botConfig));
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
