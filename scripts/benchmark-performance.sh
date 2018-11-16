#!/bin/sh

PROFILE_MAKE_BADGE=1 node server 1111 >perftest.log &
sleep 2
for ((i=0;i<10000;i++)); do
  curl -s http://localhost:1111/badge/coverage-"$i"%-green.svg >/dev/null
done
kill $(jobs -p)
<perftest.log grep 'makeBadge total' | \
  grep -Eo '[0-9\.]+' | \
  awk '{s+=$1;n++} END {print s/n}'
