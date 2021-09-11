import { BotConfig } from "./types";
import JSONLogic from "json-logic-js";

const drawishFnText = `function score({ overallScore }){
\treturn -Math.abs(overallScore)
}`;

const inscrutableFnText = `
function score(lineAnalysis) {
\tconst { scoreAtDepth, overallScore } = lineAnalysis
\tconst firstNegative = scoreAtDepth.findIndex((a) => a < 0);
\tconst firstPositive = scoreAtDepth.findIndex((a) => a > 0);
\tif (firstPositive === -1 || overallScore < -1) {
\t\treturn overallScore;
\t}
\tlet modifier = 0;
\tif (firstNegative < firstPositive) {
\t\tmodifier = firstPositive + 100;
\t}
\tconsole.log(lineAnalysis);
\treturn overallScore + modifier;
}`;

/*
const sacrificialFnText = `function score({overallScore, line}){
\tconst earlyMaterialAdvantage = line
\t\t.slice(0, 6)
\t\t.map((move) => move.materialAdvantage)
\t\t.reduce((a, b) => a + b, 0) / 6;
\tconsole.log(line);
\treturn overallScore - earlyMaterialAdvantage * 100;
}`;
*/

const aggressiveFnTest = `function score({overallScore, line}){
\tconst earlyMaterialAdvantage = line
\t\t.slice(0, 6)
\t\t.map((move) => move.materialAdvantage)
\t\t.reduce((a, b) => a + b, 0) / 6;
\tconsole.log(line);
\treturn overallScore + earlyMaterialAdvantage * 400;
}`;

export const defaultBots: { [key: string]: BotConfig } = {
  best: {
    name: "Best",
    description: "Plays the best move possible",
    builtin: true,
    baseEngine: {
      maxDepth: 23,
      timeout: 3000,
    },
    strategy: {
      type: "hardcoded",
      id: "best",
    },
    preferredOpenings: [],
  },
  worst: {
    name: "Worst",
    description: "Plays the worst move possible",
    builtin: true,
    strategy: {
      type: "hardcoded",
      id: "worst",
    },
    baseEngine: {
      maxDepth: 23,
      timeout: 500,
    },
    preferredOpenings: [],
  },
  drawish: {
    name: "Drawish",
    description: "Equalizes the position, whether winning or losing",
    builtin: true,
    strategy: {
      dangerous: true,
      type: "scorer/javascript",
      function: drawishFnText,
    },
    baseEngine: {
      maxDepth: 23,
      timeout: 1500,
    },
    preferredOpenings: [],
  },
  inscrutable: {
    name: "Inscrutable",
    description: "Values unintuitive moves more highly",
    builtin: true,
    strategy: {
      dangerous: true,
      type: "scorer/javascript",
      function: inscrutableFnText,
    },
    baseEngine: {
      maxDepth: 23,
      timeout: 1500,
    },
    preferredOpenings: [],
  },
  shallow: {
    name: "Shallow",
    description: "Low-depth Engine",
    builtin: true,
    baseEngine: {
      maxDepth: 1,
      timeout: 1500,
    },
    strategy: {
      type: "hardcoded",
      id: "best",
    },
    preferredOpenings: [],
  },
  aggressive: {
    name: "Aggressive",
    description: "Highly values short-term material advantage",
    builtin: true,
    baseEngine: {
      maxDepth: 23,
      timeout: 1500,
    },
    strategy: {
      dangerous: true,
      type: "scorer/javascript",
      function: aggressiveFnTest,
    },
    preferredOpenings: [],
  },
};

export const defaultJS = `/*
Looks for a function named "score"
Should take a lineAnalysis and return a number.
*/

function score(lineAnalysis){
\treturn lineAnalysis.overallScore;
}
`;

export const defaultJSONLogic: JSONLogic.RulesLogic = { var: "overallScore" };
export const skeleton: BotConfig = {
  builtin: false,
  name: "New Bot",
  description: "",
  baseEngine: {
    maxDepth: 23,
    timeout: 1500,
  },
  strategy: {
    type: "scorer/javascript",
    dangerous: true,
    function: defaultJS,
  },
  preferredOpenings: [],
};

const lsKey = "bots-key2";

let localBotStore: typeof defaultBots = Object.assign(
  JSON.parse(localStorage.getItem(lsKey) || "null") || {},
  defaultBots
);

export function getAllBots() {
  return localBotStore;
}

function _persist() {
  localStorage.setItem(lsKey, JSON.stringify(localBotStore));
}

export function save(
  bot: BotConfig,
  id = "user-" + (Math.random() * 1000).toString(18)
) {
  localBotStore = {
    ...localBotStore,
    [id]: {
      ...bot,
      builtin: false,
    },
  };
  _persist();
}

export function remove(id: string) {
  localBotStore = Object.assign({}, localBotStore);
  delete localBotStore[id];
  _persist();
}
