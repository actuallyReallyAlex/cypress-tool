import 'core-js/stable'
import 'regenerator-runtime/runtime'
import chalk from 'chalk'

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

// TODO - Allow to download/install older Cypress versions as well
// TODO - Add Sentry error tracking
// TODO - Option to install locally as dev dependency
// TODO - package version number in title
// TODO - ClearCache Action
// TODO - Install Action
// TODO - Update Action
// TODO - On Main Menu -> Yellow if InstalledVersion could be updated. Green if isUpToDate
// TODO - Exit menu option
// TODO - Need an event emitter to hanlde repeat visits to Main Menu
// TODO - Use pkg to compile into an executable

const main = async () => {
  try {
    const state = {
      cacheLocation: null,
      cachedVersions: null,
      installedVersion: null,
      isUpToDate: null,
      latestCypressDetails: null,
      menuAction: null,
      shouldInstall: null,
      shouldUpdate: null
    }

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
  }
}

main()
