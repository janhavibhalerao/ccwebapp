module "main_vpc" {
    source = "./modules/networking"
    aws_region = "${var.aws_region}"
    vpc_cidr = "${var.vpc_cidr}"
    subnet_cidr = "${var.subnet_cidr}"
    vpc_name = "${var.vpc_name}"

}