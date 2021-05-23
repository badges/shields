const invalidJSONString = '{{{{{invalid json}}'

export default {
  invalidJSON: () => [
    200,
    invalidJSONString,
    { 'Content-Type': 'application/json' },
  ],
  invalidJSONString,
};
