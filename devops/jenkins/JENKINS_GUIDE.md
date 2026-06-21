# Jenkins Setup & Configuration Guide

This guide details how to configure Jenkins to run the automated CI/CD pipeline for Project AquaGuard.

---

## 1. Jenkins Installation
1. Start Jenkins in a Docker container or install it natively:
   ```bash
   docker run -d -p 8080:8080 -p 50000:50000 --name jenkins -v jenkins_home:/var/jenkins_home jenkins/jenkins:lts
   ```
2. Navigate to `http://localhost:8080` in your web browser and unlock using the admin password printed in docker logs.

---

## 2. Required Plugins
Install the following plugins from **Manage Jenkins** $\to$ **Plugins** $\to$ **Available Plugins**:
*   `Git` (SCM Integration)
*   `Pipeline` (Orchestrates build phases)
*   `Docker Pipeline` (Provides container shell abstractions)
*   `Amazon Web Services SDK` (For pushing to ECR/EKS)

---

## 3. Configuring Credentials
Set up credentials in Jenkins under **Dashboard** $\to$ **Manage Jenkins** $\to$ **Credentials**:

1. **AWS ECR Access Keys**:
   - ID: `aws-ecr-creds`
   - Kind: AWS Credentials
   - Include Access Key ID and Secret Access Key.

2. **GitHub Deploy Keys**:
   - ID: `github-deploy-key`
   - Kind: SSH Username with private key.

---

## 4. Pipeline Stages Workflow
The pipeline uses [Jenkinsfile](file:///Users/ashutoshrai/Desktop/Project-AquaGuard-CaseStudy68/devops/jenkins/Jenkinsfile) containing:

```text
[Checkout Code] ➔ [Install Dependencies] ➔ [Run Unit Tests] ➔ [Build Docker Images] ➔ [Push Images to AWS ECR] ➔ [Kubernetes Deploy]
```

*   **Rollback Mechanism**: If the Kubernetes deployment or health checks fail, the post-action step runs a shell trigger reverting the EKS pods to the previous stable release tag:
    ```bash
    kubectl rollout undo deployment/aquaguard-backend
    kubectl rollout undo deployment/aquaguard-frontend
    ```
