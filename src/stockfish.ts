interface StockfishOptions {
  timeout?: number;
}

export interface MoveAnalyses {
  [move: string]: number[];
}

interface AnalysesResponse {
  result: Promise<MoveAnalyses>;
  setProgressCb: (cb: (depth: number) => void) => void;
}

const infoRegex =
  /info depth ([0-9]+) seldepth [0-9]+ multipv [0-9]+ score cp (-?[0-9]+) nodes [0-9]+ nps [0-9]+ time [0-9]+ pv (\w+)/;
class StockfishInstance {
  engine: Worker;
  depth: number;
  timeout: number;

  constructor(options: StockfishOptions = {}) {
    // probably won't reach before timeout
    this.depth = 22;
    this.timeout = options.timeout || 1500;
    this.engine = new Worker("stockfish/stockfish.js");
    this.engine.onmessage = ({ data }) => console.log(data);
    this.engine.postMessage("setoption name MultiPV value 100");
    this.engine.postMessage("setoption name UCI_AnalyseMode value true");
    (window as any).stockfish = this;
  }

  getAnalyses(fen?: string): AnalysesResponse {
    if (fen) {
      this.engine.postMessage("position fen " + fen);
    }
    this.engine.postMessage("go depth " + this.depth);

    const moveAnalyses: MoveAnalyses = {};
    let progressCb: (depth: number) => void = () => {};
    const setProgressCb = (cb: (depth: number) => void) => {
      progressCb = cb;
    };
    let hitDepth = 0;
    const recordAnalysis = (depth: number, cp: number, move: string) => {
      const curArray = (moveAnalyses[move] || []).slice();
      curArray[depth - 1] = cp;
      moveAnalyses[move] = curArray;
      if (depth > hitDepth) {
        progressCb(depth);
        hitDepth = depth;
      }
    };

    const result = new Promise<MoveAnalyses>((resolve) => {
      const finish = () => {
        this.engine.onmessage = null;
        clearTimeout(timeout);
        resolve(moveAnalyses);
      };
      const timeout = setTimeout(() => {
        this.engine.postMessage("stop");
      }, this.timeout);

      this.engine.onmessage = ({ data }) => {
        if (data.indexOf("bestmove") === 0) {
          // Found a result!! I don't actually care what it is.
          finish();
        } else if (data.indexOf("info") === 0) {
          const res = infoRegex.exec(data);
          if (!res) {
            return;
          }
          const depth = parseInt(res[1], 10);
          const cp = parseInt(res[2], 10);
          const move = res[3];
          recordAnalysis(depth, cp, move);
        }
      };
    });
    return {
      result,
      setProgressCb,
    };
  }

  flip = () => {
    this.engine.postMessage("flip");
  };

  destructor = () => {
    this.engine.terminate();
  };
}

export default StockfishInstance;
