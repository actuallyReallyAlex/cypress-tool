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

export interface CypressInfo {
  name: string;
  version: string;
  packages: {
    mac: CypressPackage;
    win: CypressPackage;
    linux64: CypressPackage;
    darwin: CypressPackage;
    win32: CypressPackage;
    linux: CypressPackage;
    "darkwin-x64": CypressPackage;
    "linux-x64": CypressPackage;
    "win32-ia32": CypressPackage;
    "win32-x64": CypressPackage;
  };
}

export interface CypressPackage {
  url: string;
}

export type MenuAction = "about" | "install" | "exit" | null;
