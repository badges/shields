import { isVPlusTripleDottedVersion, withRegex } from '../test-validators.js'
import { ServiceTester } from '../tester.js'

export const t = new ServiceTester({
  id: 'galaxy-toolshed',
  title: 'GalaxyToolshed',
})

t.create('repository - repository')
  .get('/v/sra_tools/iuc.json')
  .expectBadge({
    label: 'sra_tools',
    message: withRegex(/^([\w\d]+)$/),
  })
t.create('repository - tool')
  .get('/v/sra_tools/iuc/fastq_dump.json')
  .expectBadge({
    label: 'Extract reads',
    message: isVPlusTripleDottedVersion,
  })
t.create('repository - requirement')
  .get('/v/sra_tools/iuc/fastq_dump/perl.json')
  .expectBadge({
    label: 'perl',
    message: isVPlusTripleDottedVersion,
  })

// Not found
t.create('not found - repository').get('/v/sra_too/iuc.json').expectBadge({
  label: 'galaxy-toolshed',
  message: 'not found',
})
t.create('not found - owner').get('/v/sra_tool/iu.json').expectBadge({
  label: 'galaxy-toolshed',
  message: 'not found',
})
t.create('not found - tool')
  .get('/v/sra_tools/iuc/fastq_dum.json')
  .expectBadge({
    label: 'galaxy-toolshed',
    message: 'tool not found',
  })
t.create('not found - requirement')
  .get('/v/sra_tools/iuc/fastq_dump/per.json')
  .expectBadge({
    label: 'galaxy-toolshed',
    message: 'requirement not found',
  })
