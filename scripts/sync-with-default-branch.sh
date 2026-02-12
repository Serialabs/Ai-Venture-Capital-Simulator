#!/usr/bin/env bash
set -euo pipefail

if ! git rev-parse --git-dir >/dev/null 2>&1; then
  echo "Run this inside a git repository."
  exit 1
fi

current_branch="$(git rev-parse --abbrev-ref HEAD)"
if [[ "$current_branch" == "HEAD" ]]; then
  echo "Detached HEAD detected; checkout your PR branch first."
  exit 1
fi

git fetch origin

if git show-ref --verify --quiet refs/remotes/origin/main; then
  base_ref="origin/main"
elif git show-ref --verify --quiet refs/remotes/origin/master; then
  base_ref="origin/master"
else
  echo "Could not find origin/main or origin/master"
  exit 1
fi

echo "Merging ${base_ref} into ${current_branch}..."
git merge "$base_ref"
echo "Merge completed. If conflicts were shown, resolve files, then run:"
echo "  git add . && git commit -m 'Resolve merge conflicts' && git push"
