export const invalidJSONString = '{{{{{invalid json}}'

export const invalidJSON = () => [
  200,
  invalidJSONString,
  { 'Content-Type': 'application/json' },
]
