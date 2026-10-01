#!/usr/bin/env bash
# Läuft auf docker-box (Telekom-Anschluss) alle zwei Stunden per cron.
# Holt das öffentliche Instagram-Profil, das der Hetzner-Server wegen
# Drosselung (HTTP 429) oft nicht abrufen darf, und liefert es per SSH an
# /opt/services/flora/instagram-inbox.sh. Eine Anfrage pro Lauf.
set -euo pipefail

USERNAME=cafe_flora_osnabrueck
KEY=$HOME/.ssh/flora_relay
TARGET=scortex@server.scortex.de

body=$(mktemp)
trap 'rm -f "$body"' EXIT

status=$(curl -s -o "$body" -w '%{http_code}' --max-time 20 \
	-A 'Instagram 361.0.0.46.88 Android (34/14; 480dpi; 1080x2400; samsung; SM-S918B; dm3q; qcom; de_DE; 674675155)' \
	-H 'x-ig-app-id: 567067343352427' \
	"https://i.instagram.com/api/v1/users/web_profile_info/?username=$USERNAME")

if [ "$status" != 200 ]; then
	echo "$(date -Is) Instagram antwortet mit HTTP $status" >&2
	exit 1
fi

ssh -i "$KEY" -o IdentitiesOnly=yes -o BatchMode=yes "$TARGET" < "$body"
