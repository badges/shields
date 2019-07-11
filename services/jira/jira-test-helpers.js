'use strict'

const sprintId = 8
const sprintQueryString = {
  jql: `sprint=${sprintId} AND type IN (Bug,Improvement,Story,"Technical task")`,
  fields: 'resolution',
  maxResults: 500,
}

const user = 'admin'
const pass = 'password'
const config = { private: { jira_user: user, jira_pass: pass } }

module.exports = {
  sprintId,
  sprintQueryString,
  user,
  pass,
  config,
}
