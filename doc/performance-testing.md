# Performance testing

Shields has some basic tooling available to help you get started with
performance testing.

## Benchmarking the badge generation

Want to micro-benchmark a section of the code responsible for generating the
static badges? Follow these two simple steps:

1. Surround the code you want to time with `console.time` and `console.timeEnd`
   statements. For example:

```
console.time('makeBadge')
const svg = makeBadge(badgeData)
console.timeEnd('makeBadge')
```

2. Run `npm run benchmark:badge` in your terminal. An average timing will
   be displayed!

If you want to change the number of iterations in the benchmark, you can modify
the values specified by the `benchmark:badge` script in _package.json_. If
you want to benchmark a specific code path not covered by the static badge, you
can modify the badge URL in _scripts/benchmark-performance.js_.

## Profiling the full code

Want to have an overview of how the entire application is performing? Simply
run `npm run profile:server` in your terminal. This will start the
backend server (i.e. without the frontend) in profiling mode and any requests
you make on `localhost:8080` will generate data in a file with a name
similar to _isolate-00000244AB6ED3B0-11920-v8.log_.

You can then make use of this profiling data in various tools, for example
[flamebearer](https://github.com/mapbox/flamebearer):

```
npm install -g flamebearer
node --prof-process --preprocess -j isolate-00000244AB6ED3B0-11920-v8.log | flamebearer
```

An example output is the following:
![](https://raw.github.com/badges/shields/master/doc/flamegraph.png)
