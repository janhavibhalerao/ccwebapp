variable "aws_region" {
    description = "Enter AWS_Region. Example (us-east-1) "
    type = string
}

variable "AMI_ID" {
    description = "Enter an AMI ID"
    default = "ami-9887c6e7"
}

variable "vpc_name" {
    description = "Enter a valid vpc name "
    type = string
}

variable "AWS_S3_BUCKET_NAME" {
    description = "Enter a s3 bucket name. Example (webapp.your-domain-name.tld)"
    type = string
}

variable "AWS_DB_PASSWORD" {
    description = "Enter an master db password."
    type = string
}

