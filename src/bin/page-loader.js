#! /usr/bin/env node
import program from 'commander';
import pageLoader from '..';
import { version } from '../../package.json';

program
  .description('Downloads a page from the Web and all the resourses associated with it for the offline use.')
  .version(version)
  .arguments('<url>')
  .option('-o, --output [path]', 'path to the destination folder', '.')
  .action(url => pageLoader(url, program.output).catch(() => process.exit(1)))
  .parse(process.argv);
