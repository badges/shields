import { isVPlusTripleDottedVersion, withRegex } from '../test-validators.js'
import { ServiceTester } from '../tester.js'

export const t = new ServiceTester({
  id: 'galaxy-toolshed',
  title: 'GalaxyToolshed',
})
const isRequirementOne = withRegex(/^(\[\w+\s-\s[\w.]+\])$/)
const isRequirementSeveral = withRegex(/^(\[\w+\s-\s[\w.]+\],?\s?)+$/)

t.create('repository - raw')
  .get('/v/sra_tools/iuc/fastq_dump.json')
  .expectBadge({
    label: 'galaxy-toolshed',
    message: isVPlusTripleDottedVersion,
  })

t.create('repository - display (repositoryName)')
  .get('/v/sra_tools/iuc/fastq_dump.json?display=repositoryName')
  .expectBadge({
    label: 'galaxy-toolshed|sra_tools',
    message: isVPlusTripleDottedVersion,
  })

t.create('repository - display (toolId)')
  .get('/v/sra_tools/iuc/fastq_dump.json?display=toolId')
  .expectBadge({
    label: 'galaxy-toolshed|fastq_dump',
    message: isVPlusTripleDottedVersion,
  })

t.create('repository - display (toolName)')
  .get('/v/sra_tools/iuc/fastq_dump.json?display=toolName')
  .expectBadge({
    label: 'galaxy-toolshed|Extract reads',
    message: isVPlusTripleDottedVersion,
  })

t.create('requirement - display (basic)')
  .get('/v/sra_tools/iuc/fastq_dump/all.json')
  .expectBadge({
    label: 'galaxy-toolshed',
    message: isRequirementSeveral,
  })

t.create('requirement - display (repositoryName)')
  .get('/v/sra_tools/iuc/fastq_dump/all.json?display=repositoryName')
  .expectBadge({
    label: 'galaxy-toolshed|sra_tools',
    message: isRequirementSeveral,
  })

t.create('requirement - display (repositoryName) - requirement (one)')
  .get('/v/sra_tools/iuc/fastq_dump/perl.json?display=repositoryName')
  .expectBadge({
    label: 'galaxy-toolshed|sra_tools',
    message: isRequirementOne,
  })

// Not found
t.create('not found (repositoryName)')
  .get('/v/sra_tool/iuc/fastq_dump.json')
  .expectBadge({
    label: 'galaxy-toolshed',
    message: 'not found',
  })

t.create('not found (owner)')
  .get('/v/sra_tools/iu/fastq_dump.json')
  .expectBadge({
    label: 'galaxy-toolshed',
    message: 'not found',
  })

t.create('not found (toolId)')
  .get('/v/sra_tools/iuc/fastq_dum.json')
  .expectBadge({
    label: 'galaxy-toolshed',
    message: 'tool not found',
  })

t.create('not found (requirementName)')
  .get('/v/sra_tools/iuc/fastq_dump/python.json?display=repositoryName')
  .expectBadge({
    label: 'galaxy-toolshed',
    message: 'requirement not found',
  })
