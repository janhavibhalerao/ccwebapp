data "aws_vpcs" "foo" {
  tags = {
    Name = "${var.vpc_name}"
  }
}

output "foo" {
  value = "${data.aws_vpcs.foo.ids}"
}

resource "aws_security_group" "application" {
    name="application"
    description="security group for EC2 instance"
    vpc_id="${data.aws_vpcs.foo.ids}"

    ingress {
        to_port = 22
        from_port = 22
        protocol = "tcp"
        cidr_block = "0.0.0.0/0"
    }
    
    ingress {
        to_port = 80
        from_port = 80
        protocol = "tcp"
        cidr_block = "0.0.0.0/0"
    }

    ingress {
        to_port = 443
        from_port = 443
        protocol = "tcp"
        cidr_block = "0.0.0.0/0"
    }

    ingress {
        to_port = 3000
        from_port = 3000
        protocol = "tcp"
        cidr_block = "0.0.0.0/0"
    }

    tags {
        Name = "application"
    }
}

resource "aws_db_security_group" "database" {
    name="database"
    description="security group for RDS instance"
    vpc_id="${data.aws_vpcs.foo.ids}"

    ingress {
        to_port = 3306
        from_port = 3306
        protocol = "tcp"
        cidr_block = "0.0.0.0/0"
        security_group_id = ["${aws_security_group.application.id}"]
    }
    
    ingress {
        to_port = 5432
        from_port = 5432
        protocol = "tcp"
        cidr_block = "0.0.0.0/0"
        security_group_id = ["${aws_security_group.application.id}"]
    }

    tags {
        Name = "database"
    }
}