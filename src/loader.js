import axios from 'axios';
import fs from 'mz/fs';
import cheerio from 'cheerio';
import path from 'path';
import url from 'url';
import _ from 'lodash';
import debug from 'debug';
import utils from './utils';

const replaceLocalLinks = (html, resourcesDirName) => {
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

  debug('page-loader:replaceLocalLinks')('replaced local links');
  return $.html();
};

export const downloadPage = (html, urlink, dest) => {
  const dpLog = debug('page-loader:downloadPage');


  const fileName = utils.makeHtmlFileName(urlink);
  dpLog(`'${urlink}' as '${fileName}' in '${dest}'`);

  const resourcesDirName = utils.makeResourceDirName(urlink);
  const newHtml = replaceLocalLinks(html, resourcesDirName);

  return fs.writeFile(path.join(dest, fileName), newHtml)
    .then(dpLog('successful download'))
    .catch((err) => {
      dpLog(`download failed with ${err.message}`);
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
    .then(({ data }) => {
      const fileName = utils.makeResourceFileName(link);
      const filePath = path.join(resourcesDirPath, fileName);

      if (Buffer.byteLength(filePath) >= 255) {
        return Promise.reject(new Error('name is too long'));
      }

      data.pipe(fs.createWriteStream(filePath));
      dlrLog(`downloaded '${link}' as '${fileName}'`);

      return Promise.resolve();
    })
    .catch((err) => {
      dlrLog(err.message);
      return Promise.reject();
    });

  return fs.mkdir(resourcesDirPath)
    .then(dlrLog(`resource directory created at '${resourcesDirPath}'`))
    .then(() => Promise.all(links.map(downloadResource)));
};

export default {
  downloadPage,
  downloadLocalResources,
};
