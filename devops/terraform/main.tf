provider "aws" {
  region = var.aws_region
}

# VPC Configuration
resource "aws_vpc" "aquaguard_vpc" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "aquaguard-vpc"
  }
}

# Subnets Configuration
resource "aws_subnet" "public_1" {
  vpc_id            = aws_vpc.aquaguard_vpc.id
  cidr_block        = "10.0.1.0/24"
  availability_zone = "us-east-1a"
  map_public_ip_on_launch = true

  tags = {
    Name = "aquaguard-public-1"
  }
}

resource "aws_subnet" "public_2" {
  vpc_id            = aws_vpc.aquaguard_vpc.id
  cidr_block        = "10.0.2.0/24"
  availability_zone = "us-east-1b"
  map_public_ip_on_launch = true

  tags = {
    Name = "aquaguard-public-2"
  }
}

resource "aws_subnet" "private_1" {
  vpc_id            = aws_vpc.aquaguard_vpc.id
  cidr_block        = "10.0.3.0/24"
  availability_zone = "us-east-1a"

  tags = {
    Name = "aquaguard-private-1"
  }
}

resource "aws_subnet" "private_2" {
  vpc_id            = aws_vpc.aquaguard_vpc.id
  cidr_block        = "10.0.4.0/24"
  availability_zone = "us-east-1b"

  tags = {
    Name = "aquaguard-private-2"
  }
}

# Internet Gateway & NAT
resource "aws_internet_gateway" "gw" {
  vpc_id = aws_vpc.aquaguard_vpc.id

  tags = {
    Name = "aquaguard-igw"
  }
}

# AWS RDS PostgreSQL Instantiation
resource "aws_db_instance" "postgres" {
  allocated_storage      = 20
  engine                 = "postgres"
  engine_version         = "15.4"
  instance_class         = "db.t3.micro"
  db_name                = "aquaguard"
  username               = "postgres"
  password               = var.db_password
  parameter_group_name   = "default.postgres15"
  skip_final_snapshot    = true
  vpc_security_group_ids = [aws_security_group.db_sg.id]
  db_subnet_group_name   = aws_db_subnet_group.rds_subnet_group.name

  tags = {
    Name = "aquaguard-postgres"
  }
}

resource "aws_db_subnet_group" "rds_subnet_group" {
  name       = "aquaguard-rds-subnet-group"
  subnet_ids = [aws_subnet.private_1.id, aws_subnet.private_2.id]
}

# Database Security Group
resource "aws_security_group" "db_sg" {
  name        = "aquaguard-db-security-group"
  description = "Allow DB traffic from EKS worker nodes only"
  vpc_id      = aws_vpc.aquaguard_vpc.id

  ingress {
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/16"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# Amazon EKS Cluster Configuration (Placeholder setup)
resource "aws_eks_cluster" "eks" {
  name     = "aquaguard-prod-eks"
  role_arn = aws_iam_role.eks_role.arn

  vpc_config {
    subnet_ids = [aws_subnet.private_1.id, aws_subnet.private_2.id, aws_subnet.public_1.id, aws_subnet.public_2.id]
  }

  depends_on = [
    aws_iam_role_policy_attachment.eks_AmazonEKSClusterPolicy
  ]
}

# IAM Role Setup for EKS
resource "aws_iam_role" "eks_role" {
  name = "aquaguard-eks-cluster-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "eks.amazonaws.com"
      }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "eks_AmazonEKSClusterPolicy" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSClusterPolicy"
  role       = aws_iam_role.eks_role.name
}
