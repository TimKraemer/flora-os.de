#!/usr/bin/env bash
# Rollout ohne Unterbrechung (Blue/Green mit docker compose), Vorlage ist
# deploy/rollout.sh von erleben.app.
#
# Startet einen zweiten Container neben dem laufenden, wartet auf
# /api/health und stoppt erst dann den alten. nginx-proxy verteilt so lange
# auf beide. Wird der neue nicht gesund, bleibt der alte stehen.
#
# Von Hand, z. B. Rückkehr zu einer älteren Version:
#   FLORA_TAG=<commit-sha> bash /opt/services/flora/rollout.sh
set -euo pipefail
cd "$(dirname "$0")"

SERVICE=flora-nextjs
READY_TIMEOUT=${READY_TIMEOUT:-90}
STOP_TIMEOUT=${STOP_TIMEOUT:-30}
KEEP_IMAGES=${KEEP_IMAGES:-3}
export FLORA_TAG=${FLORA_TAG:-latest}

compose() { docker compose -f docker-compose.yaml "$@"; }
log() { echo "$(date +%H:%M:%S) $*"; }

exec 9>/tmp/flora-rollout.lock
flock 9

old=$(compose ps -q "$SERVICE" | sort)
old_count=$(wc -w <<<"$old")

log "Starte $FLORA_TAG neben $old_count laufenden Container(n)"
compose up -d --no-deps --no-recreate --scale "$SERVICE=$((old_count + 1))" "$SERVICE"

new=$(comm -23 <(compose ps -q "$SERVICE" | sort) <(echo "$old"))
[ -n "$new" ] || { echo "Kein neuer Container gestartet" >&2; exit 1; }

log "Warte auf /api/health in ${new:0:12}"
ready=
for ((i = 0; i < READY_TIMEOUT; i++)); do
	if docker exec "$new" node -e 'fetch("http://localhost:3002/api/health").then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))' 2>/dev/null; then
		ready=1
		break
	fi
	sleep 1
done
if [ -z "$ready" ]; then
	log "Neuer Container nach ${READY_TIMEOUT}s nicht bereit, alter bleibt stehen"
	docker logs --tail 50 "$new" >&2 || true
	docker rm -f "$new" >/dev/null
	exit 1
fi

for c in $old; do
	log "Stoppe alten Container ${c:0:12}"
	docker stop -t "$STOP_TIMEOUT" "$c" >/dev/null 2>&1 || true
	docker rm "$c" >/dev/null 2>&1 || true
done

# Die letzten Versionen für einen schnellen Rückweg behalten, ältere löschen.
docker images ghcr.io/timkraemer/flora-os.de --format '{{.CreatedAt}}\t{{.ID}}' |
	sort -r | awk -F'\t' '!seen[$2]++ {print $2}' | tail -n +$((KEEP_IMAGES + 1)) |
	xargs -r docker rmi -f >/dev/null 2>&1 || true

log "Fertig: ${new:0:12} läuft mit $FLORA_TAG"
