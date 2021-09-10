import { Button, FormControlLabel, FormGroup, Switch } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import { useState } from "react";
import Game from "../Game";
import { Participants, BotConfig } from "../types";
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

  const [gameNum, setGameNum] = useState(0);
  const [playingAsBlack, setPlayingAsBlack] = useState(true);
  const [botConfig, setBotConfig] = useState<BotConfig>(() =>
    JSON.parse(JSON.stringify(initialBot))
  );

  const participants: Participants = playingAsBlack
    ? {
        w: {
          type: "bot",
          config: botConfig,
        },
        b: {
          type: "interactive",
        },
      }
    : {
        w: {
          type: "interactive",
        },
        b: {
          type: "bot",
          config: botConfig,
        },
      };

  return (
    <div className={styles.root}>
      <div>
        <BotForm botConfig={botConfig} setBotConfig={setBotConfig} />
      </div>
      <div>
        <Button variant="contained" onClick={() => setGameNum(gameNum + 1)}>
          Restart Game
        </Button>
        <FormGroup>
          <FormControlLabel
            control={
              <Switch
                checked={playingAsBlack}
                onChange={(e) => setPlayingAsBlack(e.target.checked)}
                name="checkedA"
              />
            }
            label="Playing as Black?"
          />
          <Switch />
        </FormGroup>
        <Game key={gameNum} participants={participants} />
      </div>
    </div>
  );
};

export default BotEditor;
