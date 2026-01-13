locals {
  artifacts_bucket = "${var.project_id}-artifacts"

  cloudsql_instance_name = "zhongtai-pg"
  cloudsql_db_name       = "zhongtai"
  cloudsql_user          = "zhongtai"

  redis_instance_name = "zhongtai-redis"
  vpc_connector_name  = "zhongtai-conn"

  runtime_sa_id = "zhongtai-runtime"
}

resource "google_project_service" "services" {
  for_each = toset([
    "run.googleapis.com",
    "artifactregistry.googleapis.com",
    "sqladmin.googleapis.com",
    "redis.googleapis.com",
    "vpcaccess.googleapis.com",
    "secretmanager.googleapis.com"
  ])
  project            = var.project_id
  service            = each.value
  disable_on_destroy = false
}

# ---- Storage bucket (private) ----
resource "google_storage_bucket" "artifacts" {
  name                        = local.artifacts_bucket
  location                    = var.region
  uniform_bucket_level_access = true
  force_destroy               = false
  depends_on                  = [google_project_service.services]
}

# ---- Cloud SQL Postgres ----
resource "random_password" "pg_password" {
  length           = 24
  special          = true
  override_special = "_%@"
}

resource "google_sql_database_instance" "pg" {
  name             = local.cloudsql_instance_name
  database_version = "POSTGRES_16"
  region           = var.region

  # Use ENTERPRISE edition to allow custom tier.
  edition = "ENTERPRISE"

  settings {
    tier              = "db-custom-2-4096"
    availability_type = "ZONAL"

    backup_configuration {
      enabled = true
    }

    ip_configuration {
      # Cloud Run connects via Cloud SQL connector mount (unix socket); no public IP required.
      ipv4_enabled = false
    }
  }

  deletion_protection = false
  depends_on          = [google_project_service.services]
}

resource "google_sql_database" "db" {
  name     = local.cloudsql_db_name
  instance = google_sql_database_instance.pg.name
}

resource "google_sql_user" "user" {
  name     = local.cloudsql_user
  instance = google_sql_database_instance.pg.name
  password = random_password.pg_password.result
}

locals {
  database_url = "postgresql://${google_sql_user.user.name}:${random_password.pg_password.result}@localhost:5432/${google_sql_database.db.name}?schema=public&host=/cloudsql/${google_sql_database_instance.pg.connection_name}"
}

# ---- Serverless VPC connector (for Redis private IP) ----
resource "google_vpc_access_connector" "connector" {
  name   = local.vpc_connector_name
  region = var.region
  network = "projects/${var.project_id}/global/networks/${var.network}"
  ip_cidr_range = "10.8.0.0/28"
  depends_on = [google_project_service.services]
}

# ---- Memorystore Redis (private IP) ----
resource "google_redis_instance" "redis" {
  name           = local.redis_instance_name
  region         = var.region
  tier           = "BASIC"
  memory_size_gb = 1
  redis_version  = "REDIS_7_0"

  authorized_network = "projects/${var.project_id}/global/networks/${var.network}"

  depends_on = [google_project_service.services]
}

locals {
  redis_url = "redis://${google_redis_instance.redis.host}:6379"
}

# ---- Secret Manager ----
resource "google_secret_manager_secret" "database_url" {
  secret_id  = "DATABASE_URL"
  replication {
    auto {}
  }
  depends_on = [google_project_service.services]
}
resource "google_secret_manager_secret_version" "database_url_v" {
  secret      = google_secret_manager_secret.database_url.id
  secret_data = local.database_url
}

resource "google_secret_manager_secret" "redis_url" {
  secret_id  = "REDIS_URL"
  replication {
    auto {}
  }
  depends_on = [google_project_service.services]
}
resource "google_secret_manager_secret_version" "redis_url_v" {
  secret      = google_secret_manager_secret.redis_url.id
  secret_data = local.redis_url
}

resource "google_secret_manager_secret" "openrouter_api_key" {
  count      = var.openrouter_api_key == "" ? 0 : 1
  secret_id  = "OPENROUTER_API_KEY"
  replication {
    auto {}
  }
  depends_on = [google_project_service.services]
}
resource "google_secret_manager_secret_version" "openrouter_api_key_v" {
  count       = var.openrouter_api_key == "" ? 0 : 1
  secret      = google_secret_manager_secret.openrouter_api_key[0].id
  secret_data = var.openrouter_api_key
}

resource "google_secret_manager_secret" "a2e_api_key" {
  count      = var.a2e_api_key == "" ? 0 : 1
  secret_id  = "A2E_API_KEY"
  replication {
    auto {}
  }
  depends_on = [google_project_service.services]
}
resource "google_secret_manager_secret_version" "a2e_api_key_v" {
  count       = var.a2e_api_key == "" ? 0 : 1
  secret      = google_secret_manager_secret.a2e_api_key[0].id
  secret_data = var.a2e_api_key
}

# ---- Runtime service account (Cloud Run uses this identity) ----
resource "google_service_account" "runtime" {
  account_id   = local.runtime_sa_id
  display_name = "Zhongtai Cloud Run runtime"
}

resource "google_project_iam_member" "runtime_secret_accessor" {
  project = var.project_id
  role    = "roles/secretmanager.secretAccessor"
  member  = "serviceAccount:${google_service_account.runtime.email}"
}

resource "google_project_iam_member" "runtime_cloudsql_client" {
  project = var.project_id
  role    = "roles/cloudsql.client"
  member  = "serviceAccount:${google_service_account.runtime.email}"
}

