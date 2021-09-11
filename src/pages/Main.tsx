import { Button, makeStyles, Paper, Typography } from "@material-ui/core";
import Game from "../Game";
import { AppState, BotConfig } from "../types";

const useStyles = makeStyles(() => ({
  gameWrapper: {
    maxWidth: 560,
    margin: "auto",
  },
  header: {
    display: "flex",
    alignItems: "center",
    padding: 16,
  },
}));

interface MainProps {
  currentBot: BotConfig;
  setAppState: (state: AppState) => unknown;
}

const Main = ({ currentBot, setAppState }: MainProps) => {
  const styles = useStyles();
  return (
    <div>
      <Paper className={styles.header} square>
        <Button onClick={() => setAppState({ state: "home" })}>Back</Button>
        <Typography variant="h6">Playing {currentBot.name}</Typography>
      </Paper>
      <div className={styles.gameWrapper}>
        <Game
          participants={{
            w: {
              type: "bot",
              config: currentBot,
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

export default Main;
