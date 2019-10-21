variable "vpc_name" {
    description = "Enter a valid vpc name "
    type = string
}

variable "AWS_S3_BUCKET_NAME" {
    description = "Enter a s3 bucket name. Example (webapp.your-domain-name.tld)"
    type = string
}

variable "AWS_Availability_Zone" {
    description = "Enter an availability zone. Example (us-east-1a)"
    type = string
}

variable "AWS_DB_PASSWORD" {
    description = "Enter an master db password."
    type = string
}

