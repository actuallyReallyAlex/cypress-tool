const semver = require("semver");

/**
 * Checks if cached version is up to date with current version.
 * @param {String} cached Cached version on machine. Ex. '4.0.0'
 * @param {String} current Current version offered. Ex. '4.1.0'
 */
const isUpToDate = (cached, current) =>
  new Promise((resolve, reject) => {
    try {
      return resolve(semver.satisfies(cached, `=${current}`));
    } catch (e) {
      return reject(e);
    }
  });

module.exports = { isUpToDate };
