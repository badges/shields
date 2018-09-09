'use strict'

const Joi = require('joi')
const countBy = require('lodash.countby')

const getWorkflowId = function(build) {
  return build.workflows.workflow_id
}

// find all the builds with the same workflow id
const getBuildsForWorkflow = function(builds, workflowId) {
  return builds.filter(build => getWorkflowId(build) === workflowId)
}

// find all the builds with the same workflow id which are also complete
const getCompleteBuildsForWorkflow = function(builds, workflowId) {
  return builds.filter(
    build => getWorkflowId(build) === workflowId && build.outcome !== null
  )
}

// Find the most recent workflow which contains only complete builds
// and return all the builds with that workflow id
const getBuildsForLatestCompleteWorkflow = function(builds) {
  let allBuilds, completeBuilds
  for (let i = 0; i < builds.length; i++) {
    allBuilds = getBuildsForWorkflow(builds, getWorkflowId(builds[i]))
    completeBuilds = getCompleteBuildsForWorkflow(
      builds,
      getWorkflowId(builds[i])
    )
    if (allBuilds.length === completeBuilds.length) {
      return completeBuilds
    }
  }
  throw new Error('No complete workflows found')
}

const countOutcomes = function(builds) {
  return {
    total: builds.length,
    counts: countBy(builds, build => build.outcome),
  }
}

// reduce the outcomes for an array of builds to a single status
const summarizeBuilds = function(builds) {
  const { total, counts } = countOutcomes(builds)

  if (total === counts.success) {
    return 'passing'
  } else if (counts.no_tests >= 1) {
    return 'no tests'
  } else if (counts.infrastructure_fail >= 1) {
    return 'infrastructure fail'
  } else if (counts.canceled >= 1) {
    return 'canceled'
  } else if (counts.timedout >= 1) {
    return 'timed out'
  } else if (counts.failed >= 1) {
    return 'failed'
  }
  throw new Error('Failed to summarize build status')
}

const summarizeBuildsForLatestCompleteWorkflow = function(builds) {
  return summarizeBuilds(getBuildsForLatestCompleteWorkflow(builds))
}

// return the status of the latest complete build
// we need this if a project doesn't use workflows
const getLatestCompleteBuildOutcome = function(builds) {
  const completeBuilds = builds.filter(build => build.outcome != null)
  if (completeBuilds.length === 0) {
    throw new Error('No complete builds found')
  }
  return summarizeBuilds([completeBuilds[0]])
}

const populatedArraySchema = Joi.array()
  .items(
    Joi.object({
      // if we have >0 items in our array, every object must have an 'outcome' key
      outcome: Joi.string()
        .allow(
          'success',
          'no_tests',
          'infrastructure_fail',
          'canceled',
          'timedout',
          'failed',
          null
        )
        .required(),

      // 'workflows' key is optional - not all projects have workflows
      workflows: Joi.object({
        // if there is a 'workflows' key, it must have a string workflow_id
        workflow_id: Joi.string().required(),
      }),
    }).required()
  )
  .min(1)
  .max(100)
  .required()
const emptyArraySchema = Joi.array()
  .min(0)
  .max(0)
  .required() // [] is also a valid response from Circle CI
const circleSchema = Joi.alternatives(populatedArraySchema, emptyArraySchema)

module.exports = {
  circleSchema,
  getLatestCompleteBuildOutcome,
  summarizeBuildsForLatestCompleteWorkflow,
}
