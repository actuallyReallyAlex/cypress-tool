import chalk from "chalk";
import path from "path";
import ora from "ora";

import {
  clearCache,
  downloadCypress,
  getCypressInfo,
  hasKey,
  installCypress,
  keypress,
  titleScreen,
} from "../util";

import { AppState, CypressInfo, CypressPackage } from "../types";

const install = async (state: AppState): Promise<void> => {
  let currentSpinner = ora();
  try {
    await titleScreen("cypress-tool");

    // * Clear Cypress Cache
    currentSpinner = ora("Clearing cache").start();
    await clearCache();
    currentSpinner.succeed("Cache cleared successfully");

    // * Get Cypress Information
    currentSpinner = ora("Getting latest Cypress information");
    const cypressInfo: CypressInfo = await getCypressInfo();

    if (hasKey(cypressInfo.packages, process.platform)) {
      const cypressPackageInfo: CypressPackage =
        cypressInfo.packages[process.platform];
      const cypressUrl = cypressPackageInfo.url;
      const version = cypressInfo.version;
      const zipPath = path.join(__dirname, "test.zip");
      currentSpinner.succeed("Latest Cypress information received");

      // * Download Cypress.zip for platform
      currentSpinner = ora(`Downloading Cypress v${version}`);
      currentSpinner.stopAndPersist();
      await downloadCypress(cypressUrl, zipPath);
      currentSpinner.succeed(`Cypress v${version} downloaded successfully`);

      // * Install Cypress from Cypress.zip
      currentSpinner = ora(`Installing Cypress v${version}`);
      currentSpinner.stopAndPersist();
      await installCypress(version, zipPath);
      currentSpinner.succeed(`Cypress v${version} installed successfully`);

      console.log("");
      console.log(chalk.blueBright("Press any key to continue..."));

      await keypress();
      state.menuActionEmitter.emit("actionCompleted", state);
    } else {
      console.error(
        chalk.red.inverse(`No platform found. Platform = ${process.platform}`)
      );
      console.error(
        `Could not find key (${
          process.platform
        }) within object (${JSON.stringify(cypressInfo.packages, null, 2)})`
      );
      currentSpinner.fail();
      return process.exit(1);
    }
  } catch (error) {
    currentSpinner.fail();
    console.log(chalk.inverse.red(error));
  }
};

export default install;
