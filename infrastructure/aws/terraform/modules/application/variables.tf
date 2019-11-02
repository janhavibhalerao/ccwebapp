variable "AMI_ID" {
    description = "Enter an AMI ID"
}

variable "aws_vpc_id" {}

variable "aws_subnet_group" {}

variable "ec2subnet" {}

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

