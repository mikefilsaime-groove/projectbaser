#!/usr/bin/env bash

set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
webapp_dir="$repo_root/webapp"
runtime_dir="$repo_root/focalboard"
staging_dir="$runtime_dir/.pack-staging"
previous_dir="$runtime_dir/.pack-previous"

cd "$repo_root"

if [[ ! -x "$webapp_dir/node_modules/.bin/webpack" ]]; then
    echo "Installing webapp dependencies..."
    npm --prefix "$webapp_dir" install --legacy-peer-deps --include=dev
fi

echo "Building ProjectBaser webapp..."
npm --prefix "$webapp_dir" run pack

echo "Staging production web assets..."
rm -rf "$staging_dir" "$previous_dir"
cp -a "$webapp_dir/pack" "$staging_dir"

if [[ -d "$runtime_dir/pack" ]]; then
    mv "$runtime_dir/pack" "$previous_dir"
fi

if ! mv "$staging_dir" "$runtime_dir/pack"; then
    if [[ -d "$previous_dir" ]]; then
        mv "$previous_dir" "$runtime_dir/pack"
    fi
    echo "ERROR: Could not activate the new web assets; restored the previous bundle." >&2
    exit 1
fi

rm -rf "$previous_dir"
echo "ProjectBaser production web assets are ready."
