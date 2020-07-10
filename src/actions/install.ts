import chalk from "chalk";
import path from "path";

import {
  clearCache,
  getCypressInfo,
  titleScreen,
  downloadCypress,
  installCypress,
  keypress,
  hasKey,
} from "../util";

import { AppState, CypressPackage, CypressInfo } from "../types";

const install = async (state: AppState): Promise<void> => {
  try {
    await titleScreen("cypress-tool");

    // * Clear Cypress Cache
    console.log("Clearing cache");
    await clearCache();
    console.log("Cache cleared");

    // * Get Cypress Information
    const cypressInfo: CypressInfo = await getCypressInfo();

    if (hasKey(cypressInfo.packages, process.platform)) {
      const cypressPackageInfo: CypressPackage =
        cypressInfo.packages[process.platform];
      const cypressUrl = cypressPackageInfo.url;
      const version = cypressInfo.version;
      const zipPath = path.join(__dirname, "test.zip");

      // * Download Cypress.zip for platform
      console.log(`Downloading Cypress v${version}`);
      await downloadCypress(cypressUrl, zipPath);

      // * Install Cypress from Cypress.zip
      console.log("Installing Cypress as a devDependency in this directory");
      await installCypress(version, zipPath);

      console.log("Done!");
      console.log("Press any key to continue...");

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
      return process.exit(1);
    }
  } catch (error) {
    console.log(chalk.inverse.red(error));
  }
};

export default install;
