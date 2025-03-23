#!/bin/bash

set -e

# Remove a potentially pre-existing server.pid for Rails.
rm -f /app/tmp/pids/server.pid

# generate JS & CSS
bundle exec rails assets:precompile

# run DB migrations
rake db:migrate

# Then exec the container’s main process (what’s set as CMD in the Dockerfile).
exec "$@"
