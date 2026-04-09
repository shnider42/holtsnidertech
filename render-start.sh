#!/usr/bin/env bash
set -o errexit

PORT_TO_USE="${PORT:-10000}"
exec gunicorn run:app --bind 0.0.0.0:${PORT_TO_USE}
