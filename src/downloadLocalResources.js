import axios from 'axios';
import fs from 'mz/fs';
import cheerio from 'cheerio';
import path from 'path';
import url from 'url';
import _ from 'lodash';
import debug from 'debug';
import utils from './utils';


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

  data.pipe(fs.createWriteStream(filePath)
    .on('error', (err) => {
      console.error(`Couldn't save '${link}'`);
      console.error('reason:');
      console.error(err.message);
      process.exitCode = 1;
    }));
  srLog(`downloaded '${link}'`);
  srLog(`as '${fileName}'`);
};

export default (html, urlink, dest) => {
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
    .then(() => dlrLog(`resource directory created at '${resourcesDirPath}'`))
    .then(() => Promise.all(links.map(downloadResource)));
};
