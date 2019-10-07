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

resource "aws_subnet" "public" {
  count = "${length(var.subnet_cidrs)}"
  vpc_id = "${aws_vpc.main.id}"
  cidr_block = "${var.subnet_cidrs[count.index]}"
  availability_zone = "${data.aws_availability_zones.available.names[count.index]}"
  tags = "${map("Name", "subnet-${count.index}")}"
}

resource "aws_internet_gateway" "vpc-igw" {
  vpc_id = "${aws_vpc.main.id}"
  tags = "${map("Name", var.vpc_igw)}"
}

resource "aws_route_table" "public-rt" {
  vpc_id = "${aws_vpc.main.id}"

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = "${aws_internet_gateway.vpc-igw.id}"
  }
  tags = "${map("Name", var.public_rt)}"
}

resource "aws_route_table_association" "public" {
  count = "${length(var.subnet_cidrs)}"
  subnet_id      = "${element(aws_subnet.public.*.id, count.index)}"
  route_table_id = "${aws_route_table.public-rt.id}"
}

output "vpc_id" {
  value = "${aws_vpc.main.id}"
}
