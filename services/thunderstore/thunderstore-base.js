import Joi from 'joi'
import { BaseJsonService } from '../index.js'
import { nonNegativeInteger } from '../validators.js'

const packageMetricsSchema = Joi.object({
  downloads: nonNegativeInteger,
  rating_score: nonNegativeInteger,
  latest_version: Joi.string().required(),
})

const description = `
<p>
  The Thunderstore badges require a package's <code>namespace</code> and <code>name</code>.
</p>
<p>
  Everything can be discerned from your package's URL. Thunderstore package URLs have a mostly consistent
  format:
</p>
<p>
    <code>https://thunderstore.io/c/[community]/p/[namespace]/[packageName]</code>
</p>
<p>
  For example: <code>https://thunderstore.io/c/lethal-company/p/notnotnotswipez/MoreCompany/</code>.
  <ul>
    <li><code>namespace = "notnotnotswipez"</code></li>
    <li><code>packageName = "MoreCompany"</code></li>
  </ul>
</p>
<details>
  <summary>Risk Of Rain 2</summary>
  <p>
    The 'default community', Risk of Rain 2, has an alternative URL:
  </p>
  <p>
    <code>https://thunderstore.io/package/[namespace]/[packageName]</code>
  </p>
</details>
<details>
  <summary>Subdomain Communities</summary>
  <p>
    Some communities use a 'subdomain' alternative URL, for example, Valheim:
  </p>
  <p>
    <code>https://valheim.thunderstore.io/package/[namespace]/[packageName]</code>
  </p>
</details>
`

/**
 * Services which query Thunderstore endpoints should extend BaseThunderstoreService
 *
 * @abstract
 */
class BaseThunderstoreService extends BaseJsonService {
  static thunderstoreGreen = '23FFB0'
  /**
   * Fetches package metrics from the Thunderstore API.
   *
   * @param {object} pkg - Package specifier
   * @param {string} pkg.namespace - the package namespace
   * @param {string} pkg.packageName - the package name
   * @returns {Promise<object>} - Promise containing validated package metrics
   */
  async fetchPackageMetrics({ namespace, packageName }) {
    return this._requestJson({
      schema: packageMetricsSchema,
      url: `https://thunderstore.io/api/v1/package-metrics/${namespace}/${packageName}`,
    })
  }
}

export { BaseThunderstoreService, description }
