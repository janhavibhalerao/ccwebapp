variable "aws_region" {
    description = "Enter AWS_Region. Example (us-east-1) "
    type = string
}

variable "vpc_name" {
  description = "Enter a valid vpc name "
  type = string
}
variable "vpc_cidr" {
  description = "Enter a valid vpc cidr. Example (10.x.x.x/16) "
  type = string
}

variable "subnet1_cidr" {
  description = "Enter a valid subnet cidr. Example (10.x.x.x/24) "
  type = string
}

variable "subnet2_cidr" {
  description = "Enter a valid subnet cidr. Example (10.x.x.x/24) "
  type = string
}

variable "subnet3_cidr" {
  description = "Enter a valid subnet cidr. Example (10.x.x.x/24) "
  type = string
}

variable "AMI_ID" {
    description = "Enter an AMI ID"
}

variable "AWS_S3_BUCKET_NAME" {
    description = "Enter a s3 bucket name. Example (webapp.your-domain-name.tld)"
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

variable "aws_account_id" {
    description = "Enter AWS_ACCOUNT_ID"
    type = string
}
variable "code_deploy_application_name" {
    description = "Enter CODE_DEPLOY_APPLICATION_NAME"
    type = string
    default = "csye6225-webapp"
}

variable "AWS_CD_S3_BUCKET_NAME" {
    description = "Enter a code deploy s3 bucket name. Example (codedeploy.your-domain-name.tld)"
    type = string
}

variable "database_username" {
    description = "Enter MYSQL User name"
    type = string
    default = "dbuser"
}
