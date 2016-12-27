#!/bin/bash

if [ "$TRAVIS_BRANCH" == "master" ]; then curl -X POST -H "Authorization: Bearer $APIKEY" -d '{"url":"git@github.com:ion-channel/shields.git", "project":"ionchannel/shields", "tag":"latest", "branch":"master", "deploy":"false"}' $DEPLOYURL; fi