import TeamCityBase from './teamcity-base.js'

const config = {
  public: {
    services: {
      [TeamCityBase.auth.serviceKey]: {
        authorizedOrigins: ['https://teamcity.jetbrains.com'],
      },
    },
  },
}

export { config }
