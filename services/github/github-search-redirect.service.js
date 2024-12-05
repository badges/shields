import { redirector } from '../index.js'

export default redirector({
  category: 'analysis',
  route: {
    base: 'github/search',
    pattern: ':user/:repo/:query+',
  },
  transformPath: () => '/github/code-search',
  transformQueryParams: ({ query, user, repo }) => ({
    query: `${query} repo:${user}/${repo}`,
  }),
  dateAdded: new Date('2024-11-29'),
})
