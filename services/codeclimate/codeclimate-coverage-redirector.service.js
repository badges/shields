import { redirector } from '../index.js'

export default [
  // http://github.com/badges/shields/issues/1387
  // https://github.com/badges/shields/pull/3320#issuecomment-483795000
  redirector({
    name: 'CodeclimateCoveragePercentageRedirect',
    category: 'coverage',
    route: {
      base: 'codeclimate',
      pattern: ':alias(c|coverage-percentage)/:user/:repo',
    },
    transformPath: ({ user, repo }) => `/codeclimate/coverage/${user}/${repo}`,
    dateAdded: new Date('2019-04-15'),
  }),
  redirector({
    name: 'CodeclimateCoverageLetterRedirect',
    category: 'coverage',
    route: {
      base: 'codeclimate/c-letter',
      pattern: ':user/:repo',
    },
    transformPath: ({ user, repo }) =>
      `/codeclimate/coverage-letter/${user}/${repo}`,
    dateAdded: new Date('2019-04-15'),
  }),
  redirector({
    name: 'CodeclimateTopLevelCoverageRedirect',
    category: 'coverage',
    route: {
      base: 'codeclimate',
      pattern: ':user/:repo',
    },
    transformPath: ({ user, repo }) => `/codeclimate/coverage/${user}/${repo}`,
    dateAdded: new Date('2019-04-15'),
  }),
]
