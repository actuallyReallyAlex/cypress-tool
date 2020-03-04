import chalk from 'chalk'
import inquirer from 'inquirer'

import { generateAboutPage, generateMainMenu } from './title'

/**
 * Displays About Menu.
 * @returns {Promise} Resolves after user chooses to exit.
 */
const displayAboutMenu = () =>
  new Promise(async (resolve, reject) => {
    try {
      await generateAboutPage()
      console.log('Press any key to return to Main Menu ...')
      await keypress()
      resolve()
    } catch (e) {
      return reject(e)
    }
  })

/**
 * Displays Main Menu based on current app state.
 * @param {Object} state Application State.
 * @returns {Promise} Resolves with choice of user.
 */
const displayMainMenu = state =>
  new Promise(async (resolve, reject) => {
    try {
      const { cachedVersions, installedVersion, isUpToDate } = state
      await generateMainMenu(state)

      const choices = []

      if (!installedVersion) {
        choices.push({ name: 'Install Cypress', value: 'install' })
      }

      if (installedVersion && !isUpToDate) {
        choices.push({ name: 'Update Cypress', value: 'update' })
      }

      choices.push(new inquirer.Separator())

      if (installedVersion) {
        choices.push({ name: 'Uninstall Cypress', value: 'uninstall' })
      }

      if (cachedVersions && cachedVersions.length > 0) {
        choices.push({ name: 'Clear Cypress Cache', value: 'clearCache' })
      }

      choices.push(new inquirer.Separator())
      choices.push({ name: 'About', value: 'about' })
      choices.push({ name: 'Exit', value: 'exit' })

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
 * Pauses the process execution and waits for the user to hit a key.
 * @returns {Promise} Resolves when user has entered a keystroke.
 * @async
 */
const keypress = async () => {
  process.stdin.setRawMode(true)
  return new Promise(resolve => {
    process.stdin.resume()
    process.stdin.once('data', data => {
      process.stdin.setRawMode(false)
      resolve()
    })
  })
}

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

module.exports = { displayAboutMenu, displayMainMenu, promptToInstallCypress, promptToUpdateCypress }
