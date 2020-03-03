import semver from "semver";

import { cypressUrl } from "../constants";
import { execute, spawnProcess } from "./process";
import { makeRequest } from "./request";

/**
 * Checks if the installed version matches the latest version.
 * @param {String} latestVersion Latest version of Cypress
 * @param {String} installedVersion Currently installed version of Cypress
 * @returns {Promise} Promise returns Boolean - true if up to date and false if not
 */
const checkIfUpToDate = (latestVersion, installedVersion) =>
  new Promise((resolve, reject) => {
    try {
      return resolve(semver.satisfies(installedVersion, `=${latestVersion}`));
    } catch (e) {
      return reject(e);
    }
  });

/**
 * Installs Cypress.
 * @param {String} latestVersion Version of Cypress to install
 * @returns {Promise}
 */
const installCypress = version =>
  new Promise(async (resolve, reject) => {
    try {
      await spawnProcess("npm install", ["-g", `cypress@${version}`], false);

      return resolve();
    } catch (e) {
      return reject(e);
    }
  });

/**
 * Gets version number of installed Cypress version, or returns false.
 * @returns {String|Boolean} Returns version number (3.0.0) or `false` if no install exists
 */
const getCurrentCypressVersion = () =>
  new Promise(async (resolve, reject) => {
    try {
      const stdout = await execute(`npm list -g --depth 0 cypress`);
      const index = stdout.indexOf("── ");
      return resolve(
        stdout
          .slice(index + 3, stdout.length)
          .trim()
          .replace("cypress@", "")
      );
    } catch (e) {
      return resolve(false);
    }
  });

/**
 * Get's latest Cypress details from download url.
 */
const getLatestCypressDetails = () =>
  new Promise(async (resolve, reject) => {
    try {
      const response = await makeRequest(cypressUrl);
      return resolve(response);
    } catch (e) {
      return reject(e);
    }
  });

module.exports = {
  checkIfUpToDate,
  installCypress,
  getCurrentCypressVersion,
  getLatestCypressDetails
};
