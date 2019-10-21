provider "aws" {
  region  = "${var.aws_region}"
  version = "~> 2.31"
}

data "aws_availability_zones" "available" {
  state = "available"
}

data "aws_vpcs" "foo" {
  tags = "${map("Name", var.vpc_name)}"
}

output "foo" {
  value = "${data.aws_vpcs.foo.ids}"
}

resource "aws_security_group" "application" {
    name="application"
    description="security group for EC2 instance"
    vpc_id="vpc-0d4b15a82e2d771c9"

    ingress {
        to_port = 22
        from_port = 22
        protocol = "tcp"
        cidr_blocks = ["0.0.0.0/0"]
    }
    
    ingress {
        to_port = 80
        from_port = 80
        protocol = "tcp"
        cidr_blocks = ["0.0.0.0/0"]
    }

    ingress {
        to_port = 443
        from_port = 443
        protocol = "tcp"
        cidr_blocks = ["0.0.0.0/0"]
    }

    ingress {
        to_port = 3000
        from_port = 3000
        protocol = "tcp"
        cidr_blocks = ["0.0.0.0/0"]
    }

    tags = {
        Name = "application"
    }
}

resource "aws_security_group" "database" {
    name="database"
    description="security group for RDS instance"
#    vpc_id="${data.aws_vpcs.foo.ids}"
    vpc_id="vpc-0d4b15a82e2d771c9"

    ingress {
        to_port = 3306
        from_port = 3306
        protocol = "tcp"
        cidr_blocks = ["0.0.0.0/0"]
        security_groups = ["${aws_security_group.application.id}"]
    }
    
    ingress {
        to_port = 5432
        from_port = 5432
        protocol = "tcp"
        cidr_blocks = ["0.0.0.0/0"]
        security_groups = ["${aws_security_group.application.id}"]
    }

    tags = {
        Name = "database"
    }
}

resource "aws_kms_key" "mykey" {
  description = "This key is used to encrypt bucket objects"
  deletion_window_in_days = 10
}

resource "aws_s3_bucket" "s3_bucket" {
    bucket = "${var.AWS_S3_BUCKET_NAME}"
    force_destroy = true
    acl    = "private"
    
    server_side_encryption_configuration {
        rule {
            apply_server_side_encryption_by_default {
            kms_master_key_id = "${aws_kms_key.mykey.arn}"
            sse_algorithm     = "aws:kms"
            }   
        }
    }

    versioning {
        enabled = true
    }

    lifecycle_rule {
        id      = "archive"
        enabled = true
        prefix = "archive/"

        tags = {
            rule = "archive"
        }

        transition {
            days = 30
            storage_class = "STANDARD_IA"
        }

        expiration {
            days = 120
        }
    }
    tags = {
        Name = "aws_s3_bucket"
    }
}

resource "aws_s3_bucket_object" "lifecycle-archive" {
    bucket = "${aws_s3_bucket.s3_bucket.id}"
    acl    = "private"
    key    = "archive/"
    source  = "/dev/null"
}

resource "aws_db_instance" "db_instance"{
    engine = "mysql"
    engine_version = "5.7"
    apply_immediately = false
    allocated_storage = 20
    instance_class = "db.t2.medium"
    availability_zone = "${data.aws_availability_zones.available.names[0]}"
    multi_az = false
    identifier = "csye6225_fall2019"
    name= "csye6225"
    username = "dbuser"
    password = "${var.AWS_DB_PASSWORD}"
    publicly_accessible = true
    db_subnet_group_name=""

    security_group_names = [
        "${aws_db_security_group.database.id}"
    ]

    tags = {
        Name = "csye6225_fall2019"
    }
 }
 
resource "aws_instance" "web" {
    ami           = "${var.AMI_ID}"
    instance_type = "t2.micro"
    ebs_block_device {
        device_name = "/dev/sdg"
        volume_size = 20
        volume_type = "gp2"
        delete_on_termination = true
    }

    tags = {
        Name = "EC2_Instance"
    }
    vpc_security_group_ids = ["${aws_security_group.application.id}"]
    depends_on = [aws_db_instance.db_instance]
}

resource "aws_dynamodb_table" "csye6225" {
    name           = "csye6225"
    billing_mode   = "PROVISIONED"
    read_capacity  = 20
    write_capacity = 20
    hash_key       = "id"

    attribute {
        name = "id"
        type = "S"
    }

    ttl {
        attribute_name = "TimeToExist"
        enabled        = false
    }

    tags = {
        Name        = "dynamodb-csye6225"
    }
}

resource "random_string" "random" {
    length = 16
    special = true
}