import Chessboard from "chessboardjsx";
import { useEffect } from "react";
import "./App.css";
import { chooseMove, defaultBots, BotConfig } from "./bot";
import { useGame, useStockfish } from "./hooks";

type Player =
  | {
      type: "interactive";
    }
  | {
      type: "bot";
      config: BotConfig;
    };

type Participants = {
  b: Player;
  w: Player;
};

interface GameProps {
  participants?: Participants;
}

const defaultParticipants: Participants = {
  b: {
    type: "bot",
    config: defaultBots[1],
  },
  w: {
    type: "interactive",
  },
};

function Game({ participants = defaultParticipants }: GameProps) {
  const [game, move] = useGame();
  const stockfish = useStockfish();
  let turn = game?.turn();
  let activeParticipant = turn && participants[turn];

  useEffect(() => {
    if (!game || !stockfish || !activeParticipant) {
      return;
    }
    if (
      activeParticipant &&
      activeParticipant.type === "bot" &&
      !game.game_over()
    ) {
      const config = activeParticipant.config;
      stockfish.getAnalyses(game.fen()).then((moves) => {
        move(chooseMove(moves, config));
      });
    }
  }, [activeParticipant, game, move, stockfish]);

  if (!game || !stockfish) {
    return <></>;
  }

  // reinit with actively defined items
  turn = game.turn();
  activeParticipant = participants[turn];

  let overlay: React.ReactNode | undefined;
  if (game.game_over()) {
    let inner: React.ReactNode;
    if (game.in_checkmate()) {
      inner = `${game.turn() === "b" ? "White" : "Black"} is victorious`;
    } else if (game.in_stalemate()) {
      inner = "Draw via Stalemate";
    } else if (game.in_threefold_repetition()) {
      inner = "Draw via Threefold Repetition";
    } else if (game.insufficient_material()) {
      inner = "Draw via Insufficient Material";
    }
    overlay = (
      <div className="gameboard-overlay">
        <div className="gameboard-overlay-card">{inner}</div>
      </div>
    );
  }

  return (
    <>
      {game.turn()} to move
      <div className="gameboard-wrapper">
        <div className="gameboard">
          <Chessboard
            position={game.fen()}
            draggable={
              !game.game_over() && activeParticipant.type === "interactive"
            }
            onDrop={({ sourceSquare, targetSquare }) => {
              move({
                from: sourceSquare,
                to: targetSquare,
                promotion: "q",
              });
            }}
          />
        </div>
        {overlay}
      </div>
    </>
  );
}

export default Game;
