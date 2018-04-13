import fs from 'mz/fs';
import cheerio from 'cheerio';
import path from 'path';
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

export default (html, urlink, dest) => {
  const dpLog = debug('page-loader:savePage');

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
