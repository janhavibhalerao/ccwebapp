provider "aws" {
  region  = "${var.aws_region}"
  version = "~> 2.31"
}

module "circleci" {
  source = "../modules/circle-ci-policy"
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
    AWS_CD_S3_BUCKET_NAME = "${var.AWS_CD_S3_BUCKET_NAME}"
    AWS_DB_PASSWORD = "${var.AWS_DB_PASSWORD}"
    aws_vpc_id = "${module.networking.vpc_id}"
    AMI_ID = "${var.AMI_ID}"
    aws_subnet_group = "${module.networking.subnet_group}"
    ec2subnet1 = "${module.networking.subnet_id1}"
    ec2subnet2 = "${module.networking.subnet_id2}"
    ec2subnet3 = "${module.networking.subnet_id3}"
    ec2Key = "${var.ec2Key}"
    aws_region = "${var.aws_region}"
    database_username = "${var.database_username}"
    domainName = "${var.domainName}"
    AWS_LAMBDA_S3_BUCKET_NAME = "${var.AWS_LAMBDA_S3_BUCKET_NAME}"
}