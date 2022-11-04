import { redirector } from '../../index.js'

export default redirector({
  category: 'activity',
  route: { base: 'github-gist/last-commit', pattern: ':gistId' },
  transformPath: ({ gistId }) => `/github/gist/last-commit/${gistId}`,
  dateAdded: new Date('2022-10-09'),
})
