import "./App.css";
import CssBaseline from "@material-ui/core/CssBaseline";
import { createTheme, ThemeProvider } from "@material-ui/core/styles";
import Main from "./pages/Main";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import EditorPage from "./pages/EditorPage";

const darkTheme = createTheme({
  palette: {
    type: "dark",
  },
});

function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <Router>
        <div className="App">
          <Switch>
            <Route path="/editor">
              <EditorPage />
            </Route>
            <Route path="/game">
              <Main />
            </Route>
            <Route path="/" exact>
              <Link to="/editor">Editor</Link>
              <Link to="/game">Game</Link>
            </Route>
            <Route path="/">Page Not Found!!!</Route>
          </Switch>
        </div>
      </Router>
      <CssBaseline />
    </ThemeProvider>
  );
}

export default App;
