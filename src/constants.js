const cypressUrl = "https://download.cypress.io/desktop.json";
const isMac = process.platform === "darwin";
const isWin = process.platform === "win32";

module.exports = {
  cypressUrl,
  isMac,
  isWin
};
