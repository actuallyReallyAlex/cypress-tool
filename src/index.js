const Sentry = require('@sentry/node')
Sentry.init({ dsn: 'https://166cfccac6334fa29750ddf656c53445@sentry.io/3668079' })
import 'core-js/stable'
import 'regenerator-runtime/runtime'
import chalk from 'chalk'
import EventEmitter from 'events'

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

import { displayMainMenu, promptToInstallCypress, promptToUpdateCypress } from './util/prompts'
import {
  title,
  getLatestDetails,
  getCurrentVersion,
  isUpToDate,
  readCache,
  cleanCache,
  downloadCypress,
  installCypress,
  updateCypress,
  interpretMenuAction
} from './steps'

import { initializeDirectory } from './util/fileSystem'

// * Prioritized TODOs
// TODO - Option to install locally as dev dependency
// TODO - Cooler name than 'Cypress Tool'
// TODO - Persist app state with configstore for a faster app

// * Not Prioritized TODOs
// TODO - Put CypressTool directory path into state
// TODO - Put some constants like isMac into state
// TODO - Able to exit process fully in executable
// TODO - Fully test on Windows
// TODO - Check if Cypress has already been downloaded and use that

const main = async () => {
  try {
    class MenuActionEmitter extends EventEmitter {}

    const menuActionEmitter = new MenuActionEmitter()
    menuActionEmitter.on('actionCompleted', async state => {
      await displayMainMenu(state)

      interpretMenuAction(state)
    })

    const state = {
      cacheLocation: null,
      cachedVersions: [],
      installedVersion: null,
      isUpToDate: null,
      latestCypressDetails: null,
      menuAction: null,
      menuActionEmitter,
      shouldInstall: null,
      shouldUpdate: null
    }

    // * Init CypressTool Directory
    await initializeDirectory()

    // * Title
    await title()

    // * Get Latest Cypress Details
    await getLatestDetails(state)

    // * Check if Cypress install exists
    await getCurrentVersion(state)

    // * Compare versions (only if installed)
    await isUpToDate(state)

    // * Prompt to install (only if not installed)
    if (!state.installedVersion) {
      await promptToInstallCypress(state).catch(e => {
        throw new Error(e)
      })

      // * User selected to install latest version of Cypress
      if (state.shouldInstall) {
        // * Detect if user has a HTTP_PROXY env var set up
        const userNeedsProxy = process.env.HTTP_PROXY

        if (userNeedsProxy) {
          console.log(chalk.red('NEED TO DEVELOP WHAT SHOULD HAPPEN FOR PROXY'))
          process.exit()
        } else {
          // * Read Cypress Cache
          await readCache(state)

          if (state.cachedVersions.length > 0) {
            // * Clear Cypress Cache
            await cleanCache(state)
          }

          // * Download Cypress.zip for platform
          await downloadCypress(state)

          // * Install Cypress from Cypress.zip
          await installCypress(state)
        }
      }
    }

    if (state.installedVersion && !state.isUpToDate) {
      // * Prompt to update (only if installed and out of date)
      await promptToUpdateCypress(state)

      if (state.shouldUpdate) {
        // * Update Cypress to the latest version available
        await updateCypress(state)
      }
    }

    await displayMainMenu(state)

    interpretMenuAction(state)
  } catch (e) {
    console.log(chalk.red(e))
    throw new Error(e)
  }
}

module.exports = main
