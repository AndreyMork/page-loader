#! /usr/bin/env node
import program from 'commander';
import path from 'path';
import pageLoader from '../';
import { version } from '../../package.json';

program
  .description('Downloads a page from the Web and all the resourses associated with it for the offline use.')
  .version(version)
  .arguments('<url>')
  .option('-o, --output [path]', 'path to the destination folder')
  .action((url) => {
    const dirName = path.normalize(program.output || '');
    pageLoader(url, dirName);
  })
  .parse(process.argv);
