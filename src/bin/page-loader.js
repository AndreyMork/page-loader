#! /usr/bin/env node
import program from 'commander';
import path from 'path';
import pageLoader from '../';
import { version } from '../../package.json';

program
  .description('description')
  .version(version)
  .arguments('<url>')
  .option('-o, --output [path]', 'path to html')
  .action((url) => {
    const dirName = path.normalize(program.output || '');
    pageLoader(url, dirName);
  })
  .parse(process.argv);
