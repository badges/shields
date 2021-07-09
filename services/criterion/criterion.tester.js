import Joi from 'joi'
import { createServiceTester } from '../tester.js'
import {
  IMPROVED_STATUS,
  REGRESSED_STATUS,
  NO_CHANGE_STATUS,
  NOT_FOUND_STATUS,
} from './constants.js'
export const t = await createServiceTester()

const isStatus = Joi.string()
  .allow(IMPROVED_STATUS, REGRESSED_STATUS, NOT_FOUND_STATUS, NO_CHANGE_STATUS)
  .required()

t.create('Criterion (valid repo)')
  .get('/chmoder/credit_card.json')
  .expectBadge({ label: 'criterion', message: isStatus })

t.create('Criterion (not found)')
  .get('/chmoder/not-a-repo.json')
  .expectBadge({ label: 'criterion', message: NOT_FOUND_STATUS })
