import axios from 'axios';
import fs from 'mz/fs';
import cheerio from 'cheerio';
import path from 'path';
import url from 'url';
import _ from 'lodash';
import utils from './utils';

const replaceLocalLinks = (html, resourcesDirName) => {
  const $ = cheerio.load(html);

  const replaceLink = (i, link) => {
    if (!link || !utils.isLocal(link)) {
      return link;
    }
    return path.join(resourcesDirName, utils.makeResourceFileName(link));
  };

  $('script, img').attr('src', replaceLink);
  $('link').attr('href', replaceLink);

  return $.html();
};

export const downloadPage = (html, urlink, dest) => {
  const fileName = utils.makeHtmlFileName(urlink);
  const resourcesDirName = utils.makeResourceDirName(urlink);
  const newHtml = replaceLocalLinks(html, resourcesDirName);

  return fs.writeFile(path.join(dest, fileName), newHtml);
};

const extractLocalLinks = (html) => {
  const $ = cheerio.load(html);
  const links = $('link, script, img')
    .map((ind, elem) => $(elem).attr('href') || $(elem).attr('src'))
    .toArray()
    .filter(utils.isLocal);

  const uniqLinks = _.uniq(links);
  return uniqLinks;
};


export const downloadLocalResources = (html, urlink, dest) => {
  const resourcesDirPath = path.join(dest, utils.makeResourceDirName(urlink));
  const links = extractLocalLinks(html);
  if (links.length === 0) {
    return Promise.resolve();
  }

  const { href } = url.parse(urlink);
  const makeAbsoluteLink = link => url.resolve(href, link);

  return fs.mkdir(resourcesDirPath)
    .then(() => links.forEach(link =>
      axios.request({ method: 'GET', url: encodeURI(makeAbsoluteLink(link)), responseType: 'stream' })
        .then(({ data }) => {
          const fileName = utils.makeResourceFileName(link);
          const filePath = path.join(resourcesDirPath, fileName);

          return data.pipe(fs.createWriteStream(filePath));
        })
        .catch((err) => {
          console.log(link);
          console.log(err.message);
          console.log();
        })));
};

export default {
  downloadPage,
  downloadLocalResources,
};
