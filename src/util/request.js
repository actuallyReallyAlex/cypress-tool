process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
const fetch = require("node-fetch");
const httpsProxyAgent = require("https-proxy-agent");
const fs = require("fs");

const agent = new httpsProxyAgent("http://web-proxymain.us.bank-dns.com:3128");
const ProgressBar = require("progress");

/**
 * Makes a request to a url.
 * @param {String} url URL to make a request to.
 * @param {Object} options Optional. Default options object to attach to request.
 */
const makeRequest = (
  url,
  options = {
    headers: {
      "Content-Type": "application/json"
    },
    method: "GET"
  }
) =>
  new Promise((resolve, reject) => {
    try {
      fetch(url, {
        headers: options.headers,
        method: options.method,
        agent
      })
        .then(response => resolve(response.json()))
        .catch(e => reject(e));
    } catch (e) {
      return reject(e);
    }
  });

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

const download = url =>
  new Promise((resolve, reject) => {
    try {
      fetch(url, { agent })
        .then(async response => {
          const contentLength = await response.headers.get("content-length");
          const bar = new ProgressBar("Downloading [:bar] :percent :etas", {
            complete: "=",
            incomplete: " ",
            width: 50,
            total: Number(contentLength)
          });

          await saveFile(response, bar);
          resolve();
        })
        .catch(e => reject(e));
    } catch (e) {
      return reject(e);
    }
  });

module.exports = { download, makeRequest, saveFile };
