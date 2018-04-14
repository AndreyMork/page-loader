import axios from 'axios';
import path from 'path';
import debug from 'debug';
import fs from 'mz/fs';
import savePage from './savePage';
import downloadLocalResources from './downloadLocalResources';

const debugLog = debug('page-loader:main');

export default (url, output) => {
  const dest = path.resolve(output);

  debugLog(`url: ${url}`);
  debugLog(`dest: ${dest}`);

  let html;
  return fs.access(dest, fs.constants.W_OK)
    // .catch((err) => {
    //   console.error('Destination directory is not OK');
    //   console.error('reason:');
    //   console.error(err.message);
    // })
    .then(() => axios.get(encodeURI(url)))
    .then(({ data, status, statusText }) => {
      debugLog(`${status} ${statusText}`);
      html = data;
    })
    // .catch((err) => {
    //   console.error('Request is not OK');
    //   console.error('reason:');
    //   console.error(err.message);
    // })
    .then(() => savePage(html, url, dest))
    // .catch((err) => {
    //   console.error('Page was not saved');
    //   console.error('reason:');
    //   console.error(err.message);
    // })
    .then(() => downloadLocalResources(html, url, dest))
    .catch((err) => {
      console.error(err.message);
      process.exitCode = 1;

      return Promise.reject(new Error(err.message));
    });
};
