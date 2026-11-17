terraform {
  required_version = ">= 1.6.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
  default_tags {
    tags = {
      Project     = var.project_name
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  }
}

# VPC module
module "vpc" {
  source             = "../../modules/vpc"
  vpc_cidr           = var.vpc_cidr
  environment        = var.environment
  project_name       = var.project_name
  availability_zones = var.availability_zones
}

# ECR module
module "ecr" {
  source       = "../../modules/ecr"
  environment  = var.environment
  project_name = var.project_name
}

# IAM module (needs ECR repo ARNs)
module "iam" {
  source              = "../../modules/iam"
  environment         = var.environment
  project_name        = var.project_name
  ecr_repository_arns = values(module.ecr.repository_arns)
}

# EC2 module (needs VPC data and IAM profile)
module "ec2" {
  source                        = "../../modules/ec2"
  environment                   = var.environment
  project_name                  = var.project_name
  vpc_id                        = module.vpc.vpc_id
  public_subnet_ids             = module.vpc.public_subnet_ids
  vpc_cidr                      = var.vpc_cidr
  jenkins_instance_type         = var.jenkins_instance_type
  k3s_instance_type             = var.k3s_instance_type
  ami_id                        = var.ami_id
  key_name                      = var.key_name
  allowed_cidr_blocks           = var.allowed_cidr_blocks
  jenkins_instance_profile_name = module.iam.jenkins_instance_profile_name
  k3s_instance_profile_name     = module.iam.k3s_instance_profile_name
}
