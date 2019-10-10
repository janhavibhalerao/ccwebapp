module "main_vpc" {
    source = "./modules/networking"
    aws_region = "${var.aws_region}"
    vpc_cidr = "${var.vpc_cidr}"
    subnet1_cidr = "${var.subnet1_cidr}"
    subnet2_cidr = "${var.subnet2_cidr}"
    subnet3_cidr = "${var.subnet3_cidr}"
    vpc_name = "${var.vpc_name}"

}