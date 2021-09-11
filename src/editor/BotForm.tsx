import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  FormControl,
  FormControlLabel,
  FormLabel,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Slider,
  TextField,
  Typography,
} from "@material-ui/core";
import { Autocomplete } from "@material-ui/lab";
import { makeStyles } from "@material-ui/styles";
import { hardcodedStrategies } from "../bot";
import { openings } from "../openings";
import AceEditor from "react-ace";

import "ace-builds/src-noconflict/theme-dracula";
import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/mode-json";
import { BotConfig } from "../types";
import { ExpandMore } from "@material-ui/icons";
import { defaultJS, defaultJSONLogic } from "../botStore";

const useStyles = makeStyles((theme) => ({
  root: {
    padding: 16,
  },
  innerWrapper: { width: 600 },
}));

interface BotFormProps {
  botConfig: BotConfig;
  setBotConfig: (config: BotConfig) => unknown;
}

const BotForm = ({ botConfig, setBotConfig }: BotFormProps) => {
  const styles = useStyles();

  let textEditorSlot: React.ReactNode;
  if (botConfig.strategy.type === "scorer/javascript") {
    textEditorSlot = (
      <AceEditor
        height="300px"
        mode="javascript"
        theme="dracula"
        onChange={(value) =>
          setBotConfig({
            ...botConfig,
            strategy: {
              dangerous: true,
              type: "scorer/javascript",
              function: value,
            },
          })
        }
        value={botConfig.strategy.function}
        name="UNIQUE_ID_OF_DIV"
        editorProps={{ $blockScrolling: true }}
      />
    );
  } else if (botConfig.strategy.type === "scorer/jsonlogic") {
    textEditorSlot = (
      <AceEditor
        mode="json"
        theme="dracula"
        height="300px"
        value={JSON.stringify(botConfig.strategy.logic)}
        onChange={(value) => {
          setBotConfig({
            ...botConfig,
            strategy: {
              type: "scorer/jsonlogic",
              logic: JSON.parse(value),
            },
          });
        }}
        editorProps={{ $blockScrolling: true }}
      />
    );
  } else {
    textEditorSlot = (
      <Select
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
      >
        {Object.keys(hardcodedStrategies).map((key) => (
          <MenuItem value={key} key={key}>
            {key}
          </MenuItem>
        ))}
      </Select>
    );
  }

  return (
    <div className={styles.root}>
      <div className={styles.innerWrapper}>
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography>General</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <div>
              <TextField
                label="Bot Name"
                fullWidth
                value={botConfig.name}
                onChange={(e) => {
                  setBotConfig({
                    ...botConfig,
                    name: e.target.value,
                  });
                }}
              />
              <TextField
                label="Bot Description"
                value={botConfig.description}
                fullWidth
                onChange={(e) => {
                  setBotConfig({
                    ...botConfig,
                    description: e.target.value,
                  });
                }}
              />
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
                    label="Preferred Openings"
                  />
                )}
              />
            </div>
          </AccordionDetails>
        </Accordion>
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography>Base Engine</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <div>
              <FormControl>
                <InputLabel id="demo-simple-select-label">
                  UCI Engine
                </InputLabel>
                <Select value={"sf"} disabled>
                  <MenuItem value={"sf"}>Stockfish 12 (wasm)</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <FormLabel>Max Depth</FormLabel>
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
              </FormControl>
              <FormControl fullWidth>
                <FormLabel>Max Think Time</FormLabel>
                <Slider
                  defaultValue={1000}
                  valueLabelDisplay="auto"
                  step={100}
                  min={100}
                  max={30000}
                  value={botConfig.baseEngine.timeout}
                  valueLabelFormat={(value) => `${(value / 1000).toFixed(2)}s`}
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
              </FormControl>
            </div>
          </AccordionDetails>
        </Accordion>
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography>Line Scoring</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <div>
              <RadioGroup
                row
                value={botConfig.strategy.type}
                onChange={(e, newValue) => {
                  let castedNewValue =
                    newValue as BotConfig["strategy"]["type"];
                  let newStrategy: BotConfig["strategy"] | void = undefined;
                  if (castedNewValue === "scorer/javascript") {
                    newStrategy = {
                      dangerous: true,
                      type: "scorer/javascript",
                      function: defaultJS,
                    };
                  } else if (castedNewValue === "scorer/jsonlogic") {
                    newStrategy = {
                      type: "scorer/jsonlogic",
                      logic: defaultJSONLogic,
                    };
                  } else {
                    newStrategy = {
                      type: "hardcoded",
                      id: "best",
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
                <FormControlLabel
                  value="hardcoded"
                  control={<Radio />}
                  label="Built-in"
                />
              </RadioGroup>
              {textEditorSlot}
            </div>
          </AccordionDetails>
        </Accordion>
      </div>
    </div>
  );
};

export default BotForm;
