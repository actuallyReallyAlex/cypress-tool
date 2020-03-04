import "core-js/stable";
import "regenerator-runtime/runtime";
import chalk from "chalk";

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

import { promptToInstallCypress, promptToUpdateCypress } from "./util/prompts";
import {
  title,
  getLatestDetails,
  getCurrentVersion,
  isUpToDate,
  readCache,
  cleanCache,
  downloadCypress,
  installCypress,
  updateCypress
} from "./steps";

// TODO - Allow to download/install older Cypress versions as well
// TODO - Chalk-ify some important things to the terminal, like version numbers etc.
// TODO - Abiility to uninstall Cypress
// TODO - Prettier

const main = async () => {
  try {
    // * Title
    await title();

    // * Get Latest Cypress Details
    const latestCypressDetails = await getLatestDetails();

    // * Check if Cypress install exists
    const currentCypressVersion = await getCurrentVersion();

    // * Compare versions (only if installed)
    const upToDate = await isUpToDate(
      currentCypressVersion,
      latestCypressDetails.version
    );

    // * Prompt to install (only if not installed)
    if (!currentCypressVersion) {
      const shouldInstall = await promptToInstallCypress(
        latestCypressDetails.version
      ).catch(e => {
        throw new Error(e);
      });

      // * User selected to install latest version of Cypress
      if (shouldInstall) {
        // * Detect if user has a HTTP_PROXY env var set up
        const userNeedsProxy = process.env.HTTP_PROXY;

        if (userNeedsProxy) {
          console.log(
            chalk.red("NEED TO DEVELOP WHAT SHOULD HAPPEN FOR PROXY")
          );
          process.exit();
        } else {
          // * Read Cypress Cache
          const { cachedVersions, cacheLocation } = await readCache();

          if (cachedVersions.length > 0) {
            // * Clear Cypress Cache
            await cleanCache(cachedVersions, cacheLocation);
          }

          // * Download Cypress.zip for platform
          await downloadCypress(
            latestCypressDetails.packages[process.platform].url,
            latestCypressDetails.version
          );

          // * Install Cypress from Cypress.zip
          await installCypress(latestCypressDetails.version);
        }
      }
    }

    if (currentCypressVersion && !upToDate) {
      // * Prompt to update (only if installed and out of date)
      const shouldUpdate = await promptToUpdateCypress(
        currentCypressVersion,
        latestCypressDetails.version
      );

      if (shouldUpdate) {
        // * Update Cypress to the latest version available
        await updateCypress(
          currentCypressVersion,
          latestCypressDetails.version
        );
      }
    }
  } catch (e) {
    console.log(chalk.red(e));
  }
};

main();
