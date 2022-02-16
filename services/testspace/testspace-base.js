import Joi from 'joi'
import { nonNegativeInteger } from '../validators.js'
import { BaseJsonService, NotFound } from '../index.js'

// https://help.testspace.com/docs/reference/web-api#list-results
// case_counts|array|The contained cases [passed, failed, na, errored]|counters of result
// session_* fields are for manual runs
// There are instances where the api returns a 200 status code with an empty array
// notably in cases where a space id is used
const schema = Joi.array()
  .items(
    Joi.object({
      case_counts: Joi.array()
        .items(nonNegativeInteger)
        .min(4)
        .max(4)
        .required(),
    })
  )
  .required()

// https://help.testspace.com/docs/dashboard/overview-navigate
// Org is owner/account
// Project is generally a repository
// Space is a container, often a branch
export default class TestspaceBase extends BaseJsonService {
  static category = 'test-results'
  static defaultBadgeData = { label: 'tests' }

  async fetch({ org, project, space }) {
    // https://help.testspace.com/docs/reference/web-api#list-results
    const url = `https://${org}.testspace.com/api/projects/${encodeURIComponent(
      project
    )}/spaces/${space}/results`
    return this._requestJson({
      schema,
      url,
      errorMessages: {
        403: 'org not found or not authorized',
        404: 'org, project, or space not found',
      },
    })
  }

  transformCaseCounts(json) {
    if (json.length === 0) {
      throw new NotFound({ prettyMessage: 'space not found or results purged' })
    }

    const [
      {
        case_counts: [passed, failed, skipped, errored],
      },
    ] = json
    const total = passed + failed + skipped + errored

    return { passed, failed, skipped, errored, total }
  }
}
