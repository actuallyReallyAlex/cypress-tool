process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
const fetch = require("node-fetch");
const httpsProxyAgent = require("https-proxy-agent");

const { saveFile } = require("./fileSystem");

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
        agent: process.env.HTTP_PROXY
          ? new httpsProxyAgent(process.env.HTTP_PROXY)
          : undefined
      })
        .then(response => resolve(response.json()))
        .catch(e => reject(e));
    } catch (e) {
      return reject(e);
    }
  });

/**
 * Downloads and saves a file.
 * @param {String} url URL
 */
const download = url =>
  new Promise((resolve, reject) => {
    try {
      fetch(url, {
        agent: process.env.HTTP_PROXY
          ? new httpsProxyAgent(process.env.HTTP_PROXY)
          : undefined
      })
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

module.exports = { download, makeRequest };
