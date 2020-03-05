import chalk from 'chalk'
import path from 'path'

import { isMac } from '../constants'
import { addCypress, checkIfUpToDate, getCurrentCypressVersion, getCypressVersions, getLatestCypressDetails, removeCypress } from '../util/cypress'
import { clearCache, getCachedVersions } from '../util/fileSystem'
import { displayAboutMenu, promptCypressVersion } from '../util/prompts'
import { download } from '../util/request'
import {
  checkCypressInstallationSpinner,
  clearCacheSpinner,
  compareVersionsSpinner,
  downloadSpinner,
  getLatestCypressDetailsSpinner,
  installCypressSpinner,
  readCacheSpinner,
  uninstallSpinner,
  updateCypressSpinner
} from '../util/spinners'
import { generateTitle } from '../util/title'

/**
 * Generates a pretty title.
 * @async
 */
const title = async () => {
  try {
    await generateTitle('Cypress Tool')
  } catch (e) {
    throw new Error()
  }
}

/**
 * Gets latest Cypress details.
 * @param {Object} state Application State.
 * @returns {Object} Object of latest Cypress details.
 * @async
 */
const getLatestDetails = async state => {
  try {
    getLatestCypressDetailsSpinner.start()
    const latestCypressDetails = await getLatestCypressDetails().catch(e => {
      getLatestCypressDetailsSpinner.fail()
      throw new Error(e)
    })
    getLatestCypressDetailsSpinner.succeed(`Latest Cypress release is ${chalk.yellowBright('v' + latestCypressDetails.version)}`)
    state.latestCypressDetails = latestCypressDetails
    return latestCypressDetails
  } catch (e) {
    throw new Error(e)
  }
}

/**
 * Gets current Cypress version installed on machine.
 * @param {Object} state Application State.
 * @returns {String|false} Returns the string of the version if installed, or false otherwise.
 * @async
 */
const getCurrentVersion = async state => {
  try {
    checkCypressInstallationSpinner.start()
    const currentCypressVersion = await getCurrentCypressVersion().catch(e => {
      checkCypressInstallationSpinner.fail()
      throw new Error(e)
    })

    if (currentCypressVersion) {
      checkCypressInstallationSpinner.succeed(`Installed version is ${chalk.yellowBright(currentCypressVersion)}`)
    } else {
      checkCypressInstallationSpinner.warn('No installed Cypress version detected')
    }

    state.installedVersion = currentCypressVersion
    return currentCypressVersion
  } catch (e) {
    throw new Error(e)
  }
}

/**
 * Checks if the version of Cypress on the machine is up to date.
 * @param {Object} state Application State.
 * @returns {Boolean} boolean
 * @async
 */
const isUpToDate = async state => {
  try {
    let upToDate = false

    const { installedVersion, latestCypressDetails } = state
    const currentAvailableVersion = latestCypressDetails.version

    if (installedVersion) {
      compareVersionsSpinner.start()
      upToDate = await checkIfUpToDate(currentAvailableVersion, installedVersion).catch(e => {
        compareVersionsSpinner.fail()
        throw new Error(e)
      })

      if (upToDate) {
        compareVersionsSpinner.succeed(chalk.greenBright(`v${installedVersion}`) + ' = ' + chalk.greenBright(`v${currentAvailableVersion}`))
      } else {
        compareVersionsSpinner.warn(chalk.redBright(`v${installedVersion}`) + ' < ' + chalk.greenBright(`v${currentAvailableVersion}`))
      }
    }

    state.isUpToDate = upToDate
    return upToDate
  } catch (e) {
    throw new Error(e)
  }
}

/**
 * Reads the Cypress cache.
 * @param {Object} state Application State.
 * @returns {Object} Returns object of `cachedVersions` and `cacheLocation`.
 * @async
 */
const readCache = async state => {
  try {
    readCacheSpinner.start()
    const cacheLocation = isMac ? path.join(process.env.HOME, '/Library/Caches/Cypress') : path.join(process.env.TEMP, '../Cypress/Cache')
    const cachedVersions = await getCachedVersions(cacheLocation).catch(e => {
      readCacheSpinner.fail()
      throw new Error(e)
    })

    if (cachedVersions.length > 0) {
      readCacheSpinner.succeed(`Cypress cache contains ${chalk.yellowBright(cachedVersions)}`)
    } else {
      readCacheSpinner.succeed(`Cypress cache is empty`)
    }

    state.cacheLocation = cacheLocation
    state.cachedVersions = cachedVersions
    return { cachedVersions, cacheLocation }
  } catch (e) {
    throw new Error(e)
  }
}

/**
 * Cleans out Cypress cache of previous installs.
 * @param {Object} state Application State.
 * @async
 */
const cleanCache = async state => {
  try {
    const { cacheLocation, cachedVersions } = state
    clearCacheSpinner.start()
    await clearCache(cacheLocation, cachedVersions).catch(e => {
      clearCacheSpinner.fail()
      throw new Error(e)
    })
    state.cachedVersions = []
    clearCacheSpinner.succeed('Cache cleared')
  } catch (e) {
    throw new Error(e)
  }
}

/**
 * Downloads and saves Cypress.zip
 * @param {Object} state Application State.
 * @param {String} forceVersion Optional. If specified, downloads this particular version.
 * @async
 */
const downloadCypress = async (state, forceVersion) => {
  try {
    let downloadUrl = state.latestCypressDetails.packages[process.platform].url
    let version = state.latestCypressDetails.version

    if (forceVersion) {
      downloadUrl = `https://download.cypress.io/desktop/${forceVersion}?platform=${process.platform}`
      version = forceVersion
    }

    await download(downloadUrl).catch(e => {
      downloadSpinner.fail()
      throw new Error(e)
    })
    downloadSpinner.succeed(`Downloaded Cypress ${chalk.yellowBright('v' + version)}`)
  } catch (e) {
    throw new Error(e)
  }
}

/**
 * Installs Cypress from the downloaded Cypress.zip. Installs latest version!
 * @param {Object} state Application State.
 * @param {String} forceVersion Optional. If specified, downloads this particular version.
 * @async
 */
const installCypress = async (state, forceVersion) => {
  try {
    let version = state.latestCypressDetails.version

    if (forceVersion) {
      version = forceVersion
    }

    const installSpinner = installCypressSpinner(version)
    installSpinner.start()
    await addCypress(version).catch(e => {
      installSpinner.fail()
      throw new Error(e)
    })
    state.installedVersion = version
    const upToDate = await checkIfUpToDate(state.latestCypressDetails.version, version)
    state.isUpToDate = upToDate
    state.cachedVersions.push(version)
    installSpinner.succeed(`Installed Cypress ${chalk.yellowBright('v' + version)}`)
  } catch (e) {
    throw new Error(e)
  }
}

/**
 * Updates Cypress to the latest version available.
 * @param {Object} state Application State.
 * @async
 */
const updateCypress = async state => {
  try {
    const oldVersion = state.installedVersion
    const newVersion = state.latestCypressDetails.version
    const updateSpinner = updateCypressSpinner(oldVersion, newVersion)
    updateSpinner.start()
    await addCypress(newVersion).catch(e => {
      updateSpinner.fail()
      throw new Error(e)
    })
    state.installedVersion = newVersion
    state.isUpToDate = true
    updateSpinner.succeed(`Updated Cypress from ${chalk.yellowBright('v' + oldVersion)} to ${chalk.yellowBright('v' + newVersion)}`)
  } catch (e) {
    throw new Error(e)
  }
}

/**
 * Uninstalls Cypress from system.
 * @param {Object} state Application state.
 * @async
 */
const uninstallCypress = async state => {
  try {
    uninstallSpinner.start()
    await removeCypress().catch(e => {
      uninstallSpinner.fail()
      throw new Error(e)
    })
    state.installedVersion = false
    uninstallSpinner.succeed(`Uninstalled Cypress`)
  } catch (e) {
    throw new Error(e)
  }
}

/**
 * Interprets user selected action from main menu.
 * @param {Object} state Application state.
 */
const interpretMenuAction = async state => {
  try {
    const { menuAction } = state

    const actions = {
      about: async () => {
        await displayAboutMenu()
        state.menuActionEmitter.emit('actionCompleted', state)
      },
      clearCache: async () => {
        await readCache(state)
        await cleanCache(state)
        state.menuActionEmitter.emit('actionCompleted', state)
      },
      exit: () => process.exit(0),
      install: async () => {
        // * Get list of all available Cypress versions
        const availableVersions = await getCypressVersions()
        // * Prompt user to pick a Cypress version to install
        const version = await promptCypressVersion(availableVersions)
        await downloadCypress(state, version)
        await installCypress(state, version)
        state.menuActionEmitter.emit('actionCompleted', state)
      },
      uninstall: async () => {
        await uninstallCypress(state)
        state.menuActionEmitter.emit('actionCompleted', state)
      },
      update: async () => {
        await updateCypress(state)
        state.menuActionEmitter.emit('actionCompleted', state)
      }
    }

    await actions[menuAction]()
  } catch (e) {
    throw new Error(e)
  }
}

module.exports = {
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
}
