// Cause unhandled promise rejections to fail unit tests, and print with stack
// traces.
process.on('unhandledRejection', error => {
  throw error
})
