const path = require("path");
const fs = require("fs");

/**
 * Saves Cypress file.
 * @param {Object} res Response
 * @param {Object} bar ProgressBar object
 */
const saveFile = (res, bar) =>
  new Promise((resolve, reject) => {
    try {
      const fileStream = fs.createWriteStream("./Cypress.zip");
      res.body.pipe(fileStream);
      res.body.on("error", err => reject(err));
      res.body.on("data", chunk => bar.tick(chunk.length));
      fileStream.on("finish", () => resolve());
    } catch (e) {
      return reject(e);
    }
  });

const checkIfFileExists = path =>
  new Promise((resolve, reject) => {
    fs.stat(path, (err, stats) => {
      if (err) {
        return resolve(false);
      }
      return resolve(stats);
    });
  });

const getCachedVersions = cachePath =>
  new Promise(async (resolve, reject) => {
    try {
      const exists = await checkIfFileExists(cachePath);

      if (exists) {
        fs.readdir(cachePath, (err, files) => {
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

module.exports = {
  getCachedVersions,
  checkIfFileExists
};
