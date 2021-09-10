import Game from "../Game";
import { AppState, BotConfig } from "../types";

interface MainProps {
  currentBot: BotConfig;
  setAppState: (state: AppState) => unknown;
}

const Main = ({ currentBot, setAppState }: MainProps) => {
  return (
    <div>
      <button onClick={() => setAppState({ state: "home" })}>Back</button>
      <div>
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
