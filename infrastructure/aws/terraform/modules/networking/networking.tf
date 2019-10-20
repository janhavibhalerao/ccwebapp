provider "aws" {
  region  = "${var.aws_region}"
  version = "~> 2.31"
}

resource "aws_vpc" "main" {
  cidr_block       = "${var.vpc_cidr}"
  instance_tenancy = "${var.vpc_tenancy}"
  enable_dns_hostnames = "${var.vpc_dns}"
  tags = "${map("Name", var.vpc_name)}"
  
}
  

data "aws_availability_zones" "available" {
  state = "available"
}

resource "aws_subnet" "subnet1" {
  vpc_id = "${aws_vpc.main.id}"
  cidr_block = "${var.subnet1_cidr}"
  availability_zone = "${data.aws_availability_zones.available.names[0]}"
  tags = "${map("Name", "subnet1-${var.vpc_name}")}"
}

resource "aws_subnet" "subnet2" {
  vpc_id = "${aws_vpc.main.id}"
  cidr_block = "${var.subnet2_cidr}"
  availability_zone = "${data.aws_availability_zones.available.names[1]}"
  tags = "${map("Name", "subnet2-${var.vpc_name}")}"
}

resource "aws_subnet" "subnet3" {
  vpc_id = "${aws_vpc.main.id}"
  cidr_block = "${var.subnet3_cidr}"
  availability_zone = "${data.aws_availability_zones.available.names[2]}"
  tags = "${map("Name", "subnet3-${var.vpc_name}")}"
}

resource "aws_internet_gateway" "vpc-igw" {
  vpc_id = "${aws_vpc.main.id}"
  tags = "${map("Name", "${var.vpc_igw}-${var.vpc_name}")}"
}

resource "aws_route_table" "public-rt" {
  vpc_id = "${aws_vpc.main.id}"

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = "${aws_internet_gateway.vpc-igw.id}"
  }
  tags = "${map("Name", "${var.public_rt}-${var.vpc_name}")}"
}

resource "aws_route_table_association" "rtasc1" {
  subnet_id      = "${aws_subnet.subnet1.id}"
  route_table_id = "${aws_route_table.public-rt.id}"
  
}

resource "aws_route_table_association" "rtasc2" {
  subnet_id      = "${aws_subnet.subnet2.id}"
  route_table_id = "${aws_route_table.public-rt.id}"
}

resource "aws_route_table_association" "rtasc3" {
  subnet_id      = "${aws_subnet.subnet3.id}"
  route_table_id = "${aws_route_table.public-rt.id}"
}
