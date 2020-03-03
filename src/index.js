const { makeRequest } = require("./util/request");
const { generateTitle } = require("./util/title");
const { getCachedVersions } = require("./util/getCachedVersions");
const { isUpToDate } = require("./util/isUpToDate");
const { promptUpdateCypress } = require("./util/cypress");
const url = "https://download.cypress.io/desktop.json";
const ora = require("ora");

const main = async () => {
  try {
    await generateTitle("Cypress Tool");

    const checkingLatestVersionSpinner = ora("Checking latest Cypress version").start();

    const response = await makeRequest(url).catch(e => {
      checkingLatestVersionSpinner.fail("Error in getting latest version");
      throw new Error(e);
    });
    const latestVersion = response.version;
    const win32DownloadUrl = response.packages.win32.url;
    checkingLatestVersionSpinner.succeed(`Cypress v${latestVersion}`);

    // TODO - Check if install exists at all

    const checkingIfUpToDate = ora("Checking if your Cypress version is up to date").start();
    const cachedVersions = await getCachedVersions().catch(e => {
      checkingIfUpToDate.fail("Error in checking if up to date");
      throw new Error(e);
    });

    let upToDate = false;
    if (cachedVersions.length > 0) {
      const latestCachedVersion = cachedVersions[cachedVersions.length - 1];

      upToDate = await isUpToDate(latestCachedVersion, latestVersion).catch(e => {
        throw new Error(e);
      });
    } else {
      
    }

    if (upToDate) {
      checkingIfUpToDate.succeed("Your Cypress version is up to date!");
    } else {
      checkingIfUpToDate.warn(`Your cypress version is old! v${latestVersion} < v${latestVersion}`);

      await promptUpdateCypress(latestVersion, win32DownloadUrl).catch(e => {
        throw new Error(e);
      });
    }
  } catch (e) {
    console.error(e);
  }
};

main();
