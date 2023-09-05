import Joi from 'joi'
import { nonNegativeInteger } from '../validators.js'
import { BaseJsonService, NotFound } from '../index.js'

// https://help.testspace.com/reference/web-api#list-results
// case_counts|array|The contained cases [passed, failed, na, errored, untested]|counters of result
// session_* fields are for manual runs
// There are instances where the api returns a 200 status code with an empty array
// notably in cases where a space id is used
const schema = Joi.array()
  .items(
    Joi.object({
      case_counts: Joi.array()
        .items(nonNegativeInteger)
        .min(5)
        .max(5)
        .required(),
    }),
  )
  .required()

// https://help.testspace.com/dashboard/overview#navigate
// Org is owner/account
// Project is generally a repository
// Space is a container, often a branch
export default class TestspaceBase extends BaseJsonService {
  static category = 'test-results'
  static defaultBadgeData = { label: 'tests' }

  async fetch({ org, project, space }) {
    // https://help.testspace.com/docs/reference/web-api#list-results
    const url = `https://${org}.testspace.com/api/projects/${encodeURIComponent(
      project,
    )}/spaces/${space}/results`
    return this._requestJson({
      schema,
      url,
      httpErrors: {
        403: 'org not found or not authorized',
        404: 'org, project, or space not found',
      },
      options: {
        dnsLookupIpVersion: 4,
      },
    })
  }

  transformCaseCounts(json) {
    if (json.length === 0) {
      throw new NotFound({ prettyMessage: 'space not found or results purged' })
    }

    const [
      {
        case_counts: [passed, failed, skipped, errored, untested],
      },
    ] = json
    const total = passed + failed + skipped + errored + untested

    return { passed, failed, skipped, errored, untested, total }
  }
}
