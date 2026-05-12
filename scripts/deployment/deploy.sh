#!/usr/bin/env bash
set -euo pipefail

SCRIPT_ABS="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd -P)/$(basename "${BASH_SOURCE[0]}")"
cd "$(dirname "$SCRIPT_ABS")/../.."

if [[ -z "${_DOTENV_LOADED:-}" ]]; then
  export _DOTENV_LOADED=1
  exec npx -y dotenv-cli \
    -e studysphere-client/.env \
    -e studysphere-server/.env \
    -- "$SCRIPT_ABS" "$@"
fi

DH_USER="aouckamastevens"
RG="studysphere-rg"
SERVER_APP="studysphere-server"
CLIENT_APP="studysphere-client"
SERVER_URL="https://studysphere-server.kindground-b5587d45.eastus.azurecontainerapps.io"
CLIENT_URL="https://studysphere-client.kindground-b5587d45.eastus.azurecontainerapps.io"

TAG="${1:-$(git rev-parse --short HEAD)}"
SERVER_IMAGE="$DH_USER/studysphere-server:$TAG"
CLIENT_IMAGE="$DH_USER/studysphere-client:$TAG"

echo "==> building $TAG"
docker build --platform linux/amd64 -t "$SERVER_IMAGE" ./studysphere-server &
SERVER_BUILD_PID=$!

docker build --platform linux/amd64 \
  --build-arg NEXT_PUBLIC_BACKEND_URL="$SERVER_URL" \
  --build-arg NEXT_PUBLIC_FIREBASE_API_KEY="$NEXT_PUBLIC_FIREBASE_API_KEY" \
  --build-arg NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="$NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN" \
  --build-arg NEXT_PUBLIC_FIREBASE_PROJECT_ID="$NEXT_PUBLIC_FIREBASE_PROJECT_ID" \
  --build-arg NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="$NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET" \
  --build-arg NEXT_PUBLIC_FIREBASE_MESSAGING_SENDING_ID="$NEXT_PUBLIC_FIREBASE_MESSAGING_SENDING_ID" \
  --build-arg NEXT_PUBLIC_FIREBASE_APP_ID="$NEXT_PUBLIC_FIREBASE_APP_ID" \
  -t "$CLIENT_IMAGE" ./studysphere-client &
CLIENT_BUILD_PID=$!

wait $SERVER_BUILD_PID
wait $CLIENT_BUILD_PID

echo "==> pushing"
docker push "$SERVER_IMAGE" &
docker push "$CLIENT_IMAGE" &
wait

echo "==> updating server container app"
az containerapp update -n "$SERVER_APP" -g "$RG" \
  --image "$SERVER_IMAGE" \
  --set-env-vars \
    "MONGODB_URI=$MONGODB_URI" \
    "REDIS_URL=$REDIS_URL" \
    "FIREBASE_PROJECT_ID=$FIREBASE_PROJECT_ID" \
    "FIREBASE_CLIENT_EMAIL=$FIREBASE_CLIENT_EMAIL" \
    "FIREBASE_PRIVATE_KEY=$FIREBASE_PRIVATE_KEY" \
    "CLIENT_ORIGIN=$CLIENT_URL" \
    "GROQ_API_KEY=$GROQ_API_KEY" \
  >/dev/null

echo "==> updating client container app"
az containerapp update -n "$CLIENT_APP" -g "$RG" \
  --image "$CLIENT_IMAGE" \
  --set-env-vars \
    "FIREBASE_PROJECT_ID=$FIREBASE_PROJECT_ID" \
    "FIREBASE_CLIENT_EMAIL=$FIREBASE_CLIENT_EMAIL" \
    "FIREBASE_PRIVATE_KEY=$FIREBASE_PRIVATE_KEY" \
  >/dev/null

echo "==> deployed $TAG"
