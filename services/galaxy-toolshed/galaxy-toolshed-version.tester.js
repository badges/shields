import { isVPlusTripleDottedVersion, withRegex } from '../test-validators.js'
import { ServiceTester } from '../tester.js'

export const t = new ServiceTester({
  id: 'galaxy-toolshed',
  title: 'GalaxyToolshed',
})
const isRequirementOne = withRegex(/^(\[\w+\s-\s[\w.]+\])$/)
const isRequirementSeveral = withRegex(/^(\[\w+\s-\s[\w.]+\],?\s?)+$/)

t.create('repo - raw').get('/v/sra_tools/iuc/fastq_dump.json').expectBadge({
  label: 'galaxy-toolshed',
  message: isVPlusTripleDottedVersion,
})

t.create('repo - display (reponame)')
  .get('/v/sra_tools/iuc/fastq_dump.json?display=reponame')
  .expectBadge({
    label: 'galaxy-toolshed|sra_tools',
    message: isVPlusTripleDottedVersion,
  })

t.create('repo - display (toolid)')
  .get('/v/sra_tools/iuc/fastq_dump.json?display=toolid')
  .expectBadge({
    label: 'galaxy-toolshed|fastq_dump',
    message: isVPlusTripleDottedVersion,
  })

t.create('repo - display (toolname)')
  .get('/v/sra_tools/iuc/fastq_dump.json?display=toolname')
  .expectBadge({
    label: 'galaxy-toolshed|Extract reads',
    message: isVPlusTripleDottedVersion,
  })

t.create('requirement - display (basic)')
  .get('/vr/sra_tools/iuc/fastq_dump.json')
  .expectBadge({
    label: 'galaxy-toolshed',
    message: isRequirementSeveral,
  })

t.create('requirement - display (reponame)')
  .get('/vr/sra_tools/iuc/fastq_dump.json?display=reponame')
  .expectBadge({
    label: 'galaxy-toolshed|sra_tools',
    message: isRequirementSeveral,
  })

t.create('requirement - display (reponame) - requirement (one)')
  .get('/vr/sra_tools/iuc/fastq_dump.json?display=reponame&requirement=perl')
  .expectBadge({
    label: 'galaxy-toolshed|sra_tools',
    message: isRequirementOne,
  })

// Not found
t.create('not found (reponame)')
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

t.create('not found (toolid)')
  .get('/v/sra_tools/iuc/fastq_dum.json')
  .expectBadge({
    label: 'galaxy-toolshed',
    message: 'tool not found',
  })

t.create('not found (requirementid)')
  .get('/vr/sra_tools/iuc/fastq_dump.json?display=reponame&requirement=python')
  .expectBadge({
    label: 'galaxy-toolshed',
    message: 'requirement not found',
  })
