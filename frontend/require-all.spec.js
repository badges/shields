import walk from 'walkdir'

// Ensure all the frontend files get instrumented. Because `all: true` does
// not work correctly unless `nyc` does the instrumentation.
// https://github.com/istanbuljs/nyc/issues/434#issuecomment-303606136
after(function() {
  walk.sync(__dirname, path => {
    if (path.endsWith('.js') && !path.endsWith('.spec.js')) {
      require(path)
    }
  })
})
