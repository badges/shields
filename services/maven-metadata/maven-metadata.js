import { queryParams } from '../index.js'

const strategyEnum = ['highestVersion', 'releaseProperty', 'latestProperty']

const strategyDocs = `The strategy used to determine the version that will be shown
<ul>
  <li><code>highestVersion</code> - sort versions using Maven's ComparableVersion semantics (default)</li>
  <li><code>releaseProperty</code> - use the "release" metadata property</li>
  <li><code>latestProperty</code> - use the "latest" metadata property</li>
</ul>`

const filterDocs = `
The <code>filter</code> param can be used to apply a filter to the
project's versions before selecting the latest from the list.
Two constructs are available: <code>*</code> is a wildcard matching zero
or more characters, and if the pattern starts with a <code>!</code>,
the whole pattern is negated.
`
const commonParams = queryParams(
  {
    name: 'strategy',
    description: strategyDocs,
    schema: { type: 'string', enum: strategyEnum },
    example: 'highestVersion',
  },
  { name: 'filter', example: '*beta', description: filterDocs },
)

export { strategyEnum, commonParams }
