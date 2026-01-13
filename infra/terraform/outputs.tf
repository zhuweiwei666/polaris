output "region" {
  value = var.region
}

output "artifacts_bucket" {
  value = google_storage_bucket.artifacts.name
}

output "cloudsql_connection_name" {
  value = google_sql_database_instance.pg.connection_name
}

output "redis_host" {
  value = google_redis_instance.redis.host
}

output "runtime_service_account_email" {
  value = google_service_account.runtime.email
}

output "database_url_secret" {
  value = google_secret_manager_secret.database_url.secret_id
}

output "redis_url_secret" {
  value = google_secret_manager_secret.redis_url.secret_id
}

