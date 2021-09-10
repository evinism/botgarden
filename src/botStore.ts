import { BotConfig } from "./types";

const drawishFnText = `function score({ overallScore }){
  return -Math.abs(overallScore)
}`;

const inscrutableFnText = `
function score({ scores, overallScore }) {
  const firstNegative = scores.findIndex((a) => a < 0);
  const firstPositive = scores.findIndex((a) => a > 0);
  if (firstPositive === -1 || overallScore < 0) {
    return overallScore;
  }
  let multiplier = 1;
  if (firstNegative < firstPositive) {
    multiplier = firstPositive + 1;
  }
  console.log(scores, multiplier);
  return overallScore * multiplier;
}`;

export const defaultBots: { [key: string]: BotConfig } = {
  best: {
    name: "Best",
    builtin: true,
    baseEngine: {
      maxDepth: 23,
      timeout: 1500,
    },
    strategy: {
      type: "hardcoded",
      id: "best",
    },
    preferredOpenings: [],
  },
  worst: {
    name: "Worst",
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
};

const lsKey = "bots-key2";

let localBotStore: typeof defaultBots = defaultBots;
//JSON.parse(localStorage.getItem(lsKey) || "null") || defaultBots;

export function getAllBots() {
  return localBotStore;
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
  localStorage.setItem(lsKey, JSON.stringify(localBotStore));
}

export function remove(id: string) {
  localBotStore = Object.assign({}, localBotStore);
  delete localBotStore[id];
  localStorage.setItem(lsKey, JSON.stringify(localBotStore));
}
