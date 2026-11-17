variable "aws_region" {
  description = "AWS region in which to deploy all resources."
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Deployment environment label applied to all resources."
  type        = string
  default     = "dev"
}

variable "project_name" {
  description = "Top-level project name used for naming and tagging."
  type        = string
  default     = "safedeploy"
}

variable "vpc_cidr" {
  description = "CIDR block for the VPC."
  type        = string
  default     = "10.0.0.0/16"
}

variable "availability_zones" {
  description = "Availability zones to spread subnets and resources across."
  type        = list(string)
  default     = ["us-east-1a", "us-east-1b"]
}

variable "jenkins_instance_type" {
  description = "EC2 instance type for the Jenkins server."
  type        = string
  default     = "t3.medium"
}

variable "k3s_instance_type" {
  description = "EC2 instance type for the k3s node."
  type        = string
  default     = "t3.large"
}

variable "ami_id" {
  description = "AMI ID for Ubuntu 22.04 LTS in us-east-1 (ami-0c7217cdde317cfec as of 2024-01)."
  type        = string
  default     = "ami-0c7217cdde317cfec"
}

variable "key_name" {
  description = "Name of the EC2 key pair for SSH access. Must already exist in AWS."
  type        = string
}

variable "allowed_cidr_blocks" {
  description = "CIDR blocks that may reach management ports. Restrict to your IP in production."
  type        = list(string)
  default     = ["0.0.0.0/0"]
}
