import { expectType, expectError, expectAssignable } from 'tsd'
import { makeBadge, ValidationError } from '.'

expectError(makeBadge('string is invalid'))
expectError(makeBadge({}))
expectError(
  makeBadge({
    message: 'passed',
    style: 'invalid style',
  })
)

expectType<string>(
  makeBadge({
    message: 'passed',
  })
)
expectType<string>(
  makeBadge({
    label: 'build',
    message: 'passed',
  })
)
expectType<string>(
  makeBadge({
    label: 'build',
    message: 'passed',
    labelColor: 'green',
    color: 'red',
    style: 'flat',
  })
)

const error = new ValidationError()
expectAssignable<Error>(error)
