variable "AMI_ID" {
    description = "Enter an AMI ID"
}

variable "aws_vpc_id" {}

variable "aws_subnet_group" {}

variable "ec2subnet1" {}

variable "ec2subnet2" {}

variable "ec2subnet3" {}

variable "AWS_S3_BUCKET_NAME" {
    description = "Enter a s3 bucket name for image. Example (webapp.your-domain-name.tld)"
    type = string
}

variable "AWS_CD_S3_BUCKET_NAME" {
    description = "Enter a code deploy s3 bucket name. Example (codedeploy.your-domain-name.tld)"
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

variable "database_username" {
    description = "Enter MYSQL User name"
    type = string
    default = "dbuser"
}

variable "cd_appName" {
    description = "Enter the app name for code deploy"
    type = string
    default = "csye6225-ec2"
}
