import { Button, FormControlLabel, FormGroup, Switch } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import { useState } from "react";
import { save } from "../botStore";
import Game from "../Game";
import { Participants, BotConfig, AppState } from "../types";
import BotForm from "./BotForm";

const useStyles = makeStyles(() => ({
  root: {
    display: "flex",
  },
  gameWrapper: {
    flexGrow: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
}));

interface BotEditorProps {
  initialBot?: BotConfig;
  botId?: string;
  setAppState: (appState: AppState) => unknown;
}

const skeleton: BotConfig = {
  builtin: false,
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

const BotEditor = ({
  initialBot = skeleton,
  setAppState,
  botId,
}: BotEditorProps) => {
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
    <>
      <div>
        <h2>Editing {botConfig.name}</h2>

        <Button onClick={() => setAppState({ state: "home" })}>Cancel</Button>
        <Button
          variant="contained"
          onClick={() => {
            save(botConfig, botId);
            setAppState({ state: "home" });
          }}
        >
          Save Locally
        </Button>
      </div>
      <div className={styles.root}>
        <div>
          <BotForm botConfig={botConfig} setBotConfig={setBotConfig} />
        </div>
        <div className={styles.gameWrapper}>
          <Game key={gameNum} participants={participants} />

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
          </FormGroup>
        </div>
      </div>
    </>
  );
};

export default BotEditor;
