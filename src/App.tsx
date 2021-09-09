import { useState } from "react";
import "./App.css";
import Game from "./Game";
import CssBaseline from "@material-ui/core/CssBaseline";
import { BotConfig, defaultBots } from "./bot";
import { createTheme, ThemeProvider } from "@material-ui/core/styles";
import BotEditor from "./BotEditor";

const darkTheme = createTheme({
  palette: {
    type: "dark",
  },
});

function App() {
  const [currentBot, setCurrentBot] = useState<BotConfig | void>();

  return (
    <ThemeProvider theme={darkTheme}>
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
          {false && <BotEditor />}
        </header>
      </div>
      <CssBaseline />
    </ThemeProvider>
  );
}

export default App;
