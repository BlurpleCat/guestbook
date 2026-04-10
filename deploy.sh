#!/usr/bin/env bash
set -euo pipefail

REGION="us-east-1"
REPO_NAME="guestbook"
CLUSTER_NAME="guestbook"
SERVICE_NAME="guestbook"

ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
ECR_URL="${ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com"
IMAGE_URI="${ECR_URL}/${REPO_NAME}"

echo "Building Docker image..."
docker build -t "${REPO_NAME}" .

echo "Authenticating with ECR..."
aws ecr get-login-password --region "${REGION}" | \
  docker login --username AWS --password-stdin "${ECR_URL}"

echo "Tagging and pushing image..."
docker tag "${REPO_NAME}:latest" "${IMAGE_URI}:latest"
docker push "${IMAGE_URI}:latest"

echo "Forcing new ECS deployment..."
aws ecs update-service \
  --cluster "${CLUSTER_NAME}" \
  --service "${SERVICE_NAME}" \
  --force-new-deployment \
  --region "${REGION}" \
  --no-cli-pager

echo "Deployment initiated."
