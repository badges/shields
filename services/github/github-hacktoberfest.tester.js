import Joi from 'joi'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

const isHacktoberfestNoIssuesStatus = Joi.string().regex(
  /^[0-9]+ PRs?(, [0-9]+ days? left)?$/
)
const isHacktoberfestNoPRsStatus = Joi.string().regex(
  /^([0-9]+ open issues?)?[0-9]+ days? left$/
)
const isHacktoberfestCombinedStatus = Joi.string().regex(
  /^[0-9]+ open issues?(, [0-9]+ PRs?)?(, [0-9]+ days? left)?$/
)
const isHacktoberfestStatus = Joi.alternatives().try(
  isHacktoberfestNoIssuesStatus,
  isHacktoberfestNoPRsStatus,
  isHacktoberfestCombinedStatus,
  /^is over! \([0-9]+ PRs? opened\)$/
)

t.create('GitHub Hacktoberfest combined status')
  .get('/2019/badges/shields.json')
  .expectBadge({
    label: 'hacktoberfest',
    message: isHacktoberfestStatus,
  })

t.create('GitHub Hacktoberfest combined status (suggestion label override)')
  .get(
    `/2019/badges/shields.json?suggestion_label=${encodeURIComponent(
      'good first issue'
    )}`
  )
  .expectBadge({
    label: 'hacktoberfest',
    message: isHacktoberfestStatus,
  })
