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
variable "vpc_tenancy" {
  type = string
  default = "default"
}

variable "vpc_igw" {
  type = string
  default = "vpc-igw"
}

variable "subnet3_cidr" {
  description = "Enter a valid subnet cidr. Example (10.x.x.x/24) "
  type = string
}

variable "subnet2_cidr" {
  description = "Enter a valid subnet cidr. Example (10.x.x.x/24) "
  type = string
}

variable "subnet1_cidr" {
  description = "Enter a valid subnet cidr. Example (10.x.x.x/24) "
  type = string
}

variable "public_rt" {
  type = string
  default = "public-rt"
}

variable "AMI_ID" {
    description = "Enter an AMI ID"
    default = "ami-9887c6e7"
}

variable "AWS_S3_BUCKET_NAME" {
    description = "Enter a s3 bucket name. Example (webapp.your-domain-name.tld)"
    type = string
}

variable "AWS_DB_PASSWORD" {
    description = "Enter an master db password."
    type = string
}
