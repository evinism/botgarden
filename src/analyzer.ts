import StockfishInstance from "./stockfish";
import { AnalysisRequest, MoveAnalyses } from "./types";

const mapObject = <T, K>(fn: (arg: T) => K, obj: { [key: string]: T }) => {
  const newEntries = Object.entries(obj).map(([key, value]) => {
    const entry: [typeof key, K] = [key, fn(value)];
    return entry;
  });
  return Object.fromEntries(newEntries);
};

class Analyzer {
  stockfish: StockfishInstance;

  constructor() {
    this.stockfish = new StockfishInstance();
  }

  analyze(request: AnalysisRequest): Promise<MoveAnalyses> {
    return this.stockfish.getAnalyses(request).then((results) => {
      return mapObject(({ line, scores }) => {
        return {
          line,
          scores,
          overallScore: scores[scores.length - 1],
        };
      }, results);
    });
  }

  destructor = () => {
    this.stockfish.destructor();
  };
}

export default Analyzer;
