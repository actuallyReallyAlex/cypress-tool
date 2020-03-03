const fs = require("fs");
const path = require("path");

const checkIfFileExists = path =>
  new Promise((resolve, reject) => {
    fs.stat(path, (err, stats) => {
      if (err) {
        return resolve(false);
      }
      return resolve(stats);
    });
  });

const getCachedVersions = () =>
  new Promise(async (resolve, reject) => {
    try {
      const { TEMP } = process.env;
      const dir = path.join(TEMP, "../Cypress/Cache");
      const exists = await checkIfFileExists(dir);

      if (exists) {
        fs.readdir(dir, (err, files) => {
          if (err) {
            return reject(err);
          }

          return resolve(files);
        });
      } else {
        return resolve([]);
      }
    } catch (e) {
      return reject(e);
    }
  });

module.exports = { getCachedVersions };
