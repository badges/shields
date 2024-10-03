import Joi from 'joi'
import { createServiceTester } from '../tester.js'
import { withRegex } from '../test-validators.js'

export const t = await createServiceTester()

t.create('Game Versions')
  .get('/AANobbMI.json')
  .expectBadge({
    label: 'game versions',
    message: Joi.alternatives().try(
      withRegex(/^(\d+\.\d+(\.\d+)?( \| )?)+$/),
      withRegex(
        /^\d+\.\d+(\.\d+)? \| \d+\.\d+(\.\d+)? \| \.\.\. \| \d+\.\d+(\.\d+)? \| \d+\.\d+(\.\d+)?$/,
      ),
    ),
  })

t.create('Game Versions (not found)')
  .get('/not-existing.json')
  .expectBadge({ label: 'game versions', message: 'not found', color: 'red' })
