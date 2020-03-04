import ora from "ora";

const checkCypressInstallationSpinner = ora(
  "Checking for Cypress installation"
);
const clearCacheSpinner = ora("Clearing Cypress cache");
const compareVersionsSpinner = ora("Comparing Cypress versions");
const downloadSpinner = ora();
const getLatestCypressDetailsSpinner = ora("Getting latest Cypress details");
const installCypressSpinner = version => ora(`Installing Cypress v${version}`);
const readCacheSpinner = ora("Reading Cypress cache");
const updateCypressSpinner = (oldVersion, newVersion) =>
  ora(`Updating Cypress from v${oldVersion} to v${newVersion}`);

module.exports = {
  checkCypressInstallationSpinner,
  clearCacheSpinner,
  compareVersionsSpinner,
  downloadSpinner,
  getLatestCypressDetailsSpinner,
  installCypressSpinner,
  readCacheSpinner,
  updateCypressSpinner
};
