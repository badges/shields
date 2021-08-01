import { redirector } from '../index.js'

export default [
  // http://github.com/badges/shields/issues/1387
  // https://github.com/badges/shields/pull/3320#issuecomment-483795000
  redirector({
    name: 'CodeclimateCoverageMaintainabilityRedirect',
    category: 'analysis',
    route: {
      base: 'codeclimate/maintainability-letter',
      pattern: ':user/:repo',
    },
    transformPath: ({ user, repo }) =>
      `/codeclimate/maintainability/${user}/${repo}`,
    dateAdded: new Date('2019-04-16'),
  }),
]
