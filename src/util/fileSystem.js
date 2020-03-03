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