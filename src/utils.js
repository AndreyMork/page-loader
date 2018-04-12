import url from 'url';
import path from 'path';

// TODO: match not latin [a-zA-Z] letters
const replaceNonWordCharacters = string =>
  string
    .replace(/^[\W_]+/, '')
    .replace(/[\W_]+$/, '')
    .replace(/[\W_]+/g, '-');

const makeHtmlFileName = (link) => {
  const { hostname, pathname } = url.parse(link);
  return `${replaceNonWordCharacters(`${hostname}${pathname}`)}.html`;
};

const makeResourceDirName = (link) => {
  const { hostname, pathname } = url.parse(link);
  return `${replaceNonWordCharacters(`${hostname}${pathname}`)}_files`;
};

// TODO: file name too long ???
const makeResourceFileName = (link) => {
  const { dir, name, ext } = path.parse(link);
  const fileName = replaceNonWordCharacters(`${dir}/${name}`);

  return `${fileName}${ext}`;
};

const isLocal = link => !url.parse(link).hostname;


export default {
  makeHtmlFileName,
  makeResourceFileName,
  makeResourceDirName,
  isLocal,
};
