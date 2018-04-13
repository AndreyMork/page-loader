import axios from 'axios';
import debug from 'debug';
import path from 'path';
import { downloadPage, downloadLocalResources } from './loader';

const plLog = debug('page-loader:main');
export default (url, dest) =>
  axios.get(encodeURI(url))
    .then(({ data }) => {
      plLog('start');

      const absolutePathDest = path.resolve(dest);
      downloadPage(data, url, absolutePathDest);
      downloadLocalResources(data, url, absolutePathDest);
      plLog('end');
    });
