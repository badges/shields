import Joi from 'joi'
import { BaseJsonService } from '../index.js'
import { nonNegativeInteger } from '../validators.js'

const schema = Joi.object({
  data: Joi.object({
    downloadCount: nonNegativeInteger,
    latestFiles: Joi.array()
      .items({
        displayName: Joi.string().required(),
        gameVersions: Joi.array().items(Joi.string().required()).required(),
      })
      .required(),
  }).required(),
}).required()

const description = `
The CurseForge badge requires the <code>Project ID</code> in order access the
<a href="https://docs.curseforge.com/#get-mod" target="_blank">CurseForge API</a>.

The <code>Project ID</code> is different from the URL slug and can be found in the 'About Project' section of your
CurseForge mod page.

<img src="https://github.com/badges/shields/assets/1098773/0d45b5fa-2cde-415d-8152-b84c535a1535"
  alt="The Project ID in the 'About Projection' section on CurseForge." />
`

export default class BaseCurseForgeService extends BaseJsonService {
  static auth = {
    passKey: 'curseforge_api_key',
    authorizedOrigins: ['https://api.curseforge.com'],
    isRequired: true,
  }

  async fetchMod({ projectId }) {
    // Documentation: https://docs.curseforge.com/#get-mod
    const response = await this._requestJson(
      this.authHelper.withApiKeyHeader({
        schema,
        url: `https://api.curseforge.com/v1/mods/${projectId}`,
        httpErrors: {
          403: 'invalid API key',
        },
      }),
    )

    const latestFiles = response.data.latestFiles
    const latestFile =
      latestFiles.length > 0 ? latestFiles[latestFiles.length - 1] : {}

    return {
      downloads: response.data.downloadCount,
      version: latestFile?.displayName || 'N/A',
      gameVersions: latestFile?.gameVersions || ['N/A'],
    }
  }
}

export { BaseCurseForgeService, description }
