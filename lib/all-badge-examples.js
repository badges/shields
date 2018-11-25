'use strict'

const { loadServiceClasses } = require('../services')

const allBadgeExamples = [
  {
    category: {
      id: 'build',
      name: 'Build',
    },
    examples: [],
  },
  {
    category: {
      id: 'chat',
      name: 'Chat',
    },
    examples: [],
  },
  {
    category: {
      id: 'dependencies',
      name: 'Dependencies',
    },
    examples: [],
  },
  {
    category: {
      id: 'size',
      name: 'Size',
    },
    examples: [],
  },
  {
    category: {
      id: 'downloads',
      name: 'Downloads',
    },
    examples: [],
  },
  {
    category: {
      id: 'funding',
      name: 'Funding',
    },
    examples: [],
  },
  {
    category: {
      id: 'issue-tracking',
      name: 'Issue Tracking',
    },
    examples: [],
  },
  {
    category: {
      id: 'license',
      name: 'License',
    },
    examples: [],
  },
  {
    category: {
      id: 'rating',
      name: 'Rating',
    },
    examples: [],
  },
  {
    category: {
      id: 'social',
      name: 'Social',
    },
    examples: [],
  },
  {
    category: {
      id: 'version',
      name: 'Version',
    },
    examples: [],
  },
  {
    category: {
      id: 'platform-support',
      name: 'Platform & Version Support',
    },
    examples: [],
  },
  {
    category: {
      id: 'monitoring',
      name: 'Monitoring',
    },
    examples: [],
  },
  {
    category: {
      id: 'other',
      name: 'Other',
    },
    examples: [],
  },
]

function findCategory(wantedCategory) {
  return allBadgeExamples.find(
    thisCat => thisCat.category.id === wantedCategory
  )
}

function loadExamples() {
  loadServiceClasses().forEach(ServiceClass => {
    const prepared = ServiceClass.prepareExamples()
    if (prepared.length === 0) {
      return
    }
    const category = findCategory(ServiceClass.category)
    if (category === undefined) {
      throw Error(
        `Unknown category ${ServiceClass.category} referenced in ${
          ServiceClass.name
        }`
      )
    }
    category.examples = category.examples.concat(prepared)
  })
}
loadExamples()

module.exports = allBadgeExamples
module.exports.findCategory = findCategory
