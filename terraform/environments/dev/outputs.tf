output "jenkins_public_ip" {
  description = "Public IP address of the Jenkins EC2 instance"
  value       = module.ec2.jenkins_public_ip
}

output "jenkins_instance_id" {
  description = "Jenkins EC2 instance ID"
  value       = module.ec2.jenkins_instance_id
}

output "k3s_public_ip" {
  description = "Public IP address of the k3s EC2 instance"
  value       = module.ec2.k3s_public_ip
}

output "k3s_instance_id" {
  description = "k3s EC2 instance ID"
  value       = module.ec2.k3s_instance_id
}

output "jenkins_security_group_id" {
  description = "Security group ID for the Jenkins instance"
  value       = module.ec2.jenkins_security_group_id
}

output "k3s_security_group_id" {
  description = "Security group ID for the k3s instance"
  value       = module.ec2.k3s_security_group_id
}

output "ecr_repository_urls" {
  description = "Map of ECR repository names to URLs"
  value       = module.ecr.repository_urls
}

output "vpc_id" {
  description = "VPC ID"
  value       = module.vpc.vpc_id
}
