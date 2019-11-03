data "aws_availability_zones" "available" {
  state = "available"
}

resource "aws_security_group" "application" {
    name="application"
    description="security group for EC2 instance"
    vpc_id="${var.aws_vpc_id}"

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

    egress {
      from_port   = 0
      to_port     = 0
      protocol    = "-1"
      cidr_blocks = ["0.0.0.0/0"]
    }

    tags = {
        Name = "application"
    }
}

resource "aws_security_group" "database" {
    name="database"
    description="security group for RDS instance"
    vpc_id="${var.aws_vpc_id}"

    ingress {
        to_port = 3306
        from_port = 3306
        protocol = "tcp"
        security_groups = ["${aws_security_group.application.id}"]
    }
    tags = {
        Name = "database"
    }
}

resource "aws_key_pair" "terraform_ec2_key" {
  key_name = "terraform_ec2_key"
  public_key = "${var.ec2Key}"
}

resource "aws_instance" "web" {
    ami       = "${var.AMI_ID}"
    subnet_id = "${var.ec2subnet}"
    instance_type = "t2.micro"
    key_name = "terraform_ec2_key"
    iam_instance_profile = "${aws_iam_instance_profile.cd_ec2_profile.name}"
    ebs_block_device {
        device_name = "/dev/sdg"
        volume_size = 20
        volume_type = "gp2"
        delete_on_termination = true
    }

user_data = <<EOF
#!/bin/bash
####################################################
# Configure Node ENV_Variables                     #
####################################################
sudo mkdir -p webapp/var/
cd /webapp/var
sudo sh -c 'echo NODE_DB_USER=${var.database_username}>.env'
sudo sh -c 'echo NODE_DB_PASS=${var.AWS_DB_PASSWORD}>>.env'
sudo sh -c 'echo NODE_DB_HOST=${aws_db_instance.db-instance.address}>>.env'
sudo sh -c 'echo NODE_S3_BUCKET="${var.AWS_S3_BUCKET_NAME}>>.env'
EOF

  tags = {
        Name = "csye6225-ec2"
    }
    vpc_security_group_ids = ["${aws_security_group.application.id}"]
    depends_on = [aws_db_instance.db-instance]
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

     lifecycle_rule {
        enabled = true
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

resource "aws_s3_bucket_public_access_block" "s3_block" {
  bucket = "${aws_s3_bucket.s3_bucket.id}"
  block_public_acls   = true
  block_public_policy = true
  ignore_public_acls = true
  restrict_public_buckets = true

}

resource "aws_s3_bucket" "cd_s3_bucket" {
    bucket = "${var.AWS_CD_S3_BUCKET_NAME}"
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

     lifecycle_rule {
        id = "cleanup" 
        enabled = true
        expiration {
            days = 60
        }
    }
    tags = {
        Name = "aws_cd_s3_bucket"
    }
}

resource "aws_s3_bucket_public_access_block" "cd_s3_block" {
  bucket = "${aws_s3_bucket.cd_s3_bucket.id}"
  block_public_acls   = true
  block_public_policy = true
  ignore_public_acls = true
  restrict_public_buckets = true
}


resource "aws_db_instance" "db-instance" {
    engine = "mysql"
    engine_version = "5.7"
    apply_immediately = false
    allocated_storage = 20
    instance_class = "db.t2.medium"
    availability_zone = "${data.aws_availability_zones.available.names[0]}"
    multi_az = false
    identifier = "csye6225-fall2019"
    name= "csye6225"
    username = "dbuser"
    password = "${var.AWS_DB_PASSWORD}"
    publicly_accessible = true
    skip_final_snapshot = true
    db_subnet_group_name="${var.aws_subnet_group}"
    vpc_security_group_ids = ["${aws_security_group.database.id}"]
    tags = {
        Name = "csye6225-fall2019"
    }

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

    tags = {
        Name        = "dynamodb-csye6225"
        Environment = "production"
    }
}

# Creating IAM Role for code_deploy EC2
resource "aws_iam_role" "codedeploy_ec2_instance" {
  name = "CodeDeployEC2ServiceRole"
  description = "Role for ec2"

  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": "ec2.amazonaws.com"
      },
      "Effect": "Allow",
      "Sid": ""
    }
  ]
}
EOF

  tags = {
    Name = "CodeDeployEC2ServiceRole"
  }
}

#Adding IAM Policies for EC2 to access S3
resource "aws_iam_policy" "cd_ec2_policy" {
  name = "CodeDeploy-EC2-S3"
  description = "Policy which allows ec2 role to access S3"
  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": [
        "s3:Get*",
        "s3:List*"
      ],
      "Effect": "Allow",
      "Resource": [
        "arn:aws:s3:::${var.AWS_CD_S3_BUCKET_NAME}/*"
      ]
    }
  ]
}
EOF
}

#Adding IAM Policies for EC2 to access S3
resource "aws_iam_policy" "iam_S3_access" {
  name = "Attachments-Access-To-S3-Bucket"
  description = "Policy for uploading attachments into S3"
  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": [
       "s3:Get*",
       "s3:List*",
       "s3:Delete*",
       "s3:Put*",
       "s3:*"
      ],
      "Effect": "Allow",
      "Resource": [
        "arn:aws:s3:::*"
      ]
    }
  ]
}
EOF
}


// EC2 S3 Policy
resource "aws_iam_role_policy_attachment" "ec2-s3-attach" {
  role       = "${aws_iam_role.codedeploy_ec2_instance.name}"
  policy_arn = "${aws_iam_policy.cd_ec2_policy.arn}"
}

// EC2 role attachments S3 Policy
resource "aws_iam_role_policy_attachment" "ec2-s3-all" {
  role       = "${aws_iam_role.codedeploy_ec2_instance.name}"
  policy_arn = "${aws_iam_policy.iam_S3_access.arn}"
}


// EC2 role attachments S3 Policy
resource "aws_iam_role_policy_attachment" "ec2-rds-acccess" {
  role       = "${aws_iam_role.codedeploy_ec2_instance.name}"
  policy_arn = "arn:aws:iam::aws:policy/AmazonRDSReadOnlyAccess"
}



// Cloud Watch Agent Policy
resource "aws_iam_role_policy_attachment" "ec2-cloudwatch-attach" {
  role       = "${aws_iam_role.codedeploy_ec2_instance.name}"
  policy_arn = "arn:aws:iam::aws:policy/CloudWatchAgentServerPolicy"
}

# Attaching IAM Role to EC2 Instance
resource "aws_iam_instance_profile" "cd_ec2_profile" {
  name = "CodeDeployEC2Profile"
  role = "${aws_iam_role.codedeploy_ec2_instance.name}"
}

# create a service role for codedeploy
resource "aws_iam_role" "codedeploy_service" {
  name = "CodeDeployServiceRole"
  description = "Role for code deploy"
  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "",
      "Effect": "Allow",
      "Principal": {
        "Service": [
          "codedeploy.amazonaws.com"
        ]
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF
tags = {
    Name = "CodeDeployServiceRole"
  }
}

# attach AWS managed policy called AWSCodeDeployRole
# required for deployments which are to an EC2 compute platform
resource "aws_iam_role_policy_attachment" "codedeploy_service" {
  role       = "${aws_iam_role.codedeploy_service.name}"
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSCodeDeployRole"
}

resource "aws_iam_policy" "CircleCI-Upload-To-S3_policy" {
  name        = "CircleCI-Upload-To-S3"
  description = "Policy allows CircleCI to upload artifacts from latest successful build to dedicated S3 bucket used by code deploy."

  policy = <<EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:PutObject"
            ],
             "Resource": [
        "arn:aws:s3:::${var.AWS_CD_S3_BUCKET_NAME}/*"
      ]
        }
    ]
}
EOF
}

resource "aws_iam_user_policy_attachment" "CircleCI-Upload-To-S3-attach" {
  user       = "${var.CircleCIUser}"
  policy_arn = "${aws_iam_policy.CircleCI-Upload-To-S3_policy.arn}"
}

resource "aws_iam_policy" "CircleCI-Code-Deploy_policy" {
  name        = "CircleCI-Code-Deploy"
  description = "Policy allows CircleCI to call CodeDeploy APIs to initiate application deployment on EC2 instances."

  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "codedeploy:RegisterApplicationRevision",
        "codedeploy:GetApplicationRevision"
      ],
      "Resource": [
        "arn:aws:codedeploy:${var.aws_region}:${var.aws_account_id}:application:${var.code_deploy_application_name}"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "codedeploy:CreateDeployment",
        "codedeploy:GetDeployment"
      ],
      "Resource": [
        "*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "codedeploy:GetDeploymentConfig"
      ],
      "Resource": [
        "arn:aws:codedeploy:${var.aws_region}:${var.aws_account_id}:deploymentconfig:CodeDeployDefault.OneAtATime",
        "arn:aws:codedeploy:${var.aws_region}:${var.aws_account_id}:deploymentconfig:CodeDeployDefault.HalfAtATime",
        "arn:aws:codedeploy:${var.aws_region}:${var.aws_account_id}:deploymentconfig:CodeDeployDefault.AllAtOnce"
      ]
    }
  ]
}
EOF
}

resource "aws_iam_user_policy_attachment" "CircleCI-Code-Deploy-attach" {
  user       = "${var.CircleCIUser}"
  policy_arn = "${aws_iam_policy.CircleCI-Code-Deploy_policy.arn}"
}

resource "aws_iam_policy" "circleci-ec2-ami_policy" {
  name        = "circleci-ec2-ami"
  description = "Policy which allows circleci user to access ec2"

  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [{
      "Effect": "Allow",
      "Action" : [
        "ec2:AttachVolume",
        "ec2:AuthorizeSecurityGroupIngress",
        "ec2:CopyImage",
        "ec2:CreateImage",
        "ec2:CreateKeypair",
        "ec2:CreateSecurityGroup",
        "ec2:CreateSnapshot",
        "ec2:CreateTags",
        "ec2:CreateVolume",
        "ec2:DeleteKeyPair",
        "ec2:DeleteSecurityGroup",
        "ec2:DeleteSnapshot",
        "ec2:DeleteVolume",
        "ec2:DeregisterImage",
        "ec2:DescribeImageAttribute",
        "ec2:DescribeImages",
        "ec2:DescribeInstances",
        "ec2:DescribeInstanceStatus",
        "ec2:DescribeRegions",
        "ec2:DescribeSecurityGroups",
        "ec2:DescribeSnapshots",
        "ec2:DescribeSubnets",
        "ec2:DescribeTags",
        "ec2:DescribeVolumes",
        "ec2:DetachVolume",
        "ec2:GetPasswordData",
        "ec2:ModifyImageAttribute",
        "ec2:ModifyInstanceAttribute",
        "ec2:ModifySnapshotAttribute",
        "ec2:RegisterImage",
        "ec2:RunInstances",
        "ec2:StopInstances",
        "ec2:TerminateInstances"
      ],
      "Resource" : "*"
  }]
}
EOF
}

resource "aws_iam_user_policy_attachment" "circleci-ec2-ami-attach" {
  user       = "${var.CircleCIUser}"
  policy_arn = "${aws_iam_policy.circleci-ec2-ami_policy.arn}"
}

resource "aws_codedeploy_app" "code_deploy_application" {  
    compute_platform = "Server"  
    name = "csye6225-webapp"
}

resource "aws_codedeploy_deployment_group" "cd_deployment_group" {  
    app_name  = "${aws_codedeploy_app.code_deploy_application.name}"  
    deployment_group_name = "csye6225-webapp-deployment"  
    service_role_arn = "${aws_iam_role.codedeploy_service.arn}"
     
    ec2_tag_filter {      
        key   = "Name"      
        type  = "KEY_AND_VALUE"      
        value = "csye6225-ec2"    
    }  

    deployment_config_name = "CodeDeployDefault.AllAtOnce"
    deployment_style {    
        deployment_type   = "IN_PLACE"  
    }

    auto_rollback_configuration {    
      enabled = true    
      events  = ["DEPLOYMENT_FAILURE"]  
    }
}