import { isVPlusTripleDottedVersion } from '../test-validators.js'
import { createServiceTester } from '../tester.js'

export const t = await createServiceTester()

t.create('version - tool').get('/sra_tools/iuc/fastq_dump.json').expectBadge({
  label: 'fastq_dump',
  message: isVPlusTripleDottedVersion,
})

// Not found
t.create('not found - repository')
  .get('/sra_too/iuc/fastq_dump.json')
  .expectBadge({
    label: 'galaxy-toolshed',
    message: 'not found',
  })
t.create('not found - owner').get('/sra_tool/iu/fastq_dump.json').expectBadge({
  label: 'galaxy-toolshed',
  message: 'not found',
})
t.create('not found - tool').get('/sra_tools/iuc/fastq_dum.json').expectBadge({
  label: 'galaxy-toolshed',
  message: 'tool not found',
})
