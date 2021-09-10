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
  builtin?: true;
  name: string;
  baseEngine: {
    maxDepth: number;
    timeout: number;
  };
  strategy: Strategy;
  preferredOpenings: Opening[];
}
