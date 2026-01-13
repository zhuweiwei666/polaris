## Terraform Route-2 (GCP native)

This provisions:

- Cloud SQL Postgres (ENTERPRISE + db-custom-2-4096)
- Memorystore Redis (BASIC 1GB)
- Serverless VPC connector
- Secret Manager secrets + versions: `DATABASE_URL`, `REDIS_URL`, `OPENROUTER_API_KEY` (and optional `A2E_API_KEY`)
- GCS bucket `${project_id}-artifacts`
- Runtime Service Account `zhongtai-runtime` with `secretAccessor` + `cloudsql.client`

This folder is intended to be applied via GitHub Actions workflow `infra-apply`.

