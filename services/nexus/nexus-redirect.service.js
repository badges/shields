import { redirector } from '../index.js'

export default [
  redirector({
    category: 'version',
    route: {
      base: 'nexus',
      pattern:
        ':repo/:scheme/*hostAndPath/:groupId/:artifactId([^/:]+?):queryOpt(:.+?)?',
    },
    transformPath: ({ repo, groupId, artifactId }) =>
      `/nexus/${repo}/${groupId}/${artifactId}`,
    transformQueryParams: ({ scheme, hostAndPath, queryOpt }) => ({
      server: `${scheme}://${hostAndPath}`,
      queryOpt,
    }),
    dateAdded: new Date('2019-07-26'),
  }),
]
