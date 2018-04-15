import nock from 'nock';
import axios from 'axios';
import httpAdapter from 'axios/lib/adapters/http';
import os from 'os';
import fs from 'mz/fs';
import path from 'path';
import _ from 'lodash';
import pageLoader from '../src';

axios.defaults.adapter = httpAdapter;

const getPathToFixtures = fileName => path.resolve(__dirname, `./__fixtures__/${fileName}`);

let tempDirPath;
beforeAll(async () => {
  tempDirPath = await fs.mkdtemp(path.join(os.tmpdir(), 'page-loader-test-'));
});

afterAll(async () => {
  await fs.rmdir(tempDirPath);
});

test('download resources', async () => {
  const url = 'https://hexlet.io';
  const htmlName = 'hexlet-io.html';
  const resDirName = 'hexlet-io_files';
  const resDirPath = path.join(tempDirPath, resDirName);

  const html = await fs.readFile(getPathToFixtures('test.html'));
  const replacedLinks = await fs.readFile(getPathToFixtures('replacedLinks.html'));
  const img = await fs.readFile(getPathToFixtures('img.jpg'));
  const css = await fs.readFile(getPathToFixtures('style.css'));

  nock(url)
    .get('/')
    .reply(200, html)
    .get('/path/to/img.jpg')
    .reply(200, img)
    .get('/path/to/style.css')
    .reply(200, css);

  await pageLoader(url, tempDirPath);
  const files = await fs.readdir(tempDirPath);

  expect(files).toContain(htmlName);
  expect(files).toContain(resDirName);

  const savedHtml = await fs.readFile(path.join(tempDirPath, htmlName), 'utf-8');
  const savedImg = await fs.readFile(path.join(resDirPath, 'path-to-img.jpg'));
  const savedCss = await fs.readFile(path.join(resDirPath, 'path-to-style.css'));

  expect(savedHtml).toEqual(_.trimEnd(replacedLinks));
  expect(savedImg).toEqual(img);
  expect(savedCss).toEqual(css);
});

test('page not found', async () => {
  const url = 'https://hexlet.io/courses';
  nock(url)
    .get('')
    .reply(404, '');

  return expect(pageLoader(url, tempDirPath)).rejects.toBeInstanceOf(Error);
});

test("dir doesn't exist", async () => {
  const url = 'https://hexlet.io/courses';

  nock(url)
    .get('')
    .reply(200, '');

  return expect(pageLoader(url, path.join(tempDirPath, 'NonExistingDir')))
    .rejects.toMatchObject({ errno: -2 });
});

test('name is too long', async () => {
  const url = `https://hexlet.io/courses${'1'.repeat(255)}`;

  nock(url)
    .get('')
    .reply(200, '');

  return expect(pageLoader(url, tempDirPath))
    .rejects.toMatchObject({ errno: -36 });
});
