'use strict'

const { expect } = require('chai')

const allBadgeExamples = require('./all-badge-examples')

describe('The badge examples', function() {
  it('should include AppVeyor, which is added automatically', function() {
    const { examples } = allBadgeExamples.findCategory('build')

    const appVeyorBuildExamples = examples
      .filter(ex => ex.title.includes('AppVeyor'))
      .filter(ex => !ex.title.includes('tests'))

    expect(appVeyorBuildExamples).to.deep.equal([
      {
        title: 'AppVeyor',
        previewUri: '/badge/build-passing-brightgreen.svg',
        exampleUri: '/appveyor/ci/USER/REPO.svg',
        documentation: undefined,
      },
      {
        title: 'AppVeyor branch',
        previewUri: '/badge/build-passing-brightgreen.svg',
        exampleUri: '/appveyor/ci/USER/REPO/BRANCH.svg',
        documentation: undefined,
      },
    ])
  })
})
