import { redirector } from '../index.js'

export default [
  // The SymfonyInsight service was previously branded as SensioLabs, and
  // accordingly the badge path used to be /sensiolabs/i/projectUuid'.
  redirector({
    category: 'analysis',
    route: {
      base: 'sensiolabs/i',
      pattern: ':projectUuid',
    },
    transformPath: ({ projectUuid }) => `/symfony/i/grade/${projectUuid}`,
    dateAdded: new Date('2019-02-08'),
  }),
]
