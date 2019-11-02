variable "AMI_ID" {
    description = "Enter an AMI ID"
}

variable "aws_vpc_id" {}

variable "aws_subnet_group" {}

variable "ec2subnet" {}

variable "AWS_S3_BUCKET_NAME" {
    description = "Enter a s3 bucket name for image. Example (webapp.your-domain-name.tld)"
    type = string
}

variable "AWS_DB_PASSWORD" {
    description = "Enter an master db password."
    type = string
}

variable "ec2Key" {
    description = "EC2 key pair"
    type = string
}

variable "CircleCIUser" {
    description = "Enter a CircleCIUser"
    type = string
    default = "circleci"
}
variable "aws_region" {
    description = "Enter AWS_REGION. Example (us-east-1) "
    type = string
    default = "us-east-1"
}
variable "aws_account_id" {
    description = "Enter AWS_ACCOUNT_ID"
    type = string
}
variable "code_deploy_application_name" {
    description = "Enter CODE_DEPLOY_APPLICATION_NAME"
    type = string
    default = "csye6225-webapp"
}
variable "code_deploy_bucket" {
    description = "Enter CODE_DEPLOY_BUCKET"
    type = string
    default = "codedeploy.janhavibhalerao.me"
}


