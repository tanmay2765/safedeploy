output "jenkins_public_ip" {
  description = "Public IP address of the Jenkins EC2 instance"
  value       = aws_eip.jenkins_eip.public_ip
}

output "jenkins_instance_id" {
  description = "ID of the Jenkins EC2 instance"
  value       = aws_instance.jenkins.id
}

output "k3s_public_ip" {
  description = "Public IP address of the k3s EC2 instance"
  value       = aws_eip.k3s_eip.public_ip
}

output "k3s_instance_id" {
  description = "ID of the k3s EC2 instance"
  value       = aws_instance.k3s.id
}

output "jenkins_security_group_id" {
  description = "Security group ID for the Jenkins instance"
  value       = aws_security_group.jenkins_sg.id
}

output "k3s_security_group_id" {
  description = "Security group ID for the k3s instance"
  value       = aws_security_group.k3s_sg.id
}
