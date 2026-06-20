output "eks_cluster_name" {
  value       = aws_eks_cluster.eks.name
  description = "Assigned Kubernetes cluster identity."
}

output "db_endpoint" {
  value       = aws_db_instance.postgres.endpoint
  description = "Connection endpoint string for RDS PostgreSQL database."
}
