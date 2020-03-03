const inquirer = require("inquirer");

const promptToInstallCypress = latestVersion =>
  new Promise(async (resolve, reject) => {
    try {
      const { shouldInstall } = await inquirer.prompt([
        {
          type: "confirm",
          message: `Would you like to install Cypress v${latestVersion}?`,
          name: "shouldInstall"
        }
      ]);

      return resolve(shouldInstall);
    } catch (e) {
      return reject(e);
    }
  });

module.exports = { promptToInstallCypress };
