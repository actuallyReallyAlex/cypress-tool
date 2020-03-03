const ora = require("ora");

const getLatestCypressDetailsSpinner = ora("Getting latest Cypress details");
const checkCypressInstallationSpinner = ora(
  "Checking for Cypress installation"
);
const compareVersionsSpinner = ora("Comparing Cypress versions");
const installCypressSpinner = latestVersion =>
  ora(`Installing Cypress v${latestVersion}`);
const readCacheSpinner = ora("Reading Cypress cache");
const clearCacheSpinner = ora("Clearing Cypress cache");

module.exports = {
  getLatestCypressDetailsSpinner,
  checkCypressInstallationSpinner,
  compareVersionsSpinner,
  installCypressSpinner,
  readCacheSpinner,
  clearCacheSpinner
};
