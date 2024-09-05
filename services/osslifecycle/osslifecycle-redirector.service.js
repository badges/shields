import { redirector } from '../index.js'

const commonProps = {
  category: 'other',
  dateAdded: new Date('2024-09-02'),
}

export default [
  redirector({
    route: {
      base: 'osslifecycle',
      pattern: ':user/:repo/:branch*',
    },
    transformPath: () => '/osslifecycle',
    transformQueryParams: ({ user, repo, branch }) => ({
      file_url: `https://raw.githubusercontent.com/${user}/${repo}/${branch || 'HEAD'}/OSSMETADATA`,
    }),
    ...commonProps,
  }),
]
