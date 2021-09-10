import "./App.css";
import CssBaseline from "@material-ui/core/CssBaseline";
import { createTheme, ThemeProvider } from "@material-ui/core/styles";
import Main from "./pages/Main";
import EditorPage from "./pages/EditorPage";
import { AppState } from "./types";
import { useState } from "react";
import BotList from "./pages/BotList";

const darkTheme = createTheme({
  palette: {
    type: "dark",
  },
});

function App() {
  const [appState, setAppState] = useState<AppState>({ state: "home" });
  return (
    <ThemeProvider theme={darkTheme}>
      <div className="App">
        {appState.state === "home" && <BotList setAppState={setAppState} />}
        {appState.state === "playing" && (
          <Main currentBot={appState.bot} setAppState={setAppState} />
        )}
        {appState.state === "editing" && (
          <EditorPage
            initialBot={appState.initialBotConfig}
            botId={appState.botId}
            setAppState={setAppState}
          />
        )}
        <CssBaseline />
      </div>
    </ThemeProvider>
  );
}

export default App;
