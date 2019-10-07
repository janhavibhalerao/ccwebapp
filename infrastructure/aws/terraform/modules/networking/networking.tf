provider "aws" {
  region  = "${var.aws_region}"
  version = "~> 2.31"
}

 resource "aws_vpc" "main" {
  cidr_block       = "${var.vpc_cidr}"
  instance_tenancy = "${var.vpc_tenancy}"
  tags = "${map("Name", var.vpc_name)}"
  
}
  

data "aws_availability_zones" "available" {
  state = "available"
}

resource "aws_subnet" "subnet1" {
  vpc_id     = "${aws_vpc.main.id}"
  cidr_block = "${var.subnet_cidr[0]}"
  availability_zone = "${data.aws_availability_zones.available.names[0]}"
  tags = {
    Name = "Subnet1"
  }
}

resource "aws_subnet" "subnet2" {
  vpc_id     = "${aws_vpc.main.id}"
  cidr_block = "${var.subnet_cidr[1]}"
  availability_zone = "${data.aws_availability_zones.available.names[1]}"
  tags = {
    Name = "Subnet2"
  }
}

resource "aws_subnet" "subnet3" {
  vpc_id     = "${aws_vpc.main.id}"
  cidr_block = "${var.subnet_cidr[2]}"
  availability_zone = "${data.aws_availability_zones.available.names[2]}"
  tags = {
    Name = "Subnet3"
  }
}

output "vpc_id" {
  value = "${aws_vpc.main.id}"
}
