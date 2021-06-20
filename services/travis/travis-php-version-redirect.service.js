import { redirector } from '../index.js'

const ciRedirect = redirector({
  category: 'platform-support',
  route: {
    base: 'travis-ci/php-v',
    pattern: ':user/:repo/:branch*',
  },
  transformPath: ({ user, repo, branch }) =>
    branch
      ? `/travis/php-v/${user}/${repo}/${branch}`
      : `/travis/php-v/${user}/${repo}/master`,
  dateAdded: new Date('2019-04-22'),
})

const branchRedirect = redirector({
  category: 'platform-support',
  route: {
    base: 'travis/php-v',
    pattern: ':user/:repo',
  },
  transformPath: ({ user, repo }) => `/travis/php-v/${user}/${repo}/master`,
  dateAdded: new Date('2020-07-12'),
})

export { ciRedirect, branchRedirect }
