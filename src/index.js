import axios from 'axios';
import fs from 'mz/fs';
import nodeUrl from 'url';
import nodePath from 'path';

const buildFileNameFromUrl = (link) => {
  const { hostname, path } = nodeUrl.parse(link);
  const fileName = `${hostname}${path}`.replace(/([\W_])+/g, '-');

  return `${fileName}.html`;
};

export default (url, output) => {
  const fileName = buildFileNameFromUrl(url);
  axios.get(url)
    .then(({ data }) => fs.writeFile(nodePath.join(output, fileName), data))
    .catch((err) => {
      throw err;
    });
};
