import { RulesLogic } from "json-logic-js";

export type Player =
  | {
      type: "interactive";
    }
  | {
      type: "bot";
      config: BotConfig;
    };

export type Participants = {
  b: Player;
  w: Player;
};

export type Opening = {
  id: string;
  code: string;
  description: string;
  line: string;
};

export type Strategy =
  | {
      type: "hardcoded";
      id: "best" | "worst";
    }
  | {
      type: "scorer/jsonlogic";
      logic: RulesLogic;
    }
  | {
      // DANGEROUS.
      type: "scorer/javascript";
      dangerous: true;
      function: string;
    };

export interface BotConfig {
  builtin: boolean;
  name: string;
  baseEngine: {
    maxDepth: number;
    timeout: number;
  };
  strategy: Strategy;
  preferredOpenings: Opening[];
}

export type AppState =
  | {
      state: "home";
    }
  | {
      state: "playing";
      bot: BotConfig;
    }
  | {
      state: "editing";
      initialBotConfig: BotConfig;
      botId?: string;
    };

export interface AnalysisRequest {
  fen: string;
  depth: number;
  timeout: number;
}

export interface EngineMoveAnalyses {
  [move: string]: {
    scores: number[];
    line: string[];
  };
}
export interface MoveAnalyses {
  [move: string]: {
    scores: number[];
    line: string[];
    overallScore: number;
  };
}
