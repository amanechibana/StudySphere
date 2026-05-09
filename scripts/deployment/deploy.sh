#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")/../.."

DH_USER="aouckamastevens"
RG="studysphere-rg"
SERVER_APP="studysphere-server"
CLIENT_APP="studysphere-client"
BACKEND_URL="https://studysphere-server.kindground-b5587d45.eastus.azurecontainerapps.io"

TAG="${1:-$(git rev-parse --short HEAD)}"
SERVER_IMAGE="$DH_USER/studysphere-server:$TAG"
CLIENT_IMAGE="$DH_USER/studysphere-client:$TAG"

set -a
source studysphere-client/.env
set +a

echo "==> building $TAG"
docker build -t "$SERVER_IMAGE" ./studysphere-server &
SERVER_BUILD_PID=$!

docker build \
  --build-arg NEXT_PUBLIC_BACKEND_URL="$BACKEND_URL" \
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

echo "==> updating container apps"
az containerapp update -n "$SERVER_APP" -g "$RG" --image "$SERVER_IMAGE" >/dev/null
az containerapp update -n "$CLIENT_APP" -g "$RG" --image "$CLIENT_IMAGE" >/dev/null

echo "==> deployed $TAG"
