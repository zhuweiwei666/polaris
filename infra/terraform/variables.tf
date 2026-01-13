variable "project_id" {
  type        = string
  description = "GCP project id"
}

variable "region" {
  type        = string
  description = "Region for Cloud Run/Cloud SQL/Redis/Artifact Registry"
  default     = "asia-east1"
}

variable "artifact_repo" {
  type        = string
  description = "Artifact Registry docker repo name"
  default     = "zhongtai"
}

variable "network" {
  type        = string
  description = "VPC network name"
  default     = "default"
}

variable "openrouter_api_key" {
  type        = string
  description = "OpenRouter API key (stored in Secret Manager)"
  sensitive   = true
  default     = ""
}

variable "a2e_api_key" {
  type        = string
  description = "A2E API key (optional; stored in Secret Manager)"
  sensitive   = true
  default     = ""
}

