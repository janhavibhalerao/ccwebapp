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

variable "subnet_cidrs" {
  description = "Subnet CIDRs for public subnets (length must match configured availability_zones)"
  # this could be further simplified / computed using cidrsubnet() etc.
  # https://www.terraform.io/docs/configuration/interpolation.html#cidrsubnet-iprange-newbits-netnum-
  default = ["10.0.10.0/24", "10.0.20.0/24"]
  type = list(string)
}

variable "public_rt" {
  type = string
  default = "public-rt"
}
