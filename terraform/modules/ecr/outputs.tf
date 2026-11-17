output "repository_urls" {
  description = "Map of repository name to its URL"
  value = {
    for name, repo in aws_ecr_repository.repositories :
    name => repo.repository_url
  }
}

output "repository_arns" {
  description = "Map of repository name to its ARN"
  value = {
    for name, repo in aws_ecr_repository.repositories :
    name => repo.arn
  }
}

output "registry_id" {
  description = "ECR registry ID"
  value = aws_ecr_repository.repositories["safedeploy-backend"].registry_id
}
