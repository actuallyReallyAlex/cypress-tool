import chalk from 'chalk'
import inquirer from 'inquirer'

import { generateMainMenu } from './title'

/**
 * Displays Main Menu based on current app state.
 * @param {Object} state Application State.
 * @returns {Promise} Resolves with choice of user.
 */
const displayMainMenu = state =>
  new Promise(async (resolve, reject) => {
    try {
      const { installedVersion, isUpToDate, latestCypressDetails } = state
      const latestAvailableVersion = latestCypressDetails.version
      await generateMainMenu(installedVersion, latestAvailableVersion)
      const choices = []

      if (!installedVersion) {
        choices.push({ name: 'Install Cypress', value: 'install' })
      }

      // TODO - If upToDate, should not have option to UpdateCypress
      // * but can downgrade if want
      if (installedVersion && !isUpToDate) {
        choices.push({ name: 'Update Cypress', value: 'update' })
      }

      choices.push(new inquirer.Separator())
      choices.push({ name: 'Uninstall Cypress', value: 'uninstall' })
      choices.push({ name: 'Clear Cypress Cache', value: 'clearCache' })

      const { menuAction } = await inquirer.prompt([
        {
          type: 'list',
          name: 'menuAction',
          message: 'Main Menu',
          choices
        }
      ])

      state.menuAction = menuAction
      return resolve(menuAction)
    } catch (e) {
      return reject(e)
    }
  })

/**
 * Prompts user to install Cypress.
 * @param {Object} state Application State.
 * @returns {Promise} Resolves with a boolean of the user's choice.
 */
const promptToInstallCypress = state =>
  new Promise(async (resolve, reject) => {
    try {
      const latestVersion = state.latestCypressDetails.version
      const { shouldInstall } = await inquirer.prompt([
        {
          type: 'confirm',
          message: `Would you like to install Cypress ${chalk.yellowBright('v' + latestVersion)}?`,
          name: 'shouldInstall'
        }
      ])

      state.shouldInstall = shouldInstall
      return resolve(shouldInstall)
    } catch (e) {
      return reject(e)
    }
  })

/**
 * Prompts user to update Cypress.
 * @param {Object} state Application State.
 * @returns {Promise} Resolves with a boolean of the user's choice.
 */
const promptToUpdateCypress = state =>
  new Promise(async (resolve, reject) => {
    try {
      const oldVersion = state.installedVersion
      const newVersion = state.latestCypressDetails.version
      const { shouldUpdate } = await inquirer.prompt([
        {
          type: 'confirm',
          message: `Would you like to update your Cypress installation from ${chalk.yellowBright('v' + oldVersion)} to ${chalk.yellowBright(
            'v' + newVersion
          )}?`,
          name: 'shouldUpdate'
        }
      ])

      state.shouldUpdate = shouldUpdate
      return resolve(shouldUpdate)
    } catch (e) {
      return reject(e)
    }
  })

module.exports = { displayMainMenu, promptToInstallCypress, promptToUpdateCypress }
