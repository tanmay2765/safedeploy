variable "environment" {
  description = "Deployment environment (e.g. dev, staging, prod)."
  type        = string
}

variable "project_name" {
  description = "Name of the project — used for resource naming and tagging."
  type        = string
}

variable "ecr_repository_arns" {
  description = "List of ECR repository ARNs that the EC2 instance role is allowed to interact with."
  type        = list(string)
}
