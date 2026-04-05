#!/bin/bash
# Helper script to commit with AI co-authors

if [ -z "$1" ]; then
  echo "Usage: ./scripts/commit-with-ai.sh \"Your commit message\""
  exit 1
fi

COMMIT_MSG="$1"

# Add co-authors
CO_AUTHORS="

Co-authored-by: Kiro AI <kiro@anthropic.com>
Co-authored-by: Claude <claude@anthropic.com>
Co-authored-by: GitHub Copilot <copilot@github.com>"

git commit -m "${COMMIT_MSG}${CO_AUTHORS}"

echo "✅ Committed with AI co-authors!"
