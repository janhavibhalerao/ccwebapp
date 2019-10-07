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

variable "subnet_cidr" {
  type = list(string)
}
