provider "aws" {
  region  = "${var.aws_region}"
  version = "~> 2.31"
}

module "networking" {
    source = "../modules/networking"
    vpc_cidr = "${var.vpc_cidr}"
    subnet1_cidr = "${var.subnet1_cidr}"
    subnet2_cidr = "${var.subnet2_cidr}"
    subnet3_cidr = "${var.subnet3_cidr}"
    vpc_name = "${var.vpc_name}"

}

module "application" {
    source = "../modules/application"
    AWS_S3_BUCKET_NAME = "${var.AWS_S3_BUCKET_NAME}"
    AWS_DB_PASSWORD = "${var.AWS_DB_PASSWORD}"
    aws_vpc_id = "${module.networking.vpc_id}"
    AMI_ID = "${var.AMI_ID}"
    aws_subnet_group = "${module.networking.subnet_group}"
    ec2subnet = "${module.networking.subnet_id}"
}