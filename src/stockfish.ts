import Scheduler from "./scheduler";

interface StockfishOptions {
  timeout?: number;
}

export interface MoveAnalyses {
  [move: string]: {
    scores: number[];
    line: string[];
  };
}

const infoRegex =
  /^info depth ([0-9]+) seldepth [0-9]+ multipv [0-9]+ score (cp|mate) (-?[0-9]+) nodes [0-9]+ nps [0-9]+ time [0-9]+ pv(( \w+)+)$/;
class StockfishInstance {
  engine: Worker;
  depth: number;
  timeout: number;
  onmessage: ((message: string) => void) | null;
  scheduler: Scheduler;

  constructor(options: StockfishOptions = {}) {
    // probably won't reach before timeout
    this.depth = 22;
    this.timeout = options.timeout || 1500;
    this.engine = new Worker("stockfish/stockfish.js");
    this.scheduler = new Scheduler();

    this.engine.onmessage = this._handleMessage;
    this.onmessage = null;
    this._postMessage("setoption name MultiPV value 100");
    this._postMessage("setoption name UCI_AnalyseMode value true");
    (window as any).stockfish = this;
  }

  _postMessage(data: string) {
    console.log("send: " + data);
    this.engine.postMessage(data);
  }

  _handleMessage = ({ data }: MessageEvent) => {
    console.log("recv: " + data);
    if (this.onmessage) {
      this.onmessage(data);
    }
  };

  getAnalyses = (fen?: string) => {
    return this.getEngineAnalyses(fen);
  };

  getEngineAnalyses = (fen?: string): Promise<MoveAnalyses> =>
    this.scheduler.schedule(() => {
      return new Promise<MoveAnalyses>((resolve) => {
        if (fen) {
          this._postMessage("position fen " + fen);
        }
        this._postMessage("go depth " + this.depth);

        const moveAnalyses: MoveAnalyses = {};
        let hitDepth = 0;
        const recordAnalysis = (
          depth: number,
          cp: number,
          move: string,
          line: string[]
        ) => {
          const curArray = (moveAnalyses[move]?.scores || []).slice();
          let curLine = (moveAnalyses[move]?.line || []).slice();

          curArray[depth - 1] = cp;
          if (line.length > curLine.length) {
            curLine = line;
          }
          moveAnalyses[move] = {
            line: curLine,
            scores: curArray,
          };
          if (depth > hitDepth) {
            hitDepth = depth;
          }
        };

        const finish = () => {
          this.onmessage = null;
          clearTimeout(timeout);
          resolve(moveAnalyses);
        };
        const timeout = setTimeout(() => {
          this._postMessage("stop");
        }, this.timeout);

        this.onmessage = (data) => {
          if (data.indexOf("bestmove") === 0) {
            // Found a result!! I don't actually care what it is.
            finish();
          } else if (data.indexOf("info") === 0) {
            const res = infoRegex.exec(data);
            if (!res) {
              return;
            }
            const depth = parseInt(res[1], 10);
            const mateLine = res[2] === "mate";
            let cp = parseInt(res[3], 10);
            if (mateLine) {
              cp = 10000000 / cp;
            }
            const line = res[4].substring(1).split(" ");
            const move = line[0];
            recordAnalysis(depth, cp, move, line);
          }
        };
      });
    });

  flip = () => {
    this._postMessage("flip");
  };

  destructor = () => {
    this.engine.terminate();
  };
}

export default StockfishInstance;
