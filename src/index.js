import "core-js/stable";
import "regenerator-runtime/runtime";
import chalk from "chalk";

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

import { promptToInstallCypress } from "./util/prompts";
import { download } from "./util/request";
import { downloadSpinner } from "./util/spinners";
import {
  title,
  getLatestDetails,
  getCurrentVersion,
  isUpToDate,
  readCache,
  cleanCache
} from "./steps";

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

          // TODO - Download Cypress for platform
          // * Download Cypress.zip for platform
          const downloadUrl =
            latestCypressDetails.packages[process.platform].url;
          await download(downloadUrl).catch(e => {
            dlSpinner.fail();
            throw new Error(e);
          });
          downloadSpinner.succeed(
            `Downloaded Cypress v${latestCypressDetails.version}`
          );

          // const installSpinner = installCypressSpinner(
          //   latestCypressDetails.version
          // );
          // installSpinner.start();
          // await installCypress(latestCypressDetails.version).catch(e => {
          //   installSpinner.fail();
          //   throw new Error(e);
          // });
          // installSpinner.succeed(
          //   `Installed Cypress v${latestCypressDetails.version}`
          // );
        }
      }
    }

    // * Prompt to update (only if installed and out of date)

    //   await promptUpdateCypress(latestVersion, win32DownloadUrl).catch(e => {
    //     throw new Error(e);
    //   });
    // }
  } catch (e) {
    console.error(e);
  }
};

main();
