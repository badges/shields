const sprintId = 8
const sprintQueryString = {
  jql: `sprint=${sprintId} AND type IN (Bug,Improvement,Story,"Technical task")`,
  fields: 'resolution',
  maxResults: 500,
}

const user = 'admin'
const pass = 'password'
const host = 'myprivatejira.test'
const config = {
  public: {
    services: {
      jira: {
        authorizedOrigins: [`https://${host}`],
      },
    },
  },
  private: { jira_user: user, jira_pass: pass },
}

export { sprintId, sprintQueryString, user, pass, host, config }
