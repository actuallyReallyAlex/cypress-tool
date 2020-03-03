const fs = require("fs");
const rimraf = require("rimraf");
const path = require("path");

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

const asyncForEach = (array, callback) =>
  new Promise(async (resolve, reject) => {
    try {
      for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
      }
      return resolve();
    } catch (e) {
      return reject(e);
    }
  });

const removeFile = file =>
  new Promise((resolve, reject) => {
    try {
      rimraf(file, error => {
        if (error) {
          return reject(error);
        }
        resolve();
      });
    } catch (e) {
      return reject(e);
    }
  });

const clearCache = (cache, cachedVersions) =>
  new Promise(async (resolve, reject) => {
    try {
      await asyncForEach(
        cachedVersions,
        async version => await removeFile(path.join(cache, `/${version}`))
      );

      resolve();
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
  checkIfFileExists,
  removeFile,
  clearCache,
  saveFile
};
