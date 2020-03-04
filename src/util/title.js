import boxen from 'boxen'
import chalk from 'chalk'
import clear from 'clear'
import figlet from 'figlet'

/**
 * Generates a pretty main menu title screen with relavent info.
 * @param {String|false} installedVersion Currently installed version of Cypress, or false if no version is installed.
 * @param {String} latestAvailableVersion Latest available version from Cypress.
 * @returns {Promise} Resolves after logging to the console.
 */
const generateMainMenu = (installedVersion, latestAvailableVersion) =>
  new Promise((resolve, reject) => {
    try {
      clear()
      figlet.text(
        'Cypress Tool',
        {
          font: 'slant'
        },
        (error, result) => {
          if (error) {
            return reject(error)
          }

          const installedVersionText = installedVersion
            ? `Installed Version: ${chalk.yellowBright('v' + installedVersion)}     |     `
            : `Installed Version: ${chalk.yellowBright('---')}     |     `
          const latestVersionText = `Latest Available Version: ${chalk.yellowBright('v' + latestAvailableVersion)}`

          const detailsText = installedVersionText + latestVersionText

          console.log(
            boxen(chalk.blueBright(result), {
              borderColor: 'magentaBright',
              borderStyle: 'round',
              float: 'center',
              padding: { top: 0, bottom: 0, right: 1, left: 1 }
            })
          )
          console.log(
            boxen(detailsText, {
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
            })
          )
          return resolve()
        }
      )
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
  new Promise((resolve, reject) => {
    clear()
    figlet.text(
      title,
      {
        font: 'slant'
      },
      (error, result) => {
        if (error) {
          console.error(error)
          resolve()
        }

        console.log(
          boxen(chalk.blueBright(result), {
            borderColor: 'magentaBright',
            borderStyle: 'round',
            float: 'center',
            padding: { top: 0, bottom: 0, right: 1, left: 1 }
          })
        )
        return resolve()
      }
    )
  })

module.exports = { generateMainMenu, generateTitle }
