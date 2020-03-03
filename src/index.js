// const { makeRequest } = require("./util/request");
const { generateTitle } = require("./util/title");
const {
  getCurrentCypressVersion,
  getLatestCypressDetails,
  checkIfUpToDate
} = require("./util/cypress");
// const { getCachedVersions } = require("./util/getCachedVersions");
// const { isUpToDate } = require("./util/isUpToDate");
// const { promptUpdateCypress } = require("./util/cypress");
// const ora = require("ora");
const { promptToInstallCypress } = require("./util/prompts");
const {
  checkCypressInstallationSpinner,
  getLatestCypressDetailsSpinner,
  compareVersionsSpinner
} = require("./util/spinners");

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
      console.log({ shouldInstall });
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
