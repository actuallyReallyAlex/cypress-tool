import "core-js/stable";
import "regenerator-runtime/runtime";
import chalk from "chalk";
import path from "path";

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

import { isMac } from "./constants";
import {
  checkIfUpToDate,
  getCurrentCypressVersion,
  getLatestCypressDetails
} from "./util/cypress";
import { clearCache, getCachedVersions } from "./util/fileSystem";
import { promptToInstallCypress } from "./util/prompts";
import { download } from "./util/request";
import {
  checkCypressInstallationSpinner,
  clearCacheSpinner,
  compareVersionsSpinner,
  downloadSpinner,
  getLatestCypressDetailsSpinner,
  readCacheSpinner
} from "./util/spinners";
import { generateTitle } from "./util/title";

const main = async () => {
  try {
    // * Title
    await generateTitle("Cypress Tool");

    // * Get Latest Cypress Details
    getLatestCypressDetailsSpinner.start();
    const latestCypressDetails = await getLatestCypressDetails().catch(e => {
      getLatestCypressDetailsSpinner.fail();
      throw new Error(e);
    });
    getLatestCypressDetailsSpinner.succeed(
      `Latest Cypress release is v${latestCypressDetails.version}`
    );

    // * Check if Cypress install exists
    checkCypressInstallationSpinner.start();
    const currentCypressVersion = await getCurrentCypressVersion().catch(e => {
      checkCypressInstallationSpinner.fail();
      throw new Error(e);
    });

    if (currentCypressVersion) {
      checkCypressInstallationSpinner.succeed(
        `Installed version is v${currentCypressVersion}`
      );
    } else {
      checkCypressInstallationSpinner.warn(
        "No installed Cypress version detected"
      );
    }

    // * Compare versions (only if installed)
    let upToDate = false;
    if (currentCypressVersion) {
      compareVersionsSpinner.start();
      upToDate = await checkIfUpToDate(
        latestCypressDetails.version,
        currentCypressVersion
      ).catch(e => {
        compareVersionsSpinner.fail();
        throw new Error(e);
      });

      if (upToDate) {
        compareVersionsSpinner.succeed(
          `v${currentCypressVersion} = v${latestCypressDetails.version}`
        );
      } else {
        compareVersionsSpinner.warn(
          `v${currentCypressVersion} < v${latestCypressDetails.version}`
        );
      }
    }

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
          readCacheSpinner.start();
          const cacheLocation = isMac
            ? path.join(process.env.HOME, "/Library/Caches/Cypress")
            : path.join(process.env.TEMP, "../Cypress/Cache");
          const cachedVersions = await getCachedVersions(cacheLocation).catch(
            e => {
              readCacheSpinner.fail();
              throw new Error(e);
            }
          );
          if (cachedVersions.length > 0) {
            readCacheSpinner.succeed(
              `Cypress cache contains ${cachedVersions}`
            );

            // * Clear Cypress Cache
            clearCacheSpinner.start();
            await clearCache(cacheLocation, cachedVersions).catch(e => {
              clearCacheSpinner.fail();
              throw new Error(e);
            });
            clearCacheSpinner.succeed("Cache cleared");
          } else {
            readCacheSpinner.succeed(`Cypress cache is empty`);
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
