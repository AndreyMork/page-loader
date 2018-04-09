#! /usr/bin/env node
import program from 'commander';
import pageLoader from '../';
import { version } from '../../package.json';

program
  .description('description')
  .version(version)
  .arguments('<url>')
  .option('-o, --output', 'path to html')
  .action((url) => {
    const dir = program.output ? program.output : process.cwd();
    pageLoader(url, dir);
  })
  .parse(process.argv);
