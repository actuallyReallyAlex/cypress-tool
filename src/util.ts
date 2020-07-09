import boxen, { Options as boxenOptions, BorderStyle } from "boxen";
import chalk from "chalk";
import clear from "clear";
import figlet from "figlet";
import fse from "fs-extra";
import path from "path";
import { spawn } from "child_process";

/**
 * Blank style applied to Boxen.
 */
export const blankBoxenStyle: boxenOptions = {
  borderStyle: {
    topLeft: " ",
    topRight: " ",
    bottomLeft: " ",
    bottomRight: " ",
    horizontal: " ",
    vertical: " ",
  },
  float: "center",
  padding: { top: 0, bottom: 0, right: 1, left: 1 },
};

/**
 * Default style applied to Boxen.
 */
export const defaultBoxenStyle: boxenOptions = {
  borderColor: "magentaBright",
  borderStyle: BorderStyle.Round,
  float: "center",
  padding: { top: 0, bottom: 0, right: 1, left: 1 },
};

/**
 * Uses Figlet to transform your text to ASCII.
 * @param {String} txt Text to be figlet-itized.
 * @param {Object} options Options object.
 * @returns {Promise} Resolves with text.
 */
const figletPromise = (txt: string, options: any): Promise<string> =>
  new Promise((resolve, reject) =>
    figlet.text(
      txt,
      options,
      (error: Error | null, result: string | undefined) => {
        if (error) {
          return reject(error);
        }

        resolve(result);
      }
    )
  );

/**
 * Pauses the process execution and waits for the user to hit a key.
 * @returns {Promise} Resolves when user has entered a keystroke.
 * @async
 */
export const keypress = async (): Promise<void> => {
  try {
    process.stdin.setRawMode(true);
    return new Promise((resolve, reject) => {
      try {
        process.stdin.resume();
        process.stdin.once("data", () => {
          process.stdin.setRawMode(false);
          resolve();
        });
      } catch (e) {
        return reject(e);
      }
    });
  } catch (e) {
    throw new Error(e);
  }
};

/**
 * Displays a title in the center of the terminal.
 * @param {String} title Title to be disaplayed.
 * @returns {Promise} Resolves after logging to the console.
 */
export const titleScreen = (title: string): Promise<void> =>
  new Promise(async (resolve, reject) => {
    try {
      const text: string = await figletPromise(title, {
        font: "Slant",
      });

      clear();
      console.log(boxen(chalk.blueBright(text), defaultBoxenStyle));
      resolve();
    } catch (e) {
      reject(e);
    }
  });

export default titleScreen;

/**
 * Executes a command in a spawned process.
 * @param command Command to execute in the process.
 * @param args Additional arguments to attach to the command.
 * @param options Optional options object to pass along.
 * @param debug Optional logging of output.
 */
export const executeCommand = async (
  command: string,
  args?: string[],
  options?: { cwd?: string; env?: any; path?: string; shell?: boolean },
  debug?: boolean
): Promise<void | { code: number; signal: any }> =>
  new Promise((resolve, reject) => {
    const cp = spawn(command, args, options);
    if (debug) {
      cp.stdout.on("data", (data) => console.log(`stdout: ${data}`));
      cp.stderr.on("data", (data) => console.log(`stderr: ${data}`));
    }

    cp.on("error", (err: Error) => {
      if (err) {
        console.log("");
        console.log(err);
        reject(err.message);
      }
    });
    cp.on("exit", (code: number | null, signal) => {
      if (code !== 0) {
        console.log("");
        reject({ args, command, code, signal, options });
      }
      resolve();
    });
    cp.on("message", (message) => console.log({ message }));
  });

export const getCacheLocation = (): string => {
  let cacheLocation: string = "";
  if (process.platform === "darwin") {
    if (!process.env.HOME) {
      console.log(chalk.red.inverse("No `process.env.HOME`"));
      return process.exit(1);
    }
    cacheLocation = path.join(process.env.HOME, "/Library/Caches/Cypress");
  } else {
    if (!process.env.TEMP) {
      console.log(chalk.red.inverse("No `process.env.TEMP`"));
      return process.exit(1);
    }
    cacheLocation = path.join(process.env.TEMP, "..", "Cypress/Cache");
  }
  return cacheLocation;
};

export const clearCache = (): Promise<void> =>
  new Promise(async (resolve, reject) => {
    try {
      const cacheLocation = getCacheLocation();
      const cacheContents: string[] = await fse.readdir(cacheLocation);
      await Promise.all(
        cacheContents.map(async (cacheDirName: string) => {
          await fse.remove(path.join(cacheLocation, cacheDirName));
        })
      );
      resolve();
    } catch (error) {
      reject(error);
    }
  });
