import * as ChessJS from "chess.js";
import { ChessInstance } from "chess.js";
import StockfishInstance from "./stockfish";
import { AnalysisRequest, MoveAnalyses } from "./types";

const mapObject = <T, K>(fn: (arg: T) => K, obj: { [key: string]: T }) => {
  const newEntries = Object.entries(obj).map(([key, value]) => {
    const entry: [typeof key, K] = [key, fn(value)];
    return entry;
  });
  return Object.fromEntries(newEntries);
};

const pieceValue: { [key: string]: number } = {
  p: 1,
  n: 3,
  b: 3,
  r: 5,
  q: 9,
};

const getMaterialCount = (game: ChessInstance) => {
  const pieces = game
    .board()
    .reduce((arr, cur) => [...arr, ...cur], [])
    .filter((piece) => piece);
  let whiteMaterial = 0;
  let blackMaterial = 0;
  pieces.forEach((piece) => {
    if (!piece) {
      return;
    }
    const value = pieceValue[piece.type] || 0;
    if (piece.color === "w") {
      whiteMaterial += value;
    } else {
      blackMaterial += value;
    }
  });
  return [whiteMaterial, blackMaterial];
};

class Analyzer {
  stockfish: StockfishInstance;

  constructor() {
    this.stockfish = new StockfishInstance();
  }

  analyze(request: AnalysisRequest): Promise<MoveAnalyses> {
    return this.stockfish.getAnalyses(request).then((results) => {
      return mapObject(
        ({ rawMoves, scoreAtDepth }) => ({
          rawMoves,
          scoreAtDepth,
          overallScore: scoreAtDepth[scoreAtDepth.length - 1],
          line: rawMoves.map((m, idx, arr) => {
            const game = new (ChessJS as any)(request.fen) as ChessInstance;
            const whoseTurnOriginally = game.turn();
            arr.slice(0, idx).forEach((move) => {
              game.move(move, { sloppy: true });
            });
            const history = game.history({ verbose: true });
            const lastMove = history[history.length - 1];
            const [wM, bM] = getMaterialCount(game);
            let materialDiff = whoseTurnOriginally === "w" ? wM - bM : bM - wM;
            return {
              moveText: m,
              materialAdvantage: materialDiff,
              flags: lastMove,
            };
          }),
        }),
        results
      );
    });
  }

  destructor = () => {
    this.stockfish.destructor();
  };
}

export default Analyzer;
