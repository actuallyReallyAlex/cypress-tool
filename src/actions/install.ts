import chalk from "chalk";
import path from "path";
import ora from "ora";

import {
  clearCache,
  downloadCypress,
  getAvailableVersions,
  installCypress,
  keypress,
  promptVersion,
  titleScreen,
} from "../util";

import { AppState } from "../types";

/**
 * Walks user through installing Cypress.
 * @param state Application State.
 */
const install = async (state: AppState): Promise<void> => {
  let currentSpinner = ora();
  try {
    await titleScreen("cypress-tool");

    // * Clear Cypress Cache
    currentSpinner = ora("Clearing cache").start();
    await clearCache();
    currentSpinner.succeed("Cache cleared successfully");

    // * Get List of Available Versions
    currentSpinner = ora("Getting list of available versions").start();
    const availableVersions: string[] = await getAvailableVersions();
    currentSpinner.succeed("Received list of available versions");

    // * Prompt Cypress version
    const version = await promptVersion(availableVersions);

    // * Download Cypress.zip for platform
    currentSpinner = ora(`Downloading Cypress v${version}`).start();
    currentSpinner.stopAndPersist();
    const zipPath = path.join(__dirname, `cypress_v${version}.zip`);
    const cypressUrl = `https://download.cypress.io/desktop/${version}?platform=${process.platform}`;
    await downloadCypress(cypressUrl, zipPath);
    currentSpinner.succeed(`Cypress v${version} downloaded successfully`);

    // * Install Cypress from Cypress.zip
    currentSpinner = ora(`Installing Cypress v${version}`).start();
    currentSpinner.stopAndPersist();
    await installCypress(version, zipPath);
    currentSpinner.succeed(`Cypress v${version} installed successfully`);

    console.log("");
    console.log(chalk.blueBright("Press any key to continue..."));

    await keypress();
    state.menuActionEmitter.emit("actionCompleted", state);
  } catch (error) {
    currentSpinner.fail();
    console.log(chalk.inverse.red(error));
  }
};

export default install;
