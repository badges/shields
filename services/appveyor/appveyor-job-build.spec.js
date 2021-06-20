import { expect } from 'chai'
import { test, given } from 'sazerac'
import { NotFound } from '../index.js'
import AppveyorJobBuild from './appveyor-job-build.service.js'

describe('AppveyorJobBuild', function () {
  test(AppveyorJobBuild.prototype.transform, () => {
    given({ data: {} }).expect({
      status: 'no builds found',
    })
    given({
      jobName: 'linux',
      data: {
        build: {
          jobs: [
            {
              name: 'windows',
              status: 'failed',
            },
            {
              name: 'linux',
              status: 'passed',
            },
          ],
        },
      },
    }).expect({
      status: 'passed',
    })
  })

  it('throws NotFound when response is missing jobs', function () {
    expect(() => AppveyorJobBuild.prototype.transform({ data: { build: {} } }))
      .to.throw(NotFound)
      .with.property('prettyMessage', 'no jobs found')
  })

  it('throws NotFound when specified job missing jobs', function () {
    expect(() =>
      AppveyorJobBuild.prototype.transform({
        jobName: 'mac',
        data: {
          build: {
            jobs: [
              {
                name: 'linux',
                status: 'passed',
              },
              {
                name: 'windows',
                status: 'passed',
              },
            ],
          },
        },
      })
    )
      .to.throw(NotFound)
      .with.property('prettyMessage', 'job not found')
  })
})
