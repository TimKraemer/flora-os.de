#!/usr/bin/env bash
# Nimmt die Instagram-Profildaten vom Relay (deploy/instagram-relay.sh auf
# docker-box) entgegen. Der Relay-Schlüssel in ~/.ssh/authorized_keys darf nur
# dieses Skript ausführen (command=…, restrict). Die Daten kommen über stdin.
#
# Die Website liest relay.json, wenn Instagram den Server selbst drosselt.
set -euo pipefail
cd "$(dirname "$0")"

target=data/instagram/relay.json
mkdir -p "$(dirname "$target")"
tmp=$(mktemp "$target.XXXXXX")
trap 'rm -f "$tmp"' EXIT

# Höchstens 5 MB annehmen; eine Profilantwort hat etwa 150 KB.
head -c 5242880 > "$tmp"

python3 - "$tmp" <<'PY'
import json, sys
user = json.load(open(sys.argv[1]))["data"]["user"]
if user["username"] != "cafe_flora_osnabrueck":
    sys.exit(f"falsches Profil: {user['username']}")
print(f"{len(user['edge_owner_to_timeline_media']['edges'])} Beiträge angenommen")
PY

chmod 644 "$tmp"
mv "$tmp" "$target"
trap - EXIT
