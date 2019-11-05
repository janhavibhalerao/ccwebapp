# Get Started with Terraform -
Install Terraform from command line using the command (this is for linux_amd64 bit OS. Find the url from https://www.terraform.io/downloads.html for your OS )
wget https://releases.hashicorp.com/terraform/0.12.9/terraform_0.12.9_linux_amd64.zip

Before you develop the infrastructure, make sure to setup 
1. AWS CLI
2. Setup AWS CLI profiles
3. Set your current session profile using AWS_Profile

# Instructions for creating networking module using Terraform
1. The networking resources are present in modules --> networking --> networking.tf
2. So Navigate to CCWEBAPP --> infrastructure --> aws --> terraform --> env1
3. Execute terraform init to initialize the provider plugins
4. Execute terraform apply and then pass the required parameters to create the required resources
5. Execute terraform destroy and then pass the required parameters to destroy the required resources.
   (Execute the below command --> terraform destroy -var)
6. Alternatively you can use the file test.tfvars to pass parameters to steps 4 and 5 using                 terraform apply -var-file "relative/path/to/file" or terraform destroy -var-file "relative/   path/to/   file"
7. To create another vpc, with same configuration, navigate to env2 and follow the above steps

#Required Parameters to create the Infrastructure
aws_region
vpc_name
vpc_cidr
subnet3_cidr
subnet2_cidr
subnet1_cidr
AMI_ID
AWS_S3_BUCKET_NAME
AWS_DB_PASSWORD
  
