## Terraform Route-2 (GCP native)

This currently provisions:

- Required GCP services/APIs enabled at project level (idempotent)

Why so minimal?
- In this project we already created Cloud SQL / Redis / VPC connector / bucket / secrets manually.
- Keeping terraform minimal avoids conflicts (409 already-exists) and still lets `infra-apply` stay green and automated.

If you want terraform to manage all resources end-to-end, we can add auto-import (or migrate existing resources into state) as a later hardening step.

This folder is intended to be applied via GitHub Actions workflow `infra-apply`.

