// Have you identified a contributing guideline that should be included here?
// Please open a pull request!

const { danger, fail, message, warn } = require('danger');
const chainsmoker = require('chainsmoker');

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
const serviceTests = fileMatch('service-tests/*.js');
const helpers = fileMatch('lib/**/*.js', '!**/*.spec.js');
const helperTests = fileMatch('lib/**/*.spec.js');
const packageJson = fileMatch('package.json');
const packageLock = fileMatch('package-lock.json');
const capitals = fileMatch('**/*[A-Z]*.js');
const underscores = fileMatch('**/*_*.js');

message([
  ':sparkles: Thanks for your contribution to Shields, ',
  `@${danger.github.pr.user.login}!`
].join(''));

if (documentation.createdOrModified) {
  message('We :heart: our [documentarians](http://www.writethedocs.org/)!');
}

if (packageJson.modified && !packageLock.modified) {
  const message = 'This PR modified package.json, but not package-lock.json';
  const idea = 'Perhaps you need to run `npm install`?';
  warn(`${message} - <i>${idea}</i>`);
}

if (server.modified && !serviceTests.createdOrModified) {
  warn([
    'This PR modified the server but none of the service tests. ',
    "That's okay so long as it's refactoring existing code.",
  ].join(''));
}

if (helpers.created && !helperTests.created) {
  warn([
    'This PR added helper modules in lib/ but not accompanying tests. ',
    'Generally helper modules should have their own tests.',
  ].join(''));
} else if (helpers.createdOrModified && !helperTests.createdOrModified) {
  warn([
    'This PR modified helper functions in lib/ but not accompanying tests. ',
    "That's okay so long as it's refactoring existing code.",
  ].join(''));
}

if (capitals.created || underscores.created) {
  fail([
    'JavaScript source files should be named with kebab-case ',
    '(dash-separated lowercase).',
  ].join(''));
}
