const { exec } = require("child_process");

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
          return reject(error);
        }
        return resolve(stdout);
      });
    } catch (e) {
      return reject(e);
    }
  });

module.exports = { execute };
