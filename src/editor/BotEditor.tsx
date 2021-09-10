import { makeStyles } from "@material-ui/styles";
import { useState } from "react";
import { BotConfig } from "../bot";
import Game from "../Game";
import BotForm from "./BotForm";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
  },
}));

interface BotEditorProps {
  initialBot?: BotConfig;
  close?: () => void;
  save?: (botConfig: BotConfig) => void;
}

const skeleton: BotConfig = {
  name: "New Bot",
  baseEngine: {
    maxDepth: 23,
    timeout: 1500,
  },
  strategy: {
    type: "scorer/jsonlogic",
    logic: { reduce: [{ var: "scores" }, { var: "current" }, 0] },
  },
  preferredOpenings: [],
};

const BotEditor = ({ initialBot = skeleton, close, save }: BotEditorProps) => {
  const styles = useStyles();
  const [botConfig, setBotConfig] = useState<BotConfig>(() =>
    JSON.parse(JSON.stringify(initialBot))
  );

  return (
    <div className={styles.root}>
      <div>
        <BotForm botConfig={botConfig} setBotConfig={setBotConfig} />
      </div>
      <div>
        <Game
          participants={{
            w: {
              type: "bot",
              config: botConfig,
            },
            b: {
              type: "interactive",
            },
          }}
        />
      </div>
    </div>
  );
};

export default BotEditor;
