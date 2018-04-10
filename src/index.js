import axios from 'axios';
import fs from 'mz/fs';
import nodeUrl from 'url';
import nodePath from 'path';

const buildFileNameFromUrl = (url) => {
  const { hostname, path } = nodeUrl.parse(url);
  const fileName =
    `${hostname}${path}` // TODO: match not latin [a-zA-Z] letters
      .replace(/[\W_]$/, '') // \W matches not [a-zA-Z] letters
      .replace(/[\W_]+/g, '-'); // e.g.: æ, ы, ó, ä

  return `${fileName}.html`;
};

// TODO: mkdirp

export default (url, output) => {
  const fileName = buildFileNameFromUrl(url);
  const { href: encodedUrl } = new nodeUrl.URL(url);

  return axios.get(encodedUrl)
    .then(({ data }) => fs.writeFile(nodePath.join(output, fileName), data))
    .catch((err) => {
      throw err;
    });
};
