import boxen from "boxen";
import chalk from "chalk";
import fetch from "node-fetch";
import fse from "fs-extra";
import httpsProxyAgent from "https-proxy-agent";
import inquirer from "inquirer";
import path from "path";
import ProgressBar from "progress";

import { blankBoxenStyle } from "./constants";
import { titleScreen, executeCommand } from "./util";

import { AppState, MenuAction } from "./types";

/**
 * Displays Main Menu to user.
 * @param {AppState} state State of application.
 * @returns {Promise} Resolves with menuAction value.
 */
export const displayMainMenu = (state: AppState): Promise<MenuAction> =>
  new Promise(async (resolve, reject) => {
    try {
      const { menuAction } = await inquirer.prompt([
        {
          type: "list",
          message: "Main Menu",
          name: "menuAction",
          choices: [
            { value: "installCypress", name: "Install Cypress" },
            new inquirer.Separator(),
            { value: "about", name: "About" },
            { value: "exit", name: "Exit" },
          ],
        },
      ]);
      state.menuAction = menuAction;
      resolve(menuAction);
    } catch (e) {
      reject(e);
    }
  });

/**
 * Pauses the process execution and waits for the user to hit a key.
 * @returns {Promise} Resolves when user has entered a keystroke.
 * @async
 */
const keypress = async (): Promise<void> => {
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
 * Interprets user selected menu action.
 * @param {AppState} state State of application.
 * @returns {Promise}
 */
export const interpretMenuAction = async (state: AppState): Promise<void> => {
  try {
    if (state.menuAction === null) {
      throw new Error("menuAction can not be `null`");
    }
    const actions = {
      about: async (state: AppState): Promise<void> => {
        await titleScreen("cypress-tool");
        console.log(
          boxen(chalk.blueBright(`Author: `) + "Alex Lee", blankBoxenStyle)
        );

        console.log("Press any key to return to Main Menu ...");
        await keypress();
        state.menuActionEmitter.emit("actionCompleted", state);
      },
      installCypress: async (state: AppState): Promise<void> => {
        try {
          await titleScreen("cypress-tool");

          // * Clear Cypress Cache
          console.log("Clearing cache");
          let cacheLocation: string = "";
          if (process.platform === "darwin") {
            if (!process.env.HOME) {
              console.log(chalk.red.inverse("No `process.env.HOME`"));
              return;
            }
            cacheLocation = path.join(
              process.env.HOME,
              "/Library/Caches/Cypress"
            );
          } else {
            if (!process.env.TEMP) {
              console.log(chalk.red.inverse("No `process.env.TEMP`"));
              return;
            }
            cacheLocation = path.join(process.env.TEMP, "..", "Cypress/Cache");
          }
          const cacheContents: string[] = await fse.readdir(cacheLocation);

          console.log(cacheLocation);
          console.log(cacheContents);

          // * Delete each cache
          await Promise.all(
            cacheContents.map(async (cacheDirName: string) => {
              await fse.remove(path.join(cacheLocation, cacheDirName));
            })
          );

          const newCacheContents: string[] = await fse.readdir(cacheLocation);

          console.log(newCacheContents);

          // * Download Cypress.zip for platform

          const agent = process.env.HTTP_PROXY
            ? new (httpsProxyAgent as any)(process.env.HTTP_PROXY)
            : undefined;

          console.log(agent);
          const response = await fetch(
            "https://download.cypress.io/desktop.json",
            {
              agent,
              headers: {
                "Content-Type": "application/json",
              },
              method: "GET",
            }
          );
          const info = await response.json();
          // const response = await axios.get(
          //   "https://download.cypress.io/desktop.json"
          // );
          const cypressUrl = info.packages[process.platform].url;
          const version = info.version;
          console.log(`Downloading Cypress from ${cypressUrl}`);
          fetch(cypressUrl).then(async (response) => {
            const contentLength = await response.headers.get("content-length");
            const bar = new ProgressBar("Downloading [:bar] :percent :etas", {
              complete: "=",
              incomplete: " ",
              width: 50,
              total: Number(contentLength),
            });
            const zipPath = path.join(__dirname, "test.zip");
            const fileStream = fse.createWriteStream(zipPath);
            response.body.pipe(fileStream);
            response.body.on("error", (err) =>
              console.log(chalk.red.inverse(err))
            );
            response.body.on("data", (chunk) => bar.tick(chunk.length));
            fileStream.on("finish", async () => {
              console.log("DONE");
              console.log(zipPath);

              // * Install Cypress from Cypress.zip
              try {
                console.log("Installing Cypress");
                await executeCommand(
                  "npm",
                  ["install", "-D", `cypress@${version}`],
                  {
                    env: { ...process.env, CYPRESS_INSTALL_BINARY: zipPath },
                    path: undefined,
                    shell: process.platform === "win32",
                  }
                );

                console.log("Done!");
                console.log("Press any key to continue...");

                await keypress();
                state.menuActionEmitter.emit("actionCompleted", state);
              } catch (error) {
                console.log(chalk.red.inverse(error));
              }
            });
          });
        } catch (error) {
          console.log(chalk.inverse.red(error));
        }
      },
      exit: (state: AppState): void => process.exit(),
    };

    await actions[state.menuAction](state);
  } catch (e) {
    throw new Error(e);
  }
};
