import {
  Button,
  FormControlLabel,
  Radio,
  RadioGroup,
  Slider,
  TextField,
} from "@material-ui/core";
import { Autocomplete } from "@material-ui/lab";
import { makeStyles } from "@material-ui/styles";
import { useState } from "react";
import { BotConfig } from "./bot";
import { openings } from "./openings";

const useStyles = makeStyles((theme) => ({
  root: {
    width: 250,
  },
}));

interface BotEditorProps {
  initialBot?: BotConfig;
  close?: () => void;
  save?: (botConfig: BotConfig) => void;
}

const skeleton: BotConfig = {
  name: "New Bot",
  baseEngine: {
    maxDepth: 10,
    timeout: 1500,
  },
  strategy: {
    type: "scorer/jsonlogic",
    logic: { reduce: [{ var: "scores" }, { var: "current" }, 0] },
  },
  preferredOpenings: [],
};

const BotEditor = ({ initialBot = skeleton, close, save }: BotEditorProps) => {
  const styles = useStyles();
  const [botConfig, setBotConfig] = useState<BotConfig>(() =>
    JSON.parse(JSON.stringify(initialBot))
  );

  let textEditorSlot: React.ReactNode;
  if (botConfig.strategy.type === "scorer/javascript") {
    textEditorSlot = (
      <TextField
        multiline
        rows={4}
        value={botConfig.strategy.function}
        defaultValue=""
        onChange={(e) => {
          setBotConfig({
            ...botConfig,
            strategy: {
              dangerous: true,
              type: "scorer/javascript",
              function: e.target.value,
            },
          });
        }}
      />
    );
  } else if (botConfig.strategy.type === "scorer/jsonlogic") {
    textEditorSlot = (
      <TextField
        label="JSON Logic"
        multiline
        defaultValue=""
        value={JSON.stringify(botConfig.strategy.logic)}
        onChange={(e) => {
          setBotConfig({
            ...botConfig,
            strategy: {
              type: "scorer/jsonlogic",
              logic: JSON.parse(e.target.value),
            },
          });
        }}
      />
    );
  } else {
    textEditorSlot = (
      <TextField
        label="ID"
        value={botConfig.strategy.id}
        onChange={(e) => {
          setBotConfig({
            ...botConfig,
            strategy: {
              type: "hardcoded",
              id: e.target.value as any,
            },
          });
        }}
      />
    );
  }

  return (
    <div className={styles.root}>
      <TextField
        value={botConfig.name}
        onChange={(e) => {
          setBotConfig({
            ...botConfig,
            name: e.target.value,
          });
        }}
      />
      <Slider
        defaultValue={23}
        valueLabelDisplay="auto"
        step={1}
        marks
        min={1}
        max={23}
        value={botConfig.baseEngine.maxDepth}
        onChange={(e, newValue) => {
          setBotConfig({
            ...botConfig,
            baseEngine: {
              ...botConfig.baseEngine,
              maxDepth: newValue as number,
            },
          });
        }}
      />
      <Slider
        defaultValue={1000}
        valueLabelDisplay="auto"
        step={100}
        min={100}
        max={30000}
        value={botConfig.baseEngine.timeout}
        onChange={(e, newValue) => {
          setBotConfig({
            ...botConfig,
            baseEngine: {
              ...botConfig.baseEngine,
              timeout: newValue as number,
            },
          });
        }}
      />
      <RadioGroup
        value={botConfig.strategy.type}
        onChange={(e, newValue) => {
          let castedNewValue = newValue as BotConfig["strategy"]["type"];
          let newStrategy: BotConfig["strategy"] | void = undefined;
          if (castedNewValue === "scorer/javascript") {
            newStrategy = {
              dangerous: true,
              type: "scorer/javascript",
              function: `(function score(line){ return line.scores[line.scores.length - 1]; })`,
            };
          } else if (castedNewValue === "scorer/jsonlogic") {
            newStrategy = {
              type: "scorer/jsonlogic",
              logic: { reduce: [{ var: "scores" }, { var: "current" }, 0] },
            };
          }
          if (newStrategy) {
            setBotConfig({
              ...botConfig,
              strategy: newStrategy,
            });
          }
        }}
      >
        <FormControlLabel
          value="scorer/javascript"
          control={<Radio />}
          label="JavaScript"
        />
        <FormControlLabel
          value="scorer/jsonlogic"
          control={<Radio />}
          label="JSONLogic"
        />
      </RadioGroup>
      {textEditorSlot}
      <Autocomplete
        multiple
        id="tags-standard"
        options={openings}
        getOptionLabel={(option) => option.description}
        defaultValue={[]}
        value={botConfig.preferredOpenings}
        onChange={(e, newValue) => {
          setBotConfig({
            ...botConfig,
            preferredOpenings: newValue,
          });
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            variant="standard"
            label="Multiple values"
            placeholder="Openings"
          />
        )}
      />
      <div>
        <Button>Close</Button>
        <Button variant="contained">Save</Button>
      </div>
    </div>
  );
};

export default BotEditor;
