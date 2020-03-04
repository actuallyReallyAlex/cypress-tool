import chalk from 'chalk'
import path from 'path'

import { isMac } from '../constants'
import { addCypress, checkIfUpToDate, getCurrentCypressVersion, getLatestCypressDetails } from '../util/cypress'
import { clearCache, getCachedVersions } from '../util/fileSystem'
import { download } from '../util/request'
import {
  checkCypressInstallationSpinner,
  clearCacheSpinner,
  compareVersionsSpinner,
  downloadSpinner,
  getLatestCypressDetailsSpinner,
  installCypressSpinner,
  readCacheSpinner,
  updateCypressSpinner
} from '../util/spinners'
import { generateTitle } from '../util/title'

/**
 * Generates a pretty title.
 * @async
 */
const title = async () => await generateTitle('Cypress Tool')

/**
 * Gets latest Cypress details.
 * @param {Object} state Application State.
 * @returns {Object} Object of latest Cypress details.
 * @async
 */
const getLatestDetails = async state => {
  getLatestCypressDetailsSpinner.start()
  const latestCypressDetails = await getLatestCypressDetails().catch(e => {
    getLatestCypressDetailsSpinner.fail()
    throw new Error(e)
  })
  getLatestCypressDetailsSpinner.succeed(`Latest Cypress release is ${chalk.yellowBright('v' + latestCypressDetails.version)}`)
  state.latestCypressDetails = latestCypressDetails
  return latestCypressDetails
}

/**
 * Gets current Cypress version installed on machine.
 * @param {Object} state Application State.
 * @returns {String|false} Returns the string of the version if installed, or false otherwise.
 * @async
 */
const getCurrentVersion = async state => {
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
}

/**
 * Checks if the version of Cypress on the machine is up to date.
 * @param {Object} state Application State.
 * @returns {Boolean} boolean
 * @async
 */
const isUpToDate = async state => {
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
}

/**
 * Reads the Cypress cache.
 * @param {Object} state Application State.
 * @returns {Object} Returns object of `cachedVersions` and `cacheLocation`.
 * @async
 */
const readCache = async () => {
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
}

/**
 * Cleans out Cypress cache of previous installs.
 * @param {Object} state Application State.
 * @async
 */
const cleanCache = async state => {
  const { cacheLocation, cachedVersions } = state
  clearCacheSpinner.start()
  await clearCache(cacheLocation, cachedVersions).catch(e => {
    clearCacheSpinner.fail()
    throw new Error(e)
  })
  clearCacheSpinner.succeed('Cache cleared')
}

/**
 * Downloads and saves Cypress.zip
 * @param {Object} state Application State.
 * @async
 */
const downloadCypress = async state => {
  const downloadUrl = state.latestCypressDetails.packages[process.platform].url
  const version = state.latestCypressDetails.version

  await download(downloadUrl).catch(e => {
    downloadSpinner.fail()
    throw new Error(e)
  })
  downloadSpinner.succeed(`Downloaded Cypress ${chalk.yellowBright('v' + version)}`)
}

/**
 * Installs Cypress from the downloaded Cypress.zip
 * @param {Object} state Application State.
 * @async
 */
const installCypress = async state => {
  const version = state.latestCypressDetails.version
  const installSpinner = installCypressSpinner(version)
  installSpinner.start()
  await addCypress(version).catch(e => {
    installSpinner.fail()
    throw new Error(e)
  })
  installSpinner.succeed(`Installed Cypress ${chalk.yellowBright('v' + version)}`)
}

/**
 * Updates Cypress to the latest version available.
 * @param {Object} state Application State.
 * @async
 */
const updateCypress = async state => {
  const oldVersion = state.installedVersion
  const newVersion = state.latestCypressDetails.version
  const updateSpinner = updateCypressSpinner(oldVersion, newVersion)
  updateSpinner.start()
  await addCypress(newVersion).catch(e => {
    updateSpinner.fail()
    throw new Error(e)
  })
  updateSpinner.succeed(`Updated Cypress from ${chalk.yellowBright('v' + oldVersion)} to ${chalk.yellowBright('v' + newVersion)}`)
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
  updateCypress
}
