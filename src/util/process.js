import { exec, spawn } from 'child_process'

/**
 * Executes a command in a side process.
 * @param {String} command Command to execute in a terminal
 * @returns {Promise} Stdout of process if no error received, or rects with an error if present.
 */
const execute = command =>
  new Promise((resolve, reject) => {
    try {
      exec(command, (error, stdout, stderr) => {
        if (error) {
          return reject(error)
        }
        return resolve(stdout)
      })
    } catch (e) {
      return reject(e)
    }
  })

/**
 * Spawns a new process and writes output
 * @param {String} command Command to execute
 * @param {Array} arg Array of arguments (String) to add to command
 * @param {Boolean} writeOutput Optiona. Default = true. If true, write output to the console.
 * @param {Object} additionalEnv Additional envrironment variables for spawn process.
 * @returns {Promise}
 */
const spawnProcess = (command, arg, writeOutput = true, additionalEnv = {}) =>
  new Promise(async (resolve, reject) => {
    try {
      const proc = spawn(command, arg, {
        shell: true,
        env: { ...process.env, ...additionalEnv }
      })

      if (writeOutput) {
        proc.stdout.on('data', data => process.stdout.write(data))
        proc.stderr.on('data', data => process.stderr.write(data))
      }

      proc.on('close', code => resolve())
      proc.on('error', error => reject(error))
    } catch (e) {
      return reject(e)
    }
  })

module.exports = { execute, spawnProcess }
