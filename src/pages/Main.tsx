import { useState } from "react";
import { defaultBots } from "../bot";
import Game from "../Game";
import { BotConfig } from "../types";

const Main = () => {
  const [currentBot, setCurrentBot] = useState<BotConfig | void>();

  return currentBot ? (
    <>
      <button onClick={() => setCurrentBot()}>Back</button>
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
    </>
  ) : (
    <>
      <h1>Choose a bot</h1>
      {defaultBots.map((bot) => (
        <div>
          <button onClick={() => setCurrentBot(bot)}>{bot.name}</button>
        </div>
      ))}
    </>
  );
};

export default Main;
