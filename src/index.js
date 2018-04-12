import axios from 'axios';
import { downloadPage, downloadLocalResources } from './loader';

export default (url, dest) =>
  axios.get(encodeURI(url))
    .then(({ data }) => {
      downloadPage(data, url, dest);
      downloadLocalResources(data, url, dest);
    });
