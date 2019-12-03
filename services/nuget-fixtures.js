'use strict'

const queryIndex = JSON.stringify({
  resources: [
    {
      '@id': 'https://api-v2v3search-0.nuget.org/query',
      '@type': 'SearchQueryService',
    },
  ],
})

const nuGetV3VersionJsonWithDash = JSON.stringify({
  data: [
    {
      totalDownloads: 0,
      versions: [{ version: '1.2-beta' }],
    },
  ],
})
const nuGetV3VersionJsonFirstCharZero = JSON.stringify({
  data: [
    {
      totalDownloads: 0,
      versions: [{ version: '0.35' }],
    },
  ],
})
const nuGetV3VersionJsonFirstCharNotZero = JSON.stringify({
  data: [
    {
      totalDownloads: 0,
      versions: [{ version: '1.2.7' }],
    },
  ],
})

const nuGetV3VersionJsonBuildMetadataWithDash = JSON.stringify({
  data: [
    {
      totalDownloads: 0,
      versions: [
        {
          version: '1.16.0+388',
        },
        {
          version: '1.17.0+1b81349-429',
        },
      ],
    },
  ],
})

module.exports = {
  queryIndex,
  nuGetV3VersionJsonWithDash,
  nuGetV3VersionJsonFirstCharZero,
  nuGetV3VersionJsonFirstCharNotZero,
  nuGetV3VersionJsonBuildMetadataWithDash,
}
