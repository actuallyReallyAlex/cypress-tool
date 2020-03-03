// const inquirer = require("inquirer");
// const ora = require("ora");
// const { exec, spawn } = require("child_process");
// const path = require("path");
// const fs = require("fs");
// const rimraf = require("rimraf");
const { cypressUrl } = require("../constants");
const { makeRequest } = require("./request");
const { execute } = require("./process");

const semver = require("semver");

/**
 * Installs Cypress.
 * @param {String} latestVersion Version of Cypress to install
 * @returns {Promise}
 */
const installCypress = version =>
  new Promise(async (resolve, reject) => {
    try {
      const stdout = await execute(`npm i -g cypress@${version}`);
      console.log({ stdout });
      return resolve();
    } catch (e) {
      return reject(e);
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

// const installCypress = latestVersion =>
//   new Promise(async (resolve, reject) => {
//     try {
//       const stdout = await execute(`npm i -g cypress@${latestVersion}`);
//       process.stdout.write(stdout);
//       resolve();
//     } catch (e) {
//       return reject(e);
//     }
//   });

// const removeFile = file =>
//   new Promise((resolve, reject) => {
//     try {
//       rimraf(file, error => {
//         if (error) {
//           return reject(error);
//         }
//         resolve();
//       });
//     } catch (e) {
//       return reject(e);
//     }
//   });

// const deleteSrc = () =>
//   new Promise((resolve, reject) => {
//     try {
//       rimraf("./src", error => {
//         if (error) {
//           return reject(error);
//         }
//         resolve();
//       });
//     } catch (e) {
//       return reject(e);
//     }
//   });

// const checkIfFileExists = path =>
//   new Promise((resolve, reject) => {
//     fs.stat(path, (err, stats) => {
//       if (err) {
//         return resolve(false);
//       }
//       return resolve(stats);
//     });
//   });

// const execute = command =>
//   new Promise((resolve, reject) => {
//     try {
//       exec(command, (error, stdout, stderr) => {
//         if (error) {
//           return reject(error);
//         }
//         return resolve(stdout);
//       });
//     } catch (e) {
//       return reject(e);
//     }
//   });

// /**
//  * Sets CYPRESS_INSTALL_BINARY to the Cypress.zip path.
//  */
// const setEnvVar = filePath =>
//   new Promise(async (resolve, reject) => {
//     try {
//       const fileExists = await checkIfFileExists(filePath);

//       if (fileExists) {
//         const out = await execute(`setx CYPRESS_INSTALL_BINARY ${filePath}`).catch(e => {
//           throw new Error(e);
//         });

//         if (out.includes("SUCCESS")) {
//           resolve();
//         } else {
//           reject("CYPRESS_INSTALL_BINARY was not set correctly.");
//         }
//       } else {
//         reject(`${filePath} does not exist!`);
//       }

//       resolve();
//     } catch (e) {
//       return reject(e);
//     }
//   });

// const promptUpdateCypress = (latestVersion, win32DownloadUrl) =>
//   new Promise(async (resolve, reject) => {
//     const setEnvSpinner = ora("Setting envrionment variable to Cypress.zip");
//     const clearCacheSpinner = ora("Clearing Cypress Cache");
//     const installCypressSpinner = ora(`Installing Cypress v${latestVersion}`);
//     try {
//       const updateQuestion = { name: "update", message: `Would you like to update to Cypress v${latestVersion}?`, type: "confirm" };

//       const answers = await inquirer.prompt([updateQuestion]);
//       const { update } = answers;

//       if (update) {
//         // await download(win32DownloadUrl).catch(e => {
//         //   throw new Error(e);
//         // });

//         // * Clear Cache
//         clearCacheSpinner.start();
//         const { TEMP } = process.env;
//         const cache = path.join(TEMP, "../Cypress/Cache");
//         await removeFile(cache).catch(e => {
//           clearCacheSpinner.fail();
//           throw new Error(e);
//         });
//         clearCacheSpinner.succeed("Cypress cache cleared");

//         // * Set CYPRESS_INSTALL_BINARY
//         setEnvSpinner.start();
//         const filePath = path.join(__dirname, "../../Cypress.zip");
//         await setEnvVar(filePath).catch(e => {
//           setEnvSpinner.fail();
//           throw new Error(e);
//         });
//         setEnvSpinner.succeed(`CYPRESS_INSTALL_BINARY set to ${filePath}`);

//         // TODO - Install Cypress globally
//         installCypressSpinner.start();
//         await installCypress(latestVersion).catch(e => {
//           installCypressSpinner.fail();
//           throw new Error(e);
//         });
//         installCypressSpinner.succeed();
//       } else {
//         console.log("User chose not to update");
//       }

//       resolve();
//     } catch (e) {
//       return reject(e);
//     }
//   });

module.exports = {
  getCurrentCypressVersion,
  getLatestCypressDetails,
  checkIfUpToDate,
  installCypress
};
