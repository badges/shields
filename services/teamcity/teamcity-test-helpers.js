'use strict'

const user = 'admin'
const pass = 'password'
const host = 'mycompany.teamcity.com'
const config = {
  public: {
    services: {
      teamcity: {
        authorizedOrigins: [`https://${host}`],
      },
    },
  },
  private: {
    teamcity_user: user,
    teamcity_pass: pass,
  },
}

module.exports = {
  user,
  pass,
  host,
  config,
}
