
variable "environment" {
  description = "Deployment environment (e.g. dev, staging, prod)."
  type        = string
}

variable "project_name" {
  description = "Name of the project."
  type        = string
}

variable "vpc_id" {
  description = "ID of the VPC in which to place EC2 resources."
  type        = string
}

variable "public_subnet_ids" {
  description = "Public subnet IDs. Jenkins uses index 0; k3s uses index 1."
  type        = list(string)
}

variable "vpc_cidr" {
  description = "CIDR block of the VPC."
  type        = string
}

variable "jenkins_instance_type" {
  description = "EC2 instance type for Jenkins."
  type        = string
  default     = "t3.medium"
}

variable "k3s_instance_type" {
  description = "EC2 instance type for k3s."
  type        = string
  default     = "t3.large"
}

variable "jenkins_instance_profile_name" {
  description = "IAM instance profile for Jenkins."
  type        = string
}

variable "k3s_instance_profile_name" {
  description = "IAM instance profile for k3s."
  type        = string
}

variable "key_name" {
  description = "AWS EC2 key pair name."
  type        = string
}

variable "ami_id" {
  description = "AMI ID used by both EC2 instances."
  type        = string
}

variable "allowed_cidr_blocks" {
  description = "CIDR blocks permitted to reach management ports."
  type        = list(string)
  default     = ["0.0.0.0/0"]
}
