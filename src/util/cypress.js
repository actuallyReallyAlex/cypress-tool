import path from 'path'
import semver from 'semver'

import { cypressUrl, isMac } from '../constants'
import { checkIfFileExists } from './fileSystem'
import { execute, spawnProcess } from './process'
import { makeRequest } from './request'

/**
 * Installs Cypress.
 * @param {String} latestVersion Version of Cypress to install
 * @returns {Promise}
 */
const addCypress = version =>
  new Promise(async (resolve, reject) => {
    try {
      const zipPath = isMac ? path.join(process.env.HOME, '/CypressTool') : path.join(process.env.TEMP, '/CypressTool')
      const fileExists = await checkIfFileExists(zipPath)

      if (!fileExists) {
        throw new Error(`${zipPath} does not exist!`)
      }

      await spawnProcess('npm install', ['-g', `cypress@${version}`], false, {
        CYPRESS_INSTALL_BINARY: zipPath
      })

      return resolve()
    } catch (e) {
      return reject(e)
    }
  })

/**
 * Checks if the installed version matches the latest version.
 * @param {String} latestVersion Latest version of Cypress
 * @param {String} installedVersion Currently installed version of Cypress
 * @returns {Promise} Promise returns Boolean - true if up to date and false if not
 */
const checkIfUpToDate = (latestVersion, installedVersion) =>
  new Promise((resolve, reject) => {
    try {
      return resolve(semver.satisfies(installedVersion, `=${latestVersion}`))
    } catch (e) {
      return reject(e)
    }
  })

/**
 * Gets version number of installed Cypress version, or returns false.
 * @returns {Promise} Resolves with version number (3.0.0) or `false` if no install exists
 */
const getCurrentCypressVersion = () =>
  new Promise(async (resolve, reject) => {
    try {
      const stdout = await execute(`npm list -g --depth 0 cypress`)
      const index = stdout.indexOf('── ')
      return resolve(
        stdout
          .slice(index + 3, stdout.length)
          .trim()
          .replace('cypress@', '')
      )
    } catch (e) {
      return resolve(false)
    }
  })

/**
 * Gets all available Cypress versions.
 * @returns {Promise} Resolves to an array of all available Cypress versions.
 */
const getCypressVersions = () =>
  new Promise(async (resolve, reject) => {
    try {
      const output = await execute('npm show cypress versions -json')
      return resolve(JSON.parse(output).reverse())
    } catch (e) {
      return reject(e)
    }
  })

/**
 * Get's latest Cypress details from download url.
 * @returns {Promise} Resolves with response from Cypress.
 */
const getLatestCypressDetails = () =>
  new Promise(async (resolve, reject) => {
    try {
      const response = await makeRequest(cypressUrl)
      return resolve(response)
    } catch (e) {
      return reject(e)
    }
  })

/**
 * Removes Cypress from system.
 * @returns {Promise} Resolves when Cypress is uninstalled.
 */
const removeCypress = () =>
  new Promise(async (resolve, reject) => {
    try {
      await spawnProcess('npm uninstall', ['-g', `cypress`], false)

      return resolve()
    } catch (e) {
      return reject(e)
    }
  })

module.exports = {
  addCypress,
  checkIfUpToDate,
  getCurrentCypressVersion,
  getCypressVersions,
  getLatestCypressDetails,
  removeCypress
}
