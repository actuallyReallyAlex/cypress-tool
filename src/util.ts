import boxen, { Options as boxenOptions, BorderStyle } from "boxen";
import chalk from "chalk";
import clear from "clear";
import fetch from "node-fetch";
import figlet from "figlet";
import fse from "fs-extra";
import httpsProxyAgent from "https-proxy-agent";
import inquirer from "inquirer";
import path from "path";
import ProgressBar from "progress";
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
// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  options?: { cwd?: string; env?: any; path?: string; shell?: boolean },
  dataParser?: (data: Buffer) => void,
  debug?: boolean
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<void | { code: number; signal: any }> =>
  new Promise((resolve, reject) => {
    const cp = spawn(command, args, options);
    if (debug) {
      cp.stdout.on("data", (data) => console.log(`stdout: ${data}`));
      cp.stderr.on("data", (data) => console.log(`stderr: ${data}`));
    }

    if (dataParser) {
      cp.stdout.on("data", dataParser);
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

/**
 * Gets the location of the Cypress cache.
 */
export const getCacheLocation = (): string => {
  let cacheLocation = "";
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

/**
 * Removes every version in the Cypress cache.
 */
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

// * Agent used for network requests
const agent = process.env.HTTP_PROXY
  ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
    new (httpsProxyAgent as any)(process.env.HTTP_PROXY)
  : undefined;

/**
 * Downloads and saves a .zip file of Cypress.
 * @param cypressUrl URL to download Cypress from.
 * @param zipPath Path to save .zip file to.
 */
export const downloadCypress = (
  cypressUrl: string,
  zipPath: string
): Promise<void> =>
  new Promise(async (resolve, reject) => {
    const response = await fetch(cypressUrl, { agent, method: "GET" });
    const contentLength = response.headers.get("content-length");
    const bar = new ProgressBar("Downloading [:bar] :percent :etas", {
      complete: "=",
      incomplete: " ",
      width: 50,
      total: Number(contentLength),
    });
    const fileStream = fse.createWriteStream(zipPath);
    response.body.pipe(fileStream);
    response.body.on("error", (err) => reject(err));
    response.body.on("data", (chunk) => bar.tick(chunk.length));
    fileStream.on("finish", async () => resolve());
  });

/**
 * Installs Cypress from previously downloaded .zip file.
 * @param version Cypress version.
 * @param zipPath Path to .zip file of Cypress.
 */
export const installCypress = (
  version: string,
  zipPath: string
): Promise<void> =>
  new Promise(async (resolve, reject) => {
    try {
      const installBar = new ProgressBar("Installing [:bar] :percent :etas", {
        complete: "=",
        incomplete: " ",
        width: 50,
        total: 100,
      });

      let installationCompleted = false;

      const parseInstallData = (data: Buffer) => {
        const stringData = data.toString();

        const percentCompleteDigit1 = stringData.match(/\d%/gm);
        const percentCompleteDigit2 = stringData.match(/\d\d%/gm);
        const percentCompleteDigit3 = stringData.match(/\d\d\d%/gm);

        const percentComplete = percentCompleteDigit3
          ? percentCompleteDigit3
          : percentCompleteDigit2
          ? percentCompleteDigit2
          : percentCompleteDigit1;

        const number =
          Number(percentComplete?.toString().replace(/%/gm, "")) || 1;

        if (number === 100) {
          installationCompleted = true;
        }

        if (installationCompleted) {
          if (!installBar.complete) {
            installBar.update(1);
          }
        } else {
          installBar.update(number / 100);
        }
      };

      await executeCommand(
        "npm",
        ["install", "-D", `cypress@${version}`],
        {
          env: { ...process.env, CYPRESS_INSTALL_BINARY: zipPath },
          path: undefined,
          shell: process.platform === "win32",
        },
        parseInstallData
      );

      resolve();
    } catch (error) {
      reject(error);
    }
  });

/**
 * https://dev.to/kingdaro/indexing-objects-in-typescript-1cgi
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const hasKey = <O>(obj: O, key: keyof any): key is keyof O => {
  return key in obj;
};

/**
 * Gets a list of available Cypress versions.
 */
export const getAvailableVersions = async (): Promise<string[]> => {
  let availableVersions: string[] = [];
  await executeCommand(
    "npm",
    ["show", "cypress", "versions", "-json"],
    {
      env: { ...process.env },
      path: undefined,
      shell: process.platform === "win32",
    },
    (data: Buffer) => {
      availableVersions = JSON.parse(data.toString());
      availableVersions.reverse();
    }
  );
  return availableVersions;
};

/**
 * Prompts user to select a specific Cypress version from a list of available versions.
 * @param availableVersions List of available Cypress versions.
 */
export const promptVersion = async (
  availableVersions: string[]
): Promise<string> => {
  const { version } = await inquirer.prompt([
    {
      type: "list",
      name: "version",
      message: "Choose a version of Cypress to install",
      choices: availableVersions,
    },
  ]);
  return version;
};
