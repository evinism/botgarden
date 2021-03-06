import Scheduler from "./scheduler";
import { AnalysisRequest, EngineMoveAnalyses } from "./types";

interface StockfishOptions {}

type AnalysisOptions = Partial<AnalysisRequest>;

const infoRegex =
  /^info depth ([0-9]+) seldepth [0-9]+ multipv [0-9]+ score (cp|mate) (-?[0-9]+) nodes [0-9]+ nps [0-9]+ time [0-9]+ pv(( \w+)+)$/;
class StockfishInstance {
  engine: Worker;
  onmessage: ((message: string) => void) | null;
  scheduler: Scheduler;

  constructor(_: StockfishOptions = {}) {
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

  getAnalyses = ({ fen = "", depth = 23, timeout = 1000 }: AnalysisOptions) => {
    return this._getEngineAnalyses({ fen, depth, timeout });
  };

  _getEngineAnalyses = ({
    fen,
    depth,
    timeout,
  }: AnalysisRequest): Promise<EngineMoveAnalyses> =>
    this.scheduler.schedule(() => {
      return new Promise<EngineMoveAnalyses>((resolve) => {
        if (fen) {
          this._postMessage("position fen " + fen);
        }
        this._postMessage("go depth " + depth);

        const moveAnalyses: EngineMoveAnalyses = {};
        let hitDepth = 0;
        const recordAnalysis = (
          depth: number,
          cp: number,
          move: string,
          line: string[]
        ) => {
          const curArray = (moveAnalyses[move]?.scoreAtDepth || []).slice();
          let curLine = (moveAnalyses[move]?.rawMoves || []).slice();

          curArray[depth - 1] = cp;
          if (line.length > curLine.length) {
            curLine = line;
          }
          moveAnalyses[move] = {
            rawMoves: curLine,
            scoreAtDepth: curArray,
          };
          if (depth > hitDepth) {
            hitDepth = depth;
          }
        };

        const finish = () => {
          this.onmessage = null;
          clearTimeout(timeoutId);
          resolve(moveAnalyses);
        };
        const timeoutId = setTimeout(() => {
          this._postMessage("stop");
        }, timeout);

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
