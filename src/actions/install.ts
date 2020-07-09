import chalk from "chalk";
import fetch from "node-fetch";
import fse from "fs-extra";
import httpsProxyAgent from "https-proxy-agent";
import path from "path";
import ProgressBar from "progress";

import {
  executeCommand,
  keypress,
  titleScreen,
  getCacheLocation,
  clearCache,
} from "../util";

import { AppState } from "../types";

const installCypress = async (state: AppState): Promise<void> => {
  try {
    await titleScreen("cypress-tool");

    // * Clear Cypress Cache
    console.log("Clearing cache");
    await clearCache();
    console.log("Cache cleared");

    // * Download Cypress.zip for platform
    const agent = process.env.HTTP_PROXY
      ? new (httpsProxyAgent as any)(process.env.HTTP_PROXY)
      : undefined;

    const response = await fetch("https://download.cypress.io/desktop.json", {
      agent,
      headers: {
        "Content-Type": "application/json",
      },
      method: "GET",
    });
    const info = await response.json();
    const cypressUrl = info.packages[process.platform].url;
    const version = info.version;
    console.log(`Downloading Cypress v${version} from ${cypressUrl}`);
    fetch(cypressUrl, { agent, method: "GET" }).then(async (response) => {
      const contentLength = response.headers.get("content-length");
      const bar = new ProgressBar("Downloading [:bar] :percent :etas", {
        complete: "=",
        incomplete: " ",
        width: 50,
        total: Number(contentLength),
      });
      const zipPath = path.join(__dirname, "test.zip");
      const fileStream = fse.createWriteStream(zipPath);
      response.body.pipe(fileStream);
      response.body.on("error", (err) => console.log(chalk.red.inverse(err)));
      response.body.on("data", (chunk) => bar.tick(chunk.length));
      fileStream.on("finish", async () => {
        console.log("DONE");
        console.log(zipPath);

        // * Install Cypress from Cypress.zip
        try {
          console.log(
            "Installing Cypress as a devDependency in this directory"
          );
          await executeCommand(
            "npm",
            ["install", "-D", `cypress@${version}`],
            {
              env: { ...process.env, CYPRESS_INSTALL_BINARY: zipPath },
              path: undefined,
              shell: process.platform === "win32",
            },
            true
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
};

export default installCypress;
