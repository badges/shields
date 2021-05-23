const invalidJSONString = '{{{{{invalid json}}'

export {
  invalidJSON: () => [
    200,
    invalidJSONString,
    { 'Content-Type': 'application/json' },
  ],
  invalidJSONString,
};
