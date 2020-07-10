import EventEmitter from "events";
import Configstore from "configstore";

/**
 * Application State
 */
export interface AppState {
  config: Configstore;
  menuAction: MenuAction;
  menuActionEmitter: EventEmitter.EventEmitter;
}

/**
 * Menu Action (option)
 */
export type MenuAction = "about" | "install" | "exit" | null;
