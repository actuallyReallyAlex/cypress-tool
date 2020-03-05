import boxen from 'boxen'
import chalk from 'chalk'
import clear from 'clear'
import figlet from 'figlet'
import { version } from '../../package.json'

/**
 * Blank style applied to Boxen.
 */
const blankBoxenStyle = {
  borderStyle: {
    topLeft: ' ',
    topRight: ' ',
    bottomLeft: ' ',
    bottomRight: ' ',
    horizontal: ' ',
    vertical: ' '
  },
  float: 'center',
  padding: { top: 0, bottom: 0, right: 1, left: 1 }
}

/**
 * Default style applied to Boxen.
 */
const defaultBoxenStyle = {
  borderColor: 'magentaBright',
  borderStyle: 'round',
  float: 'center',
  padding: { top: 0, bottom: 0, right: 1, left: 1 }
}

/**
 * Uses Figlet to transform your text to ASCII.
 * @param {String} txt Text to be figlet-itized.
 * @param {Object} options Options object.
 * @returns {Promise} Resolves with text.
 */
const figletPromise = (txt, options = {}) =>
  new Promise((resolve, reject) =>
    figlet.text(txt, options, (error, result) => {
      if (error) {
        return reject(error)
      }

      return resolve(result)
    })
  )

/**
 * Generates the About Page.
 * @returns {Promise} Resolves after logging to the console.
 */
const generateAboutPage = () =>
  new Promise(async (resolve, reject) => {
    try {
      clear()
      const text = await figletPromise('Cypress Tool', { font: 'slant' })
      const versionText = `${chalk.yellowBright('v' + version)}`
      const authorText = `Author: ${chalk.greenBright('Alex Lee')}`

      console.log(boxen(chalk.blueBright(text), defaultBoxenStyle))
      console.log(boxen(versionText, blankBoxenStyle))
      console.log(boxen(authorText, blankBoxenStyle))
      return resolve()
    } catch (e) {
      return reject(e)
    }
  })

/**
 * Generates a pretty main menu title screen with relavent info.
 * @param {Object} state Application state.
 * @returns {Promise} Resolves after logging to the console.
 */
const generateMainMenu = state =>
  new Promise(async (resolve, reject) => {
    try {
      clear()
      const text = await figletPromise('Cypress Tool', { font: 'slant' })
      const { installedVersion, isUpToDate, latestCypressDetails } = state
      const latestAvailableVersion = latestCypressDetails.version

      const installedVersionText = installedVersion
        ? `Installed Version: ${isUpToDate ? chalk.greenBright('v' + installedVersion) : chalk.yellowBright('v' + installedVersion)}     |     `
        : `Installed Version: ${chalk.yellowBright('---')}     |     `
      const latestVersionText = `Latest Available Version: ${chalk.greenBright('v' + latestAvailableVersion)}`

      const detailsText = installedVersionText + latestVersionText

      console.log(boxen(chalk.blueBright(text), defaultBoxenStyle))
      console.log(boxen(detailsText, blankBoxenStyle))
      return resolve()
    } catch (e) {
      return reject(e)
    }
  })

/**
 * Generates a pretty title in the terminal.
 * @param {String} title Title
 * @returns {Promise} Resolves after logging to the console.
 */
const generateTitle = title =>
  new Promise(async (resolve, reject) => {
    try {
      clear()
      const text = await figletPromise(title, { font: 'slant' })
      console.log(boxen(chalk.blueBright(text), defaultBoxenStyle))
      return resolve()
    } catch (e) {
      return reject(e)
    }
  })

module.exports = { generateAboutPage, generateMainMenu, generateTitle }
