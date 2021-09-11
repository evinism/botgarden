import {
  Button,
  FormControlLabel,
  FormGroup,
  Paper,
  Switch,
  Typography,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import { useState } from "react";
import { save, skeleton } from "../botStore";
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
  header: {
    display: "flex",
    alignItems: "center",
    padding: 16,
  },
  headerText: {
    flexGrow: 1,
  },
}));

interface BotEditorProps {
  initialBot?: BotConfig;
  botId?: string;
  setAppState: (appState: AppState) => unknown;
}

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
      <Paper className={styles.header} square>
        <Typography variant="h6" className={styles.headerText}>
          Editing {botConfig.name}
        </Typography>
        <div>
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
      </Paper>
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
