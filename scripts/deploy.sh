#!/usr/bin/env bash
# build + deploy both contracts (receipt + tip_jar) to stellar testnet,
# transfer the receipt's admin role to the tip_jar contract so it can mint,
# then write both contract ids into .env.local.
#
# usage: scripts/deploy.sh [stellar-key-name]
# default key is "alice".

set -euo pipefail

cd "$(dirname "$0")/.."

SOURCE="${1:-alice}"
NETWORK="testnet"
ENV_FILE=.env.local
RECEIPT_WASM=contract/target/wasm32v1-none/release/receipt_token.wasm
TIP_JAR_WASM=contract/target/wasm32v1-none/release/tip_jar_contract.wasm

echo "==> building"
stellar contract build --manifest-path contract/receipt/Cargo.toml >/dev/null
stellar contract build --manifest-path contract/tip_jar/Cargo.toml >/dev/null

ADMIN=$(stellar keys address "$SOURCE")
echo "==> deployer (initial receipt admin): $ADMIN"

echo "==> deploying receipt token"
RECEIPT=$(stellar contract deploy \
  --wasm "$RECEIPT_WASM" \
  --source "$SOURCE" \
  --network "$NETWORK" \
  -- --admin "$ADMIN" \
  2>&1 | tail -1)
[[ "$RECEIPT" =~ ^C[A-Z0-9]{55}$ ]] || { echo "receipt deploy failed: $RECEIPT"; exit 1; }
echo "    -> $RECEIPT"

echo "==> deploying tip_jar pointing at receipt"
TIP_JAR=$(stellar contract deploy \
  --wasm "$TIP_JAR_WASM" \
  --source "$SOURCE" \
  --network "$NETWORK" \
  -- --receipt "$RECEIPT" \
  2>&1 | tail -1)
[[ "$TIP_JAR" =~ ^C[A-Z0-9]{55}$ ]] || { echo "tip_jar deploy failed: $TIP_JAR"; exit 1; }
echo "    -> $TIP_JAR"

echo "==> transferring receipt admin to tip_jar"
stellar contract invoke \
  --id "$RECEIPT" \
  --source "$SOURCE" \
  --network "$NETWORK" \
  -- set_admin --new_admin "$TIP_JAR" >/dev/null

write_env() {
  local key="$1" value="$2"
  if [ -f "$ENV_FILE" ] && grep -q "^$key=" "$ENV_FILE"; then
    if [[ "$OSTYPE" == "darwin"* ]]; then
      sed -i '' "s|^$key=.*|$key=$value|" "$ENV_FILE"
    else
      sed -i "s|^$key=.*|$key=$value|" "$ENV_FILE"
    fi
  else
    echo "$key=$value" >> "$ENV_FILE"
  fi
}

write_env NEXT_PUBLIC_TIP_JAR_CONTRACT_ID "$TIP_JAR"
write_env NEXT_PUBLIC_RECEIPT_CONTRACT_ID "$RECEIPT"

echo "==> wrote ids to $ENV_FILE"
echo
echo "tip_jar:  https://stellar.expert/explorer/testnet/contract/$TIP_JAR"
echo "receipt:  https://stellar.expert/explorer/testnet/contract/$RECEIPT"
