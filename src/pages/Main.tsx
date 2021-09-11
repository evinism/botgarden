import { Button, makeStyles, Paper, Typography } from "@material-ui/core";
import Game from "../Game";
import { AppState, Participants } from "../types";

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
  participants: Participants;
  setAppState: (state: AppState) => unknown;
}

const Main = ({ participants, setAppState }: MainProps) => {
  const styles = useStyles();
  return (
    <div>
      <Paper className={styles.header} square>
        <Button onClick={() => setAppState({ state: "home" })}>Back</Button>
        <Typography variant="h6">Playing</Typography>
      </Paper>
      <div className={styles.gameWrapper}>
        <Game participants={participants} />
      </div>
    </div>
  );
};

export default Main;
