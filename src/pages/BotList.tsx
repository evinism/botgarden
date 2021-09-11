import {
  Avatar,
  Box,
  Button,
  Card,
  Tooltip,
  Typography,
} from "@material-ui/core";
import { useReducer } from "react";
import { getAllBots, remove, skeleton } from "../botStore";
import { AppState } from "../types";
import { IconButton } from "@material-ui/core";
import CallSplitIcon from "@material-ui/icons/CallSplit";
import EditIcon from "@material-ui/icons/Edit";
import DeleteIcon from "@material-ui/icons/Delete";
import AddIcon from "@material-ui/icons/Add";

import { makeStyles } from "@material-ui/styles";

interface BotListProps {
  setAppState: (state: AppState) => unknown;
}

const useStyles = makeStyles(() => ({
  buttonSet: {
    margin: "8px",
    whiteSpace: "nowrap",
  },
  card: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "8px",
    margin: "4px 0",
  },
  mainText: {
    flexGrow: 1,
    padding: "0 16px",
  },
  pageWrapper: {
    maxWidth: "700px",
    margin: "0 auto",
  },
}));

const BotList = ({ setAppState }: BotListProps) => {
  const [, forceUpdate] = useReducer((x) => x + 1, 0);
  const styles = useStyles();
  return (
    <div className={styles.pageWrapper}>
      <h1>Choose a chess bot to play against!</h1>
      <div>
        {Object.entries(getAllBots()).map(([id, bot]) => (
          <Card variant="outlined" className={styles.card}>
            <Avatar>{bot.name.trim()[0].toUpperCase()}</Avatar>
            <Box className={styles.mainText}>
              <Typography>{bot.name}</Typography>
              <Typography color="textSecondary">{bot.description}</Typography>
            </Box>
            <Box className={styles.buttonSet}>
              <Tooltip title="Delete this bot">
                <IconButton
                  size="small"
                  disabled={!!bot.builtin}
                  onClick={() => {
                    remove(id);
                    forceUpdate();
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Edit">
                <IconButton
                  size="small"
                  disabled={!!bot.builtin}
                  onClick={() => {
                    console.log(id);
                    setAppState({
                      state: "editing",
                      initialBotConfig: bot,
                      botId: id,
                    });
                  }}
                >
                  <EditIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Create new bot based on this bot.">
                <IconButton
                  size="small"
                  onClick={() =>
                    setAppState({
                      state: "editing",
                      initialBotConfig: bot,
                      botId: undefined,
                    })
                  }
                >
                  <CallSplitIcon />
                </IconButton>
              </Tooltip>
            </Box>
            <Button
              variant="contained"
              onClick={() => setAppState({ state: "playing", bot })}
            >
              Play
            </Button>
          </Card>
        ))}
      </div>
      <Button
        startIcon={<AddIcon />}
        onClick={() =>
          setAppState({
            state: "editing",
            initialBotConfig: skeleton,
            botId: undefined,
          })
        }
      >
        Create a New Bot
      </Button>
    </div>
  );
};

export default BotList;
