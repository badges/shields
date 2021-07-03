'use strict'

// Have you identified a contributing guideline that should be included here?
// Please open a pull request!
//
// To test changes to this file, pick a PR to test against, then run
// `./node_modules/.bin/danger pr pr-url`
// Note that the line numbers in the runtime errors are incorrect.

// To test changes locally:
// DANGER_GITHUB_API_TOKEN=your-github-api-token npm run danger -- pr https://github.com/badges/shields/pull/2665

const { danger, fail, message, warn } = require('danger')
const { default: noTestShortcuts } = require('danger-plugin-no-test-shortcuts')
const { fileMatch } = danger.git

const documentation = fileMatch(
  '**/*.md',
  'frontend/components/usage.tsx',
  'frontend/pages/endpoint.tsx'
)
const server = fileMatch('core/server/**.js', '!*.spec.js')
const serverTests = fileMatch('core/server/**.spec.js')
const legacyHelpers = fileMatch('lib/**/*.js', '!*.spec.js')
const legacyHelperTests = fileMatch('lib/**/*.spec.js')
const logos = fileMatch('logo/*.svg')
const packageJson = fileMatch('package.json')
const packageLock = fileMatch('package-lock.json')
const secretsDocs = fileMatch('doc/server-secrets.md')
const capitals = fileMatch('**/*[A-Z]*.js')
const underscores = fileMatch('**/*_*.js')

message(
  [
    ':sparkles: Thanks for your contribution to Shields, ',
    `@${danger.github.pr.user.login}!`,
  ].join('')
)

const targetBranch = danger.github.pr.base.ref
if (targetBranch !== 'master') {
  const message = `This PR targets \`${targetBranch}\``
  const idea = 'It is likely that the target branch should be `master`'
  warn(`${message} - <i>${idea}</i>`)
}

if (documentation.edited) {
  message(
    [
      'Thanks for contributing to our documentation. ',
      'We :heart: our [documentarians](http://www.writethedocs.org/)!',
    ].join('')
  )
}

if (packageJson.modified && !packageLock.modified) {
  const message = 'This PR modified `package.json`, but not `package-lock.json`'
  const idea = 'Perhaps you need to run `npm install`?'
  warn(`${message} - <i>${idea}</i>`)
}

if (server.modified && !serverTests.modified) {
  warn(
    [
      'This PR modified the server but none of its tests. <br>',
      "That's okay so long as it's refactoring existing code.",
    ].join('')
  )
}

if (legacyHelpers.created) {
  warn(['This PR added helper modules in `lib/` which is deprecated.'].join(''))
} else if (legacyHelpers.edited && !legacyHelperTests.edited) {
  warn(
    [
      'This PR modified helper functions in `lib/` but not accompanying tests. <br>',
      "That's okay so long as it's refactoring existing code.",
    ].join('')
  )
}

if (logos.created) {
  message(
    [
      ':art: Thanks for submitting a logo. <br>',
      'Please ensure your contribution follows our ',
      '[guidance](https://github.com/badges/shields/blob/master/doc/logos.md#contributing-logos) ',
      'for logo submissions.',
    ].join('')
  )
}

if (capitals.created || underscores.created) {
  fail(
    [
      'JavaScript source files should be named with `kebab-case` ',
      '(dash-separated lowercase).',
    ].join('')
  )
}

const allFiles = danger.git.created_files.concat(danger.git.modified_files)

if (allFiles.length > 100) {
  warn("Lots 'o changes. Skipping diff-based checks.")
} else {
  allFiles.forEach(file => {
    if (file === 'dangerfile.js') {
      return
    }

    // eslint-disable-next-line promise/prefer-await-to-then
    danger.git.diffForFile(file).then(({ diff }) => {
      if (diff.includes('authHelper') && !secretsDocs.modified) {
        warn(
          [
            `:books: Remember to ensure any changes to \`config.private\` `,
            `in \`${file}\` are reflected in the [server secrets documentation]`,
            '(https://github.com/badges/shields/blob/master/doc/server-secrets.md)',
          ].join('')
        )
      }

      if (diff.includes('.assert(')) {
        warn(
          [
            `Found 'assert' statement added in \`${file}\`. <br>`,
            'Please ensure tests are written using Chai ',
            '[expect syntax](http://chaijs.com/guide/styles/#expect)',
          ].join('')
        )
      }

      if (diff.includes("from '@hapi/joi'")) {
        fail(
          [
            `Found import of '@hapi/joi' in \`${file}\`. <br>`,
            "Joi must be imported as 'joi'.",
          ].join('')
        )
      }
    })
  })
}

function onlyUnique(value, index, self) {
  return self.indexOf(value) === index
}

const affectedServices = allFiles
  .map(file => {
    const match = file.match(/^services\/(.+)\/.+\.service.js$/)
    return match ? match[1] : undefined
  })
  .filter(Boolean)
  .filter(onlyUnique)

const testedServices = allFiles
  .map(file => {
    const match = file.match(/^services\/(.+)\/.+\.tester.js$/)
    return match ? match[1] : undefined
  })
  .filter(Boolean)
  .filter(onlyUnique)

affectedServices.forEach(service => {
  if (testedServices.indexOf(service) === -1) {
    warn(
      [
        `This PR modified service code for <kbd>${service}</kbd> but not its test code. <br>`,
        "That's okay so long as it's refactoring existing code.",
      ].join('')
    )
  }
})

// Prevent merging exclusive services tests.
noTestShortcuts({
  testFilePredicate: filePath => filePath.endsWith('.tester.js'),
  patterns: {
    only: ['only()'],
  },
})
