variable "aws_region" {
  type        = string
  description = "The target AWS Deployment region."
  default     = "us-east-1"
}

variable "db_password" {
  type        = string
  description = "Administrator password for EKS PostgreSQL RDS DB."
  default     = "aquaguardsecurepassword123"
  sensitive   = true
}
