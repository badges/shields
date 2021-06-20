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

export { user, pass, host, config }
