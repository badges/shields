import Joi from 'joi'
import { BaseJsonService } from '../index.js'
import { nonNegativeInteger } from '../validators.js'

const packageSchema = Joi.object({
  total_downloads: nonNegativeInteger,
  package_url: Joi.string().required(),
  rating_score: Joi.number().min(0).required(),
  latest: Joi.object({
    version_number: Joi.string().required(),
  }).required(),
}).required()

const documentation = `
<p>
  The Thunderstore badge requires the package's <code>namespace</code>, <code>name</code>
  and one <code>community</code> that the package is listed in.
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
<details
  <summary>Subdomain Communities</summary>
  <p>
    Some communities use a 'subdomain' alternative URL, for example, Valheim:
  </p>
  <p>
    <code>https://valheim.thunderstore.io/package/[namespace]/[packageName]</code>
  </p>
<details>
`

class BaseThunderstoreService extends BaseJsonService {
  /**
   * Fetches package from the Thunderstore API.
   *
   * @param {object} pkg - Package specifier
   * @param {string} pkg.namespace - the package namespace
   * @param {string} pkg.packageName - the package name
   * @returns {Promise<object>} - Promise containing validated package information
   */
  async fetchPackage({ namespace, packageName }) {
    return this._requestJson({
      schema: packageSchema,
      url: `https://thunderstore.io/api/experimental/package/${namespace}/${packageName}`,
    })
  }
}

export { BaseThunderstoreService, documentation }
