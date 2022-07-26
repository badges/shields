import { withRegex, isVPlusTripleDottedVersion } from '../test-validators.js'
import { createServiceTester } from '../tester.js'

export const t = await createServiceTester()

t.create('version - repository')
  .get('/sra_tools/iuc.json')
  .expectBadge({
    label: 'galaxytoolshed',
    message: withRegex(/^([\w\d]+)$/),
  })
t.create('version - tool').get('/sra_tools/iuc/fastq_dump.json').expectBadge({
  label: 'galaxytoolshed',
  message: isVPlusTripleDottedVersion,
})
t.create('version - requirement')
  .get('/sra_tools/iuc/fastq_dump/perl.json')
  .expectBadge({
    label: 'galaxytoolshed',
    message: isVPlusTripleDottedVersion,
  })

// Not found
t.create('version - changesetRevision not found')
  .get('/bioqc/badilla.json')
  .expectBadge({
    label: 'galaxytoolshed',
    message: 'changesetRevision not found',
  })
t.create('version - repository not found')
  .get('/sra_too/iuc.json')
  .expectBadge({
    label: 'galaxytoolshed',
    message: 'not found',
  })
t.create('version - owner not found').get('/sra_tool/iu.json').expectBadge({
  label: 'galaxytoolshed',
  message: 'not found',
})
t.create('version - tool not found')
  .get('/sra_tools/iuc/fastq_dum.json')
  .expectBadge({
    label: 'galaxytoolshed',
    message: 'tool not found',
  })
t.create('version - requirement not found')
  .get('/sra_tools/iuc/fastq_dump/per.json')
  .expectBadge({
    label: 'galaxytoolshed',
    message: 'requirement not found',
  })
