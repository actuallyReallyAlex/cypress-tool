import chalk from "chalk";
import path from "path";

import { isMac } from "../constants";
import {
  addCypress,
  checkIfUpToDate,
  getCurrentCypressVersion,
  getLatestCypressDetails
} from "../util/cypress";
import { clearCache, getCachedVersions } from "../util/fileSystem";
import { download } from "../util/request";
import {
  checkCypressInstallationSpinner,
  clearCacheSpinner,
  compareVersionsSpinner,
  downloadSpinner,
  getLatestCypressDetailsSpinner,
  installCypressSpinner,
  readCacheSpinner,
  updateCypressSpinner
} from "../util/spinners";
import { generateTitle } from "../util/title";

/**
 * Generates a pretty title.
 * @async
 */
const title = async () => await generateTitle("Cypress Tool");

/**
 * Gets latest Cypress details.
 * @returns {Object} Object of latest Cypress details.
 * @async
 */
const getLatestDetails = async () => {
  getLatestCypressDetailsSpinner.start();
  const latestCypressDetails = await getLatestCypressDetails().catch(e => {
    getLatestCypressDetailsSpinner.fail();
    throw new Error(e);
  });
  getLatestCypressDetailsSpinner.succeed(
    `Latest Cypress release is ${chalk.yellowBright(
      "v" + latestCypressDetails.version
    )}`
  );
  return latestCypressDetails;
};

/**
 * Gets current Cypress version installed on machine.
 * @returns {String|false} Returns the string of the version if installed, or false otherwise.
 * @async
 */
const getCurrentVersion = async () => {
  checkCypressInstallationSpinner.start();
  const currentCypressVersion = await getCurrentCypressVersion().catch(e => {
    checkCypressInstallationSpinner.fail();
    throw new Error(e);
  });

  if (currentCypressVersion) {
    checkCypressInstallationSpinner.succeed(
      `Installed version is ${chalk.yellowBright(currentCypressVersion)}`
    );
  } else {
    checkCypressInstallationSpinner.warn(
      "No installed Cypress version detected"
    );
  }

  return currentCypressVersion;
};

/**
 * Checks if the version of Cypress on the machine is up to date.
 * @param {String|false} currentInstalledVersion Currently installed Cypress version on machine.
 * @param {String} currentAvailableVersion Latest available version from Cypress.
 * @returns {Boolean} boolean
 * @async
 */
const isUpToDate = async (currentInstalledVersion, currentAvailableVersion) => {
  let upToDate = false;

  if (currentInstalledVersion) {
    compareVersionsSpinner.start();
    upToDate = await checkIfUpToDate(
      currentAvailableVersion,
      currentInstalledVersion
    ).catch(e => {
      compareVersionsSpinner.fail();
      throw new Error(e);
    });

    if (upToDate) {
      compareVersionsSpinner.succeed(
        chalk.greenBright(`v${currentInstalledVersion}`) +
          " = " +
          chalk.greenBright(`v${currentAvailableVersion}`)
      );
    } else {
      compareVersionsSpinner.warn(
        chalk.redBright(`v${currentInstalledVersion}`) +
          " < " +
          chalk.greenBright(`v${currentAvailableVersion}`)
      );
    }
  }

  return upToDate;
};

/**
 * Reads the Cypress cache.
 * @returns {Object} Returns object of `cachedVersions` and `cacheLocation`.
 * @async
 */
const readCache = async () => {
  readCacheSpinner.start();
  const cacheLocation = isMac
    ? path.join(process.env.HOME, "/Library/Caches/Cypress")
    : path.join(process.env.TEMP, "../Cypress/Cache");
  const cachedVersions = await getCachedVersions(cacheLocation).catch(e => {
    readCacheSpinner.fail();
    throw new Error(e);
  });

  if (cachedVersions.length > 0) {
    readCacheSpinner.succeed(
      `Cypress cache contains ${chalk.yellowBright(cachedVersions)}`
    );
  } else {
    readCacheSpinner.succeed(`Cypress cache is empty`);
  }

  return { cachedVersions, cacheLocation };
};

/**
 * Cleans out Cypress cache of previous installs.
 * @param {Array} cachedVersions Array of directory version names.
 * @param {String} cacheLocation Path to cache directory.
 * @async
 */
const cleanCache = async (cachedVersions, cacheLocation) => {
  clearCacheSpinner.start();
  await clearCache(cacheLocation, cachedVersions).catch(e => {
    clearCacheSpinner.fail();
    throw new Error(e);
  });
  clearCacheSpinner.succeed("Cache cleared");
};

/**
 * Downloads and saves Cypress.zip
 * @param {String} downloadUrl Url to download.
 * @param {String} version Version of Cypress.
 * @async
 */
const downloadCypress = async (downloadUrl, version) => {
  await download(downloadUrl).catch(e => {
    downloadSpinner.fail();
    throw new Error(e);
  });
  downloadSpinner.succeed(
    `Downloaded Cypress ${chalk.yellowBright("v" + version)}`
  );
};

/**
 * Installs Cypress from the downloaded Cypress.zip
 * @param {String} version Version to install. i.e. 4.0.2
 * @async
 */
const installCypress = async version => {
  const installSpinner = installCypressSpinner(version);
  installSpinner.start();
  await addCypress(version).catch(e => {
    installSpinner.fail();
    throw new Error(e);
  });
  installSpinner.succeed(
    `Installed Cypress ${chalk.yellowBright("v" + version)}`
  );
};

/**
 * Updates Cypress to the latest version available.
 * @param {String} oldVersion Old version.
 * @param {String} newVersion New version.
 * @async
 */
const updateCypress = async (oldVersion, newVersion) => {
  const updateSpinner = updateCypressSpinner(oldVersion, newVersion);
  updateSpinner.start();
  await addCypress(newVersion).catch(e => {
    updateSpinner.fail();
    throw new Error(e);
  });
  updateSpinner.succeed(
    `Updated Cypress from ${chalk.yellowBright(
      "v" + oldVersion
    )} to ${chalk.yellowBright("v" + newVersion)}`
  );
};

module.exports = {
  title,
  getLatestDetails,
  getCurrentVersion,
  isUpToDate,
  readCache,
  cleanCache,
  downloadCypress,
  installCypress,
  updateCypress
};
