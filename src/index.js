import axios from 'axios';
import path from 'path';
import debug from 'debug';
import savePage from './savePage';
import downloadLocalResources from './downloadLocalResources';

const debugLog = debug('page-loader:main');

export default (url, output) => {
  const dest = path.resolve(output);

  debugLog(`url: ${url}`);
  debugLog(`dest: ${dest}`);

  return axios.get(encodeURI(url))
    .then(({ data, status, statusText }) => {
      debugLog(`${status} ${statusText}`);
      savePage(data, url, dest);
      downloadLocalResources(data, url, dest);
    });
};
