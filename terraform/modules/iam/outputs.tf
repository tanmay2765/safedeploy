
output "jenkins_instance_profile_name" {
  description = "Jenkins EC2 instance profile name."
  value       = aws_iam_instance_profile.jenkins_profile.name
}

output "k3s_instance_profile_name" {
  description = "k3s EC2 instance profile name."
  value       = aws_iam_instance_profile.k3s_profile.name
}

output "jenkins_role_arn" {
  description = "Jenkins IAM role ARN."
  value       = aws_iam_role.jenkins_role.arn
}

output "k3s_role_arn" {
  description = "k3s IAM role ARN."
  value       = aws_iam_role.k3s_role.arn
}
