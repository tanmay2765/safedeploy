variable "vpc_cidr" {
  description = "CIDR block for the VPC."
  type        = string
}

variable "environment" {
  description = "Deployment environment (e.g. dev, staging, prod)."
  type        = string
}

variable "project_name" {
  description = "Name of the project — used for resource naming and tagging."
  type        = string
}

variable "availability_zones" {
  description = "List of availability zones to use. Must have at least 2 entries."
  type        = list(string)

  validation {
    condition     = length(var.availability_zones) >= 2
    error_message = "At least 2 availability zones must be provided."
  }
}
