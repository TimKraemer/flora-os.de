#!/usr/bin/env bash
# Einstieg für GitHub Actions. Der Deploy-Schlüssel in ~/.ssh/authorized_keys
# darf nur dieses Skript ausführen (command=…, restrict). Aufruf:
#
#   ssh scortex@server.scortex.de deploy <commit-sha>  < ghcr-token
#
# Das Registry-Token kommt über stdin, gilt nur für diesen Workflow-Lauf und
# wird nur in einem temporären Docker-Config-Verzeichnis abgelegt.
set -euo pipefail
cd "$(dirname "$0")"

read -r action tag extra <<<"${SSH_ORIGINAL_COMMAND:-}"
if [[ $action != deploy || ! $tag =~ ^[0-9a-f]{7,40}$ || -n ${extra:-} ]]; then
	echo "Aufruf: deploy <commit-sha>" >&2
	exit 2
fi

image=ghcr.io/timkraemer/flora-os.de:$tag
login=$(mktemp -d)
trap 'rm -rf "$login"' EXIT
DOCKER_CONFIG=$login docker login ghcr.io -u github-actions --password-stdin >/dev/null
DOCKER_CONFIG=$login docker pull -q "$image"

FLORA_TAG=$tag bash ./rollout.sh
