import * as Sentry from "@sentry/node";
Sentry.init({
  dsn:
    "https://166cfccac6334fa29750ddf656c53445@o202486.ingest.sentry.io/3668079",
  release: "1.1.1",
});

import Configstore from "configstore";
import EventEmitter from "events";

import { displayMainMenu, interpretMenuAction } from "./menu";
import { titleScreen } from "./util";
import { AppState } from "./types";

/**
 * Main Program.
 */
const main = async (): Promise<void> => {
  // * Needed for cert error
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

  // * Supress warnings
  process.env.NODE_NO_WARNINGS = "1";

  // * Action Emitter keeps track of user input in the menu.
  const menuActionEmitter = new EventEmitter.EventEmitter();
  menuActionEmitter.on("actionCompleted", async (state: AppState) => {
    // * Display title screen
    await titleScreen("cypress-tool");
    // * Display main menu
    await displayMainMenu(state);
    // * When user makes a choice, interpret the choice as an action
    await interpretMenuAction(state);
  });

  // * Store a config file on the user's machine
  const config = new Configstore("cypress-tool");

  // * Application State
  const state: AppState = {
    config,
    menuAction: null,
    menuActionEmitter,
  };

  try {
    await titleScreen("cypress-tool");
    await displayMainMenu(state);
    await interpretMenuAction(state);
  } catch (e) {
    console.error("ERROR");
    console.log(state);
    console.error(e);
  }
};

// * Handle local development with `npm start`
if (process.argv[3] === "start") main();

export default main;
