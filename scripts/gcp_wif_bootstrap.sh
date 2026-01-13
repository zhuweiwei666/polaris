#!/usr/bin/env bash
set -euo pipefail

# One-time bootstrap for GitHub Actions -> GCP auth without long-lived keys.
#
# Requirements:
# - You run this in Cloud Shell (already logged into your GCP project as owner)
# - You know your GitHub repo: zhuweiwei666/polaris
#
# Result:
# - Creates a Workload Identity Pool + Provider
# - Binds your deployer service account to allow GitHub OIDC identities
# - Prints two values to set as GitHub repo secrets (non-sensitive):
#   - GCP_WIF_PROVIDER
#   - GCP_WIF_SERVICE_ACCOUNT

PROJECT_ID="${PROJECT_ID:-polaris-platform-484202}"
REGION="${REGION:-asia-east1}"
REPO="${REPO:-zhuweiwei666/polaris}"

POOL_ID="${POOL_ID:-polaris-gh-pool}"
PROVIDER_ID="${PROVIDER_ID:-polaris-gh-provider}"

# You can keep using github-deployer, or change to another SA.
SA_EMAIL="${SA_EMAIL:-github-deployer@${PROJECT_ID}.iam.gserviceaccount.com}"

gcloud config set project "${PROJECT_ID}" >/dev/null

PROJECT_NUMBER="$(gcloud projects describe "${PROJECT_ID}" --format='value(projectNumber)')"

gcloud services enable iamcredentials.googleapis.com iam.googleapis.com >/dev/null

echo "== Create Workload Identity Pool =="
gcloud iam workload-identity-pools create "${POOL_ID}" \
  --location="global" \
  --display-name="GitHub Actions Pool (${REPO})" >/dev/null 2>&1 || true

echo "== Create Workload Identity Provider =="
gcloud iam workload-identity-pools providers create-oidc "${PROVIDER_ID}" \
  --location="global" \
  --workload-identity-pool="${POOL_ID}" \
  --display-name="GitHub Actions Provider" \
  --issuer-uri="https://token.actions.githubusercontent.com" \
  --attribute-mapping="google.subject=assertion.sub,attribute.repository=assertion.repository,attribute.ref=assertion.ref" >/dev/null 2>&1 || true

WIF_PROVIDER="projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/${POOL_ID}/providers/${PROVIDER_ID}"

echo "== Bind Service Account to allow this repo =="
gcloud iam service-accounts add-iam-policy-binding "${SA_EMAIL}" \
  --role="roles/iam.workloadIdentityUser" \
  --member="principalSet://iam.googleapis.com/projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/${POOL_ID}/attribute.repository/${REPO}" >/dev/null

echo ""
echo "== Set these GitHub repo secrets (non-sensitive) =="
echo "GCP_WIF_PROVIDER=${WIF_PROVIDER}"
echo "GCP_WIF_SERVICE_ACCOUNT=${SA_EMAIL}"
echo ""
echo "Then you can remove GCP_SA_KEY entirely."

