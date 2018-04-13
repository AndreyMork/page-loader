import nock from 'nock';
import axios from 'axios';
import httpAdapter from 'axios/lib/adapters/http';
import os from 'os';
import fs from 'mz/fs';
import path from 'path';
import _ from 'lodash';
import pageLoader from '../src';

axios.defaults.adapter = httpAdapter;


let tempDirPath;
beforeAll(async () => {
  tempDirPath = await fs.mkdtemp(path.join(os.tmpdir(), 'page-loader-test-'));
});

// afterEach(async () => {
//   const files = await fs.readdir(tempDirPath);
//   files.forEach(file => fs.unlink(path.join(tempDirPath, file)));
// });

afterAll(async () => {
  await fs.rmdir(tempDirPath);
});

test('page not found', async () => {
  const url = 'https://hexlet.io/courses';
  nock(url)
    .get('')
    .reply(404, 'check');

  expect(pageLoader(url, tempDirPath)).rejects.toBeInstanceOf(Error);
});


test('download resources', async () => {
  const url = 'https://hexlet.io';
  const htmlName = 'hexlet-io.html';
  const resDirName = 'hexlet-io_files';
  const resDirPath = path.join(tempDirPath, resDirName);

  const html = await fs.readFile(path.resolve(__dirname, './__fixtures__/test.html'));
  const replacedLinks = await fs.readFile(path.resolve(__dirname, './__fixtures__/replacedLinks.html'));
  const img = await fs.readFile(path.resolve(__dirname, './__fixtures__/img.jpg'));
  const css = await fs.readFile(path.resolve(__dirname, './__fixtures__/style.css'));

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
