import chalk from "chalk";
import inquirer from "inquirer";

/**
 * Prompts user to install Cypress.
 * @param {String} latestVersion Latest version of Cypress.
 * @returns {Promise} Resolves with a boolean of the user's choice.
 */
const promptToInstallCypress = latestVersion =>
  new Promise(async (resolve, reject) => {
    try {
      const { shouldInstall } = await inquirer.prompt([
        {
          type: "confirm",
          message: `Would you like to install Cypress ${chalk.yellowBright(
            "v" + latestVersion
          )}?`,
          name: "shouldInstall"
        }
      ]);

      return resolve(shouldInstall);
    } catch (e) {
      return reject(e);
    }
  });

/**
 * Prompts user to update Cypress.
 * @param {String} oldVersion Old version.
 * @param {String} newVersion New version.
 * @returns {Promise} Resolves with a boolean of the user's choice.
 */
const promptToUpdateCypress = (oldVersion, newVersion) =>
  new Promise(async (resolve, reject) => {
    try {
      const { shouldUpdate } = await inquirer.prompt([
        {
          type: "confirm",
          message: `Would you like to update your Cypress installation from ${chalk.yellowBright(
            "v" + oldVersion
          )} to ${chalk.yellowBright("v" + newVersion)}?`,
          name: "shouldUpdate"
        }
      ]);

      return resolve(shouldUpdate);
    } catch (e) {
      return reject(e);
    }
  });

module.exports = { promptToInstallCypress, promptToUpdateCypress };
