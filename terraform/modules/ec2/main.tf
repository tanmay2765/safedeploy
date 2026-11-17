resource "aws_security_group" "jenkins_sg" {
  name   = "${var.project_name}-${var.environment}-jenkins-sg"
  vpc_id = var.vpc_id

  ingress {
    description = "Jenkins UI"
    from_port   = 8080
    to_port     = 8080
    protocol    = "tcp"
    cidr_blocks = var.allowed_cidr_blocks
  }
  ingress {
    description = "Jenkins JNLP Agent"
    from_port   = 50000
    to_port     = 50000
    protocol    = "tcp"
    cidr_blocks = var.allowed_cidr_blocks
  }
  ingress {
    description = "SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = var.allowed_cidr_blocks
  }
  egress {
    description = "All outbound"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  tags = {
    Project     = var.project_name
    Environment = var.environment
    Name        = "${var.project_name}-${var.environment}-jenkins-sg"
  }
}

resource "aws_security_group" "k3s_sg" {
  name   = "${var.project_name}-${var.environment}-k3s-sg"
  vpc_id = var.vpc_id

  ingress {
    description = "k3s API server"
    from_port   = 6443
    to_port     = 6443
    protocol    = "tcp"
    cidr_blocks = var.allowed_cidr_blocks
  }
  ingress {
    description = "HTTP ingress"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  ingress {
    description = "HTTPS ingress"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  ingress {
    description = "SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = var.allowed_cidr_blocks
  }
  ingress {
    description = "kubelet from VPC"
    from_port   = 10250
    to_port     = 10250
    protocol    = "tcp"
    cidr_blocks = [var.vpc_cidr]
  }
  egress {
    description = "All outbound"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  tags = {
    Project     = var.project_name
    Environment = var.environment
    Name        = "${var.project_name}-${var.environment}-k3s-sg"
  }
}

resource "aws_instance" "jenkins" { # nosemgrep: terraform.aws.security.aws-ec2-has-public-ip.aws-ec2-has-public-ip
  ami                    = var.ami_id
  instance_type          = var.jenkins_instance_type
  subnet_id              = element(var.public_subnet_ids, 0)
  vpc_security_group_ids = [aws_security_group.jenkins_sg.id]
  iam_instance_profile = var.jenkins_instance_profile_name
  key_name               = var.key_name
  associate_public_ip_address = true
  user_data = <<-EOF
    #!/bin/bash
    set -e
    apt-get update -y
    apt-get install -y docker.io openjdk-17-jdk
    systemctl enable docker
    systemctl start docker
    usermod -aG docker ubuntu
  EOF

  tags = {
    Project     = var.project_name
    Environment = var.environment
    Name        = "${var.project_name}-${var.environment}-jenkins"
  }
  metadata_options {
  http_tokens = "required"
}

root_block_device {
  volume_size           = 30
  volume_type           = "gp3"
  encrypted             = true
  delete_on_termination = true
}
}

resource "aws_instance" "k3s" { # nosemgrep: terraform.aws.security.aws-ec2-has-public-ip.aws-ec2-has-public-ip
  ami                    = var.ami_id
  instance_type          = var.k3s_instance_type
  subnet_id              = element(var.public_subnet_ids, 1)
  vpc_security_group_ids = [aws_security_group.k3s_sg.id]
  iam_instance_profile = var.k3s_instance_profile_name
  key_name               = var.key_name
  associate_public_ip_address = true 
    #!/bin/bash
    set -e
    apt-get update -y
    apt-get install -y curl docker.io
    systemctl enable docker
    systemctl start docker
    curl -sfL https://get.k3s.io | INSTALL_K3S_EXEC="--write-kubeconfig-mode 644 --disable traefik" sh -
  EOF

  tags = {
    Project     = var.project_name
    Environment = var.environment
    Name        = "${var.project_name}-${var.environment}-k3s"
  }
  metadata_options {
  http_tokens = "required"
}

root_block_device {
  volume_size           = 30
  volume_type           = "gp3"
  encrypted             = true
  delete_on_termination = true
}
}

resource "aws_eip" "jenkins_eip" {
  domain = "vpc"
  tags = {
    Name        = "${var.project_name}-${var.environment}-jenkins-eip"
    Project     = var.project_name
    Environment = var.environment
  }
}

resource "aws_eip" "k3s_eip" {
  domain = "vpc"
  tags = {
    Name        = "${var.project_name}-${var.environment}-k3s-eip"
    Project     = var.project_name
    Environment = var.environment
  }
}

resource "aws_eip_association" "jenkins_eip_assoc" {
  instance_id   = aws_instance.jenkins.id
  allocation_id = aws_eip.jenkins_eip.id
}

resource "aws_eip_association" "k3s_eip_assoc" {
  instance_id   = aws_instance.k3s.id
  allocation_id = aws_eip.k3s_eip.id
}
