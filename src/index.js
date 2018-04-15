import axios from 'axios';
import path from 'path';
import debug from 'debug';
import fs from 'mz/fs';
import Listr from 'listr';
import savePage from './savePage';
import downloadLocalResources from './downloadLocalResources';

const debugLog = debug('page-loader:main');

export default (url, output) => {
  const dest = path.resolve(output);

  debugLog(`url: ${url}`);
  debugLog(`dest: ${dest}`);

  let html;
  return fs.access(dest, fs.constants.W_OK)
    .then(() => axios.get(encodeURI(url)))
    .then(({ data, status, statusText }) => {
      debugLog(`${status} ${statusText}`);
      html = data;
    })
    .then(() => {
      const task = new Listr([{
        title: 'saving page',
        task: () => savePage(html, url, dest),
      }]);

      return task.run();
    })
    .then(() => downloadLocalResources(html, url, dest))
    .catch((err) => {
      console.error(err.message);

      return Promise.reject(err);
    });
};
