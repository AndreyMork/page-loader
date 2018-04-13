import axios from 'axios';
import fs from 'mz/fs';
import cheerio from 'cheerio';
import path from 'path';
import url from 'url';
import _ from 'lodash';
import debug from 'debug';
import utils from './utils';

const replaceLocalLinks = (html, urlink) => {
  const resourcesDirName = utils.makeResourceDirName(urlink);
  const $ = cheerio.load(html);

  const replaceLink = (i, link) => {
    if (!link) {
      return null;
    }
    if (!utils.isLocal(link)) {
      return link;
    }
    return path.join(resourcesDirName, utils.makeResourceFileName(link));
  };

  $('script, img').attr('src', replaceLink);
  $('link').attr('href', replaceLink);

  return $.html();
};

export const savePage = (html, urlink, dest) => {
  const dpLog = debug(`page-loader:savePage:${urlink}`);

  const fileName = utils.makeHtmlFileName(urlink);
  const newHtml = replaceLocalLinks(html, urlink);
  dpLog('local links was replaced');

  return fs.writeFile(path.join(dest, fileName), newHtml)
    .then(() => dpLog(`successfully saved as '${fileName}' in '${dest}'`))
    .catch((err) => {
      dpLog(`saving failed with ${err.message}`);

      throw err;
    });
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

const saveResource = (data, link, resourcesDirPath) => {
  const srLog = debug('page-loader:saveResource');
  const fileName = utils.makeResourceFileName(link);
  const filePath = path.join(resourcesDirPath, fileName);

  if (Buffer.byteLength(filePath) >= 255) {
    srLog('name is too long');
    return Promise.reject(new Error('name is too long'));
  }

  data.pipe(fs.createWriteStream(filePath));
  srLog(`downloaded '${link}' as '${fileName}'`);

  return Promise.resolve();
};

export const downloadLocalResources = (html, urlink, dest) => {
  const dlrLog = debug('page-loader:downloadLocalResources');

  const links = extractLocalLinks(html);
  dlrLog(`exctracted ${links.length} local links from '${urlink}'`);
  if (links.length === 0) {
    return Promise.resolve();
  }

  const resourcesDirPath = path.join(dest, utils.makeResourceDirName(urlink));
  const { href } = url.parse(urlink);
  const makeAbsoluteLink = link => url.resolve(href, link);

  const downloadResource = link => axios
    .request({ method: 'GET', url: encodeURI(makeAbsoluteLink(link)), responseType: 'stream' })
    .then(({ data }) => saveResource(data, link, resourcesDirPath));

  return fs.mkdir(resourcesDirPath)
    .catch((err) => {
      if (err.code === 'EEXIST') {
        dlrLog(`'${resourcesDirPath}' already exists`);
        return;
      }

      throw err;
    })
    .then(() => dlrLog(`resource directory created at '${resourcesDirPath}'`))
    .then(() => Promise.all(links.map(downloadResource)));
};

export default {
  savePage,
  downloadLocalResources,
};
