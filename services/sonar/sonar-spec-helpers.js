import SonarBase from './sonar-base.js'
import { openApiQueryParams } from './sonar-helpers.js'

const testAuthConfigOverride = {
  public: {
    services: {
      [SonarBase.auth.serviceKey]: {
        authorizedOrigins: [
          openApiQueryParams.find(v => v.name === 'server').example,
        ],
      },
    },
  },
}

/**
 * Returns a legacy sonar api response with desired key and value
 *
 * @param {string} key Key for the response value
 * @param {string|number} val Value to assign to response key
 * @returns {object} Sonar api response
 */
function legacySonarResponse(key, val) {
  return [
    {
      msr: [
        {
          key,
          val,
        },
      ],
    },
  ]
}

export { testAuthConfigOverride, legacySonarResponse }
