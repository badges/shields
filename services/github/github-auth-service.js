import gql from 'graphql-tag'
import { mergeQueries } from '../../core/base-service/graphql.js'
import { BaseGraphqlService, BaseJsonService } from '../index.js'

function createRequestFetcher(context) {
  const { requestFetcher, githubApiProvider } = context
  return githubApiProvider.fetch.bind(githubApiProvider, requestFetcher)
}

class GithubAuthV3Service extends BaseJsonService {
  constructor(context, config) {
    super(context, config)
    this._requestFetcher = createRequestFetcher(context)
    this.staticAuthConfigured = true
  }
}

// Use Github auth, but only when static auth is configured. By using this
// class, in production it will behave like GithubAuthV3Service, and in self-
// hosting (i.e. with a configured token) like BaseJsonService. This is
// useful when consuming GitHub endpoints which are not rate-limited: it
// avoids wasting API quota on them in production.
class ConditionalGithubAuthV3Service extends BaseJsonService {
  constructor(context, config) {
    super(context, config)
    if (context.githubApiProvider.globalToken) {
      this._requestFetcher = createRequestFetcher(context)
      this.staticAuthConfigured = true
    } else {
      this.staticAuthConfigured = false
    }
  }
}

class GithubAuthV4Service extends BaseGraphqlService {
  constructor(context, config) {
    super(context, config)
    this._requestFetcher = createRequestFetcher(context)
    this.staticAuthConfigured = true
  }

  async _requestGraphql(attrs) {
    const url = `/graphql`

    /*
    The Github v4 API requires us to query the rateLimit object to return
    rate limit info in the query body instead of the headers:
    https://developer.github.com/v4/guides/resource-limitations/#returning-a-calls-rate-limit-status
    This appends the relevant rateLimit query clause to each
    call to the GH v4 API so we can keep track of token usage.
    */
    const query = mergeQueries(
      attrs.query,
      gql`
        query {
          rateLimit {
            limit
            cost
            remaining
            resetAt
          }
        }
      `
    )

    return super._requestGraphql({ ...attrs, ...{ url, query } })
  }
}

/*
Choosing between the Github V3 and V4 APIs when creating a new badge:

With the V3 API, one request = one point off the usage limit.
With the V4 API one request may be many points off the usage limit depending
on the query (but will be a minimum of one).
https://developer.github.com/v4/guides/resource-limitations/#calculating-nodes-in-a-call

If we can save ourselves some usage limit it may be worth going with a
REST (V3) call over a graphql query.
All other things being equal, a graphql query will almost always be a smaller
number of bytes over the wire and a smaller/simpler object to parse.
*/

export {
  GithubAuthV3Service,
  ConditionalGithubAuthV3Service,
  GithubAuthV4Service,
}
