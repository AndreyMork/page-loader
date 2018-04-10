import nock from 'nock';
import axios from 'axios';
import httpAdapter from 'axios/lib/adapters/http';
import os from 'os';
import fs from 'mz/fs';
import path from 'path';
import pageLoader from '../src';

axios.defaults.adapter = httpAdapter;

let tempDirPath;

beforeAll(async () => {
  tempDirPath = await fs.mkdtemp(path.join(os.tmpdir(), 'page-loader-test-'));
});

afterEach(async () => {
  (await fs.readdir(tempDirPath))
    .forEach(file => fs.unlink(path.join(tempDirPath, file)));
});

afterAll(async () => {
  try {
    await fs.rmdir(tempDirPath);
  } catch (err) {
    throw err;
  }
});


test('page not found', async () => {
  const url = 'https://hexlet.io/courses';
  nock(url)
    .get('')
    .reply(404, 'check');

  try {
    await pageLoader(url, tempDirPath);
  } catch (err) {
    expect(err).toBeInstanceOf(Error);
  }
});

test('test 1', async () => {
  const url = 'https://hexlet.io/courses';
  const htmlName = 'hexlet-io-courses.html';
  nock(url)
    .get('')
    .reply(200, 'check');

  await pageLoader(url, tempDirPath);
  const files = await fs.readdir(tempDirPath);

  expect(files).toContain(htmlName);

  const body = await fs.readFile(path.join(tempDirPath, htmlName), 'utf-8');
  expect(body).toBe('check');
});
