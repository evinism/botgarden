import { useState } from "react";
import "./App.css";
import Game from "./Game";
import { BotConfig, defaultBots } from "./bot";

function App() {
  const [currentBot, setCurrentBot] = useState<BotConfig | void>();

  return (
    <div className="App">
      <header className="App-header">
        {currentBot ? (
          <>
            <button onClick={() => setCurrentBot()}>Back</button>
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
        )}
      </header>
    </div>
  );
}

export default App;
