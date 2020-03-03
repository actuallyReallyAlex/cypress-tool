import fetch from "node-fetch";
import httpsProxyAgent from "https-proxy-agent";
import ProgressBar from "progress";

import { saveFile } from "./fileSystem";

/**
 * Downloads and saves a file.
 * @param {String} url URL
 * @returns {Promise} Resolves after file has been saved.
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

/**
 * Makes a request to a url.
 * @param {String} url URL to make a request to.
 * @param {Object} options Optional. Default options object to attach to request.
 * @returns {Promise} Resolves to the json response.
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

module.exports = { download, makeRequest };
