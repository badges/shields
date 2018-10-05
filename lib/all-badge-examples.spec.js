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
        exampleUrl: '/appveyor/ci/gruntjs/grunt.svg',
        previewUrl: '/badge/build-passing-brightgreen.svg',
        urlPattern: '/appveyor/ci/:user/:repo.svg',
        documentation: undefined,
        keywords: undefined,
      },
      {
        title: 'AppVeyor branch',
        exampleUrl: '/appveyor/ci/gruntjs/grunt/master.svg',
        previewUrl: '/badge/build-passing-brightgreen.svg',
        urlPattern: '/appveyor/ci/:user/:repo/:branch.svg',
        documentation: undefined,
        keywords: undefined,
      },
    ])
  })
})
