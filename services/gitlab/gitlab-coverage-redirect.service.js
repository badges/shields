import { redirector } from '../index.js'

export default redirector({
  category: 'coverage',
  route: {
    base: 'gitlab/coverage',
    pattern: ':user/:repo/:branch',
  },
  transformPath: ({ user, repo }) =>
    `/gitlab/pipeline-coverage/${user}/${repo}`,
  transformQueryParams: ({ branch }) => ({ branch }),
  dateAdded: new Date('2022-09-25'),
})
