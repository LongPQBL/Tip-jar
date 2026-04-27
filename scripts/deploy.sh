#!/usr/bin/env bash
# build + deploy the tip_jar contract to stellar testnet, then write the
# contract id into .env.local so the frontend picks it up.
#
# usage: scripts/deploy.sh [stellar-key-name]
# default key is "alice".

set -euo pipefail

cd "$(dirname "$0")/.."

SOURCE="${1:-alice}"
NETWORK="testnet"
WASM=contract/target/wasm32v1-none/release/tip_jar_contract.wasm
KEY=NEXT_PUBLIC_TIP_JAR_CONTRACT_ID
ENV_FILE=.env.local

echo "==> building"
stellar contract build --manifest-path contract/Cargo.toml

echo "==> deploying as $SOURCE on $NETWORK"
CONTRACT_ID=$(stellar contract deploy \
  --wasm "$WASM" \
  --source "$SOURCE" \
  --network "$NETWORK" \
  2>&1 | tail -1)

if [[ ! "$CONTRACT_ID" =~ ^C[A-Z0-9]{55}$ ]]; then
  echo "deploy failed, output was: $CONTRACT_ID" >&2
  exit 1
fi

echo "==> deployed: $CONTRACT_ID"

if [ -f "$ENV_FILE" ] && grep -q "^$KEY=" "$ENV_FILE"; then
  if [[ "$OSTYPE" == "darwin"* ]]; then
    sed -i '' "s|^$KEY=.*|$KEY=$CONTRACT_ID|" "$ENV_FILE"
  else
    sed -i "s|^$KEY=.*|$KEY=$CONTRACT_ID|" "$ENV_FILE"
  fi
else
  echo "$KEY=$CONTRACT_ID" >> "$ENV_FILE"
fi

echo "==> wrote $KEY to $ENV_FILE"
echo "==> https://stellar.expert/explorer/testnet/contract/$CONTRACT_ID"
