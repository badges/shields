const sprintId = 8
const sprintQueryString = {
  jql: `sprint=${sprintId} AND type IN (Bug,Improvement,Story,"Technical task")`,
  fields: 'resolution',
  maxResults: 500,
}

const config = {
  public: {
    services: {
      jira: {
        authorizedOrigins: ['https://issues.apache.org'],
      },
    },
  },
}

export { sprintId, sprintQueryString, config }
