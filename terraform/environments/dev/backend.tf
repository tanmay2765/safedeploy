terraform {
  backend "s3" {
    bucket         = "safedeploy-terraform-state-dev"
    key            = "safedeploy/dev/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "safedeploy-terraform-locks"
    encrypt        = true
  }
}
