variable "aws_region" {
    type = string
}

variable "vpc_name" {
  type = string
}
variable "vpc_cidr" {
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
  type = string
}

variable "subnet2_cidr" {
  type = string
}

variable "subnet1_cidr" {
  type = string
}

variable "public_rt" {
  type = string
  default = "public-rt"
}
