import axios from 'axios';
import fs from 'mz/fs';
import nodeUrl from 'url';
import nodePath from 'path';

const buildFileNameFromUrl = (url) => {
  const { hostname, path } = nodeUrl.parse(url);
  const fileName =
    `${hostname}${path}`
      .replace(/[\W_]$/, '')
      .replace(/[\W_]+/g, '-');

  return `${fileName}.html`;
};

// TODO: mkdirp
// TODO: url encoding

export default (url, output) => {
  const fileName = buildFileNameFromUrl(url);

  axios.get(url)
    .then(({ data }) => fs.writeFile(nodePath.join(output, fileName), data))
    .catch((err) => {
      throw err;
    });
};
