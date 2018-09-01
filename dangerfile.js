'use strict'

// Have you identified a contributing guideline that should be included here?
// Please open a pull request!
//
// To test changes to this file, pick a PR to test against, then run
// `./node_modules/.bin/danger pr pr-url`
// Note that the line numbers in the runtime errors are incorrecr.

const { danger, fail, message, warn } = require('danger');
const chainsmoker = require('chainsmoker');
const { default: noTestShortcuts } = require('danger-plugin-no-test-shortcuts');

const fileMatch = chainsmoker({
  created: danger.git.created_files,
  modified: danger.git.modified_files,
  createdOrModified: danger.git.modified_files.concat(danger.git.created_files),
  deleted: danger.git.deleted_files,
});

const documentation = fileMatch(
  '**/*.md',
  'lib/all-badge-examples.js',
  'frontend/components/usage.js'
);
const server = fileMatch('server.js');
const serviceTests = fileMatch('services/**/*.tester.js');
const helpers = fileMatch(
  'lib/**/*.js',
  '!**/*.spec.js',
  '!lib/all-badge-examples.js'
);
const logos = fileMatch(
  'logo/*.svg'
);
const helperTests = fileMatch('lib/**/*.spec.js');
const packageJson = fileMatch('package.json');
const packageLock = fileMatch('package-lock.json');
const capitals = fileMatch('**/*[A-Z]*.js');
const underscores = fileMatch('**/*_*.js');
const targetBranch = danger.github.pr.base.ref;

message([
  ':sparkles: Thanks for your contribution to Shields, ',
  `@${danger.github.pr.user.login}!`,
].join(''));

if (targetBranch !== 'master') {
  const message = `This PR targets \`${targetBranch}\``;
  const idea = 'It is likely that the target branch should be `master`';
  warn(`${message} - <i>${idea}</i>`);
}

if (documentation.createdOrModified) {
  message([
    'Thanks for contributing to our documentation. ',
    'We :heart: our [documentarians](http://www.writethedocs.org/)!',
  ].join(''));
}

if (packageJson.modified && !packageLock.modified) {
  const message = 'This PR modified `package.json`, but not `package-lock.json`';
  const idea = 'Perhaps you need to run `npm install`?';
  warn(`${message} - <i>${idea}</i>`);
}

if (server.modified && !serviceTests.createdOrModified) {
  warn([
    'This PR modified the server but none of the service tests. <br>',
    "That's okay so long as it's refactoring existing code. ",
    "Otherwise, please consider adding tests to the service: ",
    "[How-to](https://github.com/badges/shields/blob/master/doc/service-tests.md#readme)",
  ].join(''));
}

if (helpers.created && !helperTests.created) {
  warn([
    'This PR added helper modules in `lib/` but not accompanying tests. <br>',
    'Generally helper modules should have their own tests.',
  ].join(''));
} else if (helpers.createdOrModified && !helperTests.createdOrModified) {
  warn([
    'This PR modified helper functions in `lib/` but not accompanying tests. <br>',
    "That's okay so long as it's refactoring existing code.",
  ].join(''));
}

if (logos.created) {
  message([
    ':art: Thanks for submitting a logo. <br>',
    'Please ensure your contribution follows our ',
    '[guidance](https://github.com/badges/shields/blob/master/CONTRIBUTING.md#logos) ',
    'for logo submissions.',
  ].join(''));
}

if (capitals.created || underscores.created) {
  fail([
    'JavaScript source files should be named with `kebab-case` ',
    '(dash-separated lowercase).',
  ].join(''));
}

const allFiles = danger.git.created_files.concat(danger.git.modified_files);

allFiles.forEach(file => {
  danger.git.diffForFile(file).then(diff => {
    if (/\+.*assert[(.]/.test(diff.diff)) {
      warn([
        `Found 'assert' statement added in \`${file}\`. <br>`,
        'Please ensure tests are written using Chai ',
        '[expect syntax](http://chaijs.com/guide/styles/#expect)',
      ].join(''));
    }
  });
});

function onlyUnique(value, index, self) {
  return self.indexOf(value) === index;
}

const affectedServices = allFiles
  .map(file => {
    const match = file.match(/^services\/(.+)\/.+\.service.js$/);
    return match ? match[1] : undefined;
  })
  .filter(Boolean)
  .filter(onlyUnique);

const testedServices = allFiles
  .map(file => {
    const match = file.match(/^services\/(.+)\/.+\.tester.js$/);
    return match ? match[1] : undefined;
  })
  .filter(Boolean)
  .filter(onlyUnique);

affectedServices.forEach(service => {
  if (testedServices.indexOf(service) === -1) {
    warn(
      [
        `This PR modified service code for <kbd>${service}</kbd> but not its test code. <br>`,
        "That's okay so long as it's refactoring existing code.",
      ].join('')
    );
  }
});

// Prevent merging exclusive services tests.
noTestShortcuts({
  testFilePredicate: filePath => filePath.endsWith('.tester.js'),
  patterns: {
    only: ['only()'],
  },
});
