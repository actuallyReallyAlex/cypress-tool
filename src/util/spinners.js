const ora = require("ora");

const getLatestCypressDetailsSpinner = ora("Getting latest Cypress details");
const checkCypressInstallationSpinner = ora(
  "Checking for Cypress installation"
);
const compareVersionsSpinner = ora("Comparing Cypress versions");

module.exports = {
  getLatestCypressDetailsSpinner,
  checkCypressInstallationSpinner,
  compareVersionsSpinner
};
