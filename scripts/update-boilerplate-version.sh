#!/usr/bin/env bash

LATEST=$(
  git ls-remote -h git@bitbucket.org:technology-studio/test-boilerplate-private-typescript.git |
  grep refs/heads/main | awk '{ print $1 }'
)
echo $LATEST > .boilerplate-version
echo "Updated boilerplate version to: $LATEST"