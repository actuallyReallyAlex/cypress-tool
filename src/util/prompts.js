import chalk from 'chalk'
import inquirer from 'inquirer'

/**
 * Displays Main Menu based on current app state.
 * @param {String|false} installedVersion Currently installed version of Cypress, or false if no version is installed.
 * @param {Boolean} upToDate If the currently installed version of Cypress is up to date.
 * @param {Object} latestCypressDetails Object of data from Cypress on latest release.
 * @returns {Promise} Resolves with choice of user.
 */
const displayMainMenu = (installedVersion, upToDate, latestCypressDetails) =>
  new Promise(async (resolve, reject) => {
    try {
      const choices = []

      if (!installedVersion) {
        choices.push('Install Cypress')
      }

      if (installedVersion && !upToDate) {
        choices.push('Update Cypress')
      }

      choices.push(new inquirer.Separator())
      choices.push('Uninstall Cypress')
      choices.push('Clear Cypress Cache')

      const { menuAction } = await inquirer.prompt([
        {
          type: 'list',
          name: 'menuAction',
          message: 'Main Menu',
          choices
        }
      ])
      return resolve(menuAction)
    } catch (e) {
      return reject(e)
    }
  })

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
          type: 'confirm',
          message: `Would you like to install Cypress ${chalk.yellowBright('v' + latestVersion)}?`,
          name: 'shouldInstall'
        }
      ])

      return resolve(shouldInstall)
    } catch (e) {
      return reject(e)
    }
  })

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
          type: 'confirm',
          message: `Would you like to update your Cypress installation from ${chalk.yellowBright('v' + oldVersion)} to ${chalk.yellowBright(
            'v' + newVersion
          )}?`,
          name: 'shouldUpdate'
        }
      ])

      return resolve(shouldUpdate)
    } catch (e) {
      return reject(e)
    }
  })

module.exports = { displayMainMenu, promptToInstallCypress, promptToUpdateCypress }
