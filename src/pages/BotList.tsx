import { Button } from "@material-ui/core";
import { useReducer } from "react";
import { getAllBots, remove } from "../botStore";
import { AppState } from "../types";

interface BotListProps {
  setAppState: (state: AppState) => unknown;
}

const BotList = ({ setAppState }: BotListProps) => {
  const [, forceUpdate] = useReducer((x) => x + 1, 0);

  return (
    <div>
      <h1>Choose a chess bot to play against!</h1>
      {Object.entries(getAllBots()).map(([id, bot]) => (
        <div>
          <hr />
          <h3>
            {bot.name} {bot.builtin && "[ builtin ]"}
          </h3>
          {bot.builtin && <div>[builtin]</div>}
          <Button onClick={() => setAppState({ state: "playing", bot })}>
            Play Against
          </Button>
          <Button
            onClick={() =>
              setAppState({
                state: "editing",
                initialBotConfig: bot,
                botId: undefined,
              })
            }
          >
            Fork
          </Button>
          <Button
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
            Edit
          </Button>
          <Button
            disabled={!!bot.builtin}
            onClick={() => {
              remove(id);
              forceUpdate();
            }}
          >
            Delete
          </Button>
        </div>
      ))}
    </div>
  );
};

export default BotList;
