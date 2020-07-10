import boxen from "boxen";
import chalk from "chalk";

import { blankBoxenStyle, version } from "../constants";
import { keypress, titleScreen } from "../util";

import { AppState } from "../types";

/**
 * Displays the About Screen.
 * @param state State of Application.
 */
const about = async (state: AppState): Promise<void> => {
  await titleScreen("cypress-tool");
  console.log(
    boxen(
      `${chalk.blueBright("Author: ")} Alex Lee\n${chalk.blueBright(
        "Version: "
      )} ${version}`,
      blankBoxenStyle
    )
  );

  console.log("Press any key to return to Main Menu ...");
  await keypress();
  state.menuActionEmitter.emit("actionCompleted", state);
};

export default about;
