import boxen from "boxen";
import chalk from "chalk";
import figlet from "figlet";

/**
 * Generates a pretty title in the terminal.
 * @param {String} title Title
 * @returns {Promise} Resolves after logging to the console.
 */
const generateTitle = title =>
  new Promise((resolve, reject) => {
    figlet.text(
      title,
      {
        font: "slant"
      },
      (error, result) => {
        if (error) {
          console.error(error);
          resolve();
        }

        console.log(
          boxen(chalk.blueBright(result), {
            borderColor: "magentaBright",
            borderStyle: "round",
            float: "center",
            padding: { top: 0, bottom: 0, right: 1, left: 1 }
          })
        );
        return resolve();
      }
    );
  });

module.exports = { generateTitle };
