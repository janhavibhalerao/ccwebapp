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

// resource "aws_instance" "web" {
//     ami       = "${var.AMI_ID}"
//     subnet_id = "${var.ec2subnet1}"
//     instance_type = "t2.micro"
//     key_name = "${var.ec2Key}"
//     iam_instance_profile = "${aws_iam_instance_profile.cd_ec2_profile.name}"
//     ebs_block_device {
//         device_name = "/dev/sdg"
//         volume_size = 20
//         volume_type = "gp2"
//         delete_on_termination = true
//     }

// user_data = <<-EOF
// #!/bin/bash
// ####################################################
// # Configure Node ENV_Variables                     #
// ####################################################
// cd /home/centos
// mkdir var
// cd var
// echo 'NODE_DB_USER=${var.database_username}'>.env
// echo 'NODE_DB_PASS=${var.AWS_DB_PASSWORD}'>>.env
// echo 'NODE_DB_HOST=${aws_db_instance.db-instance.address}'>>.env
// echo 'NODE_S3_BUCKET=${var.AWS_S3_BUCKET_NAME}'>>.env
// chmod 777 .env
// EOF
    
//     tags = "${map("Name", "${var.cd_appName}")}"
//     vpc_security_group_ids = ["${aws_security_group.application.id}"]
//     depends_on = [aws_db_instance.db-instance]
// }


// AutoscalingGroup Configuration
resource "aws_launch_configuration" "asg-config" {
  name = "asg_launch_config"
  image_id="${var.AMI_ID}"
  instance_type="t2.micro"
  key_name="${var.ec2Key}"
  associate_public_ip_address = true
  ebs_block_device {
        device_name = "/dev/sdg"
        volume_size = 20
        volume_type = "gp2"
        delete_on_termination = true
    }
  user_data = <<-EOF
  #!/bin/bash
  ####################################################
  # Configure Node ENV_Variables                     #
  ####################################################
  cd /home/centos
  mkdir var
  cd var
  echo 'NODE_DB_USER=${var.database_username}'>.env
  echo 'NODE_DB_PASS=${var.AWS_DB_PASSWORD}'>>.env
  echo 'NODE_DB_HOST=${aws_db_instance.db-instance.address}'>>.env
  echo 'NODE_S3_BUCKET=${var.AWS_S3_BUCKET_NAME}'>>.env
  chmod 777 .env
  EOF
  iam_instance_profile = "${aws_iam_instance_profile.cd_ec2_profile.name}"
  security_groups= ["${aws_security_group.application.id}"]
  depends_on = [aws_db_instance.db-instance]

}

// AutoScaling Group
resource "aws_autoscaling_group" "web_server_group" {
  name                      = "WebServerGroup"
  max_size                  = 10
  min_size                  = 3
  default_cooldown          = 60
  desired_capacity          = 3
  launch_configuration      = "${aws_launch_configuration.asg-config.name}"
  vpc_zone_identifier       = ["${var.ec2subnet1}", "${var.ec2subnet2}", "${var.ec2subnet3}"]
  target_group_arns = ["${aws_lb_target_group.lb_tg_webapp.arn}", "${aws_lb_target_group.lb_tg_wafwebapp.arn}"]
  tags = [
    {
      key                 = "Name"
      value               = "${var.cd_appName}"
      propagate_at_launch = true
    }
  ]
}

// ASG Scaleup policy
resource "aws_autoscaling_policy" "web_server_scaleup_policy" {
  name                   = "WebServerScaleUpPolicy"
  scaling_adjustment     = 1
  adjustment_type        = "ChangeInCapacity"
  cooldown               = 60
  autoscaling_group_name = "${aws_autoscaling_group.web_server_group.name}"
}

// ASG Scaledown policy
resource "aws_autoscaling_policy" "web_server_scaledown_policy" {
  name                   = "WebServerScaleDownPolicy"
  scaling_adjustment     = -1
  adjustment_type        = "ChangeInCapacity"
  cooldown               = 60
  autoscaling_group_name = "${aws_autoscaling_group.web_server_group.name}"
}

// ASG CW Alarm for scaleup
resource "aws_cloudwatch_metric_alarm" "cw_alarm_high" {
  alarm_name                = "CPUAlarmHigh"
  comparison_operator       = "GreaterThanThreshold"
  evaluation_periods        = "1"
  metric_name               = "CPUUtilization"
  namespace                 = "AWS/EC2"
  period                    = "300"
  statistic                 = "Average"
  threshold                 = "5"
  dimensions = "${map("AutoScalingGroupName", "${aws_autoscaling_group.web_server_group.name}")}"
  alarm_description         = "Scale-up if CPU > 5% for 5 minutes"
  alarm_actions     = ["${aws_autoscaling_policy.web_server_scaleup_policy.arn}"]
}

// ASG CW Alarm for scaledown
resource "aws_cloudwatch_metric_alarm" "cw_alarm_low" {
  alarm_name                = "CPUAlarmLow"
  comparison_operator       = "LessThanThreshold"
  evaluation_periods        = "1"
  metric_name               = "CPUUtilization"
  namespace                 = "AWS/EC2"
  period                    = "300"
  statistic                 = "Average"
  threshold                 = "3"
  alarm_description         = "Scale-down if CPU < 3% for 5 minutes"
  dimensions = "${map("AutoScalingGroupName", "${aws_autoscaling_group.web_server_group.name}")}"
  alarm_actions     = ["${aws_autoscaling_policy.web_server_scaledown_policy.arn}"]
}

// Application Load Balancer
resource "aws_lb" "app_lb" {
  name = "appLoadBalancer"
  subnets = ["${var.ec2subnet1}", "${var.ec2subnet2}", "${var.ec2subnet3}"]
  security_groups = ["${aws_security_group.sg_loadbalancer.id}"]
  ip_address_type = "ipv4"
  tags = {
      Name = "appLoadBalancer"
    }
}

//Application without Firewall Load Balancer
resource "aws_lb" "waf_lb" {
  name = "wafLoadBalancer"
  subnets = ["${var.ec2subnet1}", "${var.ec2subnet2}", "${var.ec2subnet3}"]
  security_groups = ["${aws_security_group.sg_loadbalancer.id}"]
  ip_address_type = "ipv4"
  tags = {
      Name = "wafLoadBalancer"
    }
}

// LoadBalancer Security Group
resource "aws_security_group" "sg_loadbalancer" {
    name="LoadBalancer-Security-Group"
    description="Enable HTTPS via port 3000"
    vpc_id="${var.aws_vpc_id}"

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

    egress {
        to_port = 3000
        from_port = 3000
        protocol = "tcp"
        security_groups = ["${aws_security_group.application.id}"]
    }
    tags = {
        Name = "sg_loadbalancer"
    }
}

data "aws_acm_certificate" "certificate" {
  domain      = "${var.domainName}"
  types       = ["AMAZON_ISSUED"]
  most_recent = true
}

// LoadBalancer Listener
resource "aws_lb_listener" "alb_listener1" {
  load_balancer_arn = "${aws_lb.app_lb.arn}"
  port              = "443"
  protocol          = "HTTPS"
  certificate_arn   = "${data.aws_acm_certificate.certificate.arn}"

  default_action {
    type             = "forward"
    target_group_arn = "${aws_lb_target_group.lb_tg_webapp.arn}"
  }
}

// LoadBalancer WAF Listener
resource "aws_lb_listener" "alb_listener2" {
  load_balancer_arn = "${aws_lb.waf_lb.arn}"
  port              = "443"
  protocol          = "HTTPS"
  certificate_arn   = "${data.aws_acm_certificate.certificate.arn}"

  default_action {
    type             = "forward"
    target_group_arn = "${aws_lb_target_group.lb_tg_wafwebapp.arn}"
  }
}


// WebAppTargetGroup
resource "aws_lb_target_group" "lb_tg_webapp" {
  name     = "WebAppTargetGroup"
  health_check {
    interval = 10
    timeout = 5
    healthy_threshold = 2
    unhealthy_threshold = 2
    path = "/health"
  }  
  deregistration_delay = 20
  port     = 3000
  protocol = "HTTP"
  vpc_id   = "${var.aws_vpc_id}"
}

// WAF WebAppTargetGroup2
resource "aws_lb_target_group" "lb_tg_wafwebapp" {
  name     = "WAFWebAppTargetGroup"
  health_check {
    interval = 10
    timeout = 5
    healthy_threshold = 2
    unhealthy_threshold = 2
    path = "/health"
  }  
  deregistration_delay = 20
  port     = 3000
  protocol = "HTTP"
  vpc_id   = "${var.aws_vpc_id}"
}



// // Listener Certificate Additional1
// resource "aws_lb_listener_certificate" "cert1" {
//   listener_arn    = "${aws_lb_listener.alb_listener1.arn}"
//   certificate_arn = "${var.certificate2}"
// }

// // Listener Certificate Additional2
// resource "aws_lb_listener_certificate" "cert2" {
//   listener_arn    = "${aws_lb_listener.alb_listener2.arn}"
//   certificate_arn = "${var.certificate2}"
// }

data "aws_route53_zone" "primary" {
  name         = "${var.domainName}"
}

// DNS Record
resource "aws_route53_record" "dns_record" {
  zone_id = "${data.aws_route53_zone.primary.zone_id}"
  name    = "${var.domainName}"
  type    = "A"
  alias {
    name                   = "${aws_lb.app_lb.dns_name}"
    zone_id                = "${aws_lb.app_lb.zone_id}"
    evaluate_target_health = false
  }
}

// S3 bucket for images
resource "aws_s3_bucket" "s3_bucket" {
    bucket = "${var.AWS_S3_BUCKET_NAME}"
    force_destroy = true
    acl    = "private"
    
    server_side_encryption_configuration {
        rule {
            apply_server_side_encryption_by_default {
              sse_algorithm     = "AES256"
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

// S3 bucket for images restriction
resource "aws_s3_bucket_public_access_block" "s3_block" {
  bucket = "${aws_s3_bucket.s3_bucket.id}"
  block_public_acls   = true
  block_public_policy = true
  ignore_public_acls = true
  restrict_public_buckets = true

}

// S3 bucket for Code deploy
resource "aws_s3_bucket" "cd_s3_bucket" {
    bucket = "${var.AWS_CD_S3_BUCKET_NAME}"
    force_destroy = true
    acl    = "private"
    
    server_side_encryption_configuration {
        rule {
            apply_server_side_encryption_by_default {
              sse_algorithm     = "AES256"
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

// Code Deploy S3 bucket restrictions
resource "aws_s3_bucket_public_access_block" "cd_s3_block" {
  bucket = "${aws_s3_bucket.cd_s3_bucket.id}"
  block_public_acls   = true
  block_public_policy = true
  ignore_public_acls = true
  restrict_public_buckets = true
}

// S3 Bucket for Lambda
resource "aws_s3_bucket" "lambda_s3_bucket" {
    bucket = "${var.AWS_LAMBDA_S3_BUCKET_NAME}"
    force_destroy = true
    acl    = "private"
    
    server_side_encryption_configuration {
        rule {
            apply_server_side_encryption_by_default {
              sse_algorithm     = "AES256"
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
        Name = "aws_lmd_s3_bucket"
    }
}

// Restrictions for Lambda Bucket
resource "aws_s3_bucket_public_access_block" "lmd_s3_block" {
  bucket = "${aws_s3_bucket.lambda_s3_bucket.id}"
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
    read_capacity  = 10
    write_capacity = 5
    hash_key       = "id"

    attribute {
        name = "id"
        type = "S"
    }

    ttl {
      attribute_name = "TimeToExist"
      enabled = true
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
resource "aws_iam_role_policy_attachment" "ec2_SNS" {
	role = "${aws_iam_role.codedeploy_ec2_instance.name}"
	policy_arn = "arn:aws:iam::aws:policy/AmazonSNSFullAccess"
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
name = "CircleCI-Upload-To-S3"
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
                    "arn:aws:s3:::${var.AWS_CD_S3_BUCKET_NAME}/*",
                    "arn:aws:s3:::${var.AWS_LAMBDA_S3_BUCKET_NAME}/*"
                    ]
            
        }
        ]
    
}
EOF
   
}

data "aws_caller_identity" "current" {}

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
        "arn:aws:codedeploy:${var.aws_region}:${data.aws_caller_identity.current.account_id}:application:${var.code_deploy_application_name}"
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
        "arn:aws:codedeploy:${var.aws_region}:${data.aws_caller_identity.current.account_id}:deploymentconfig:CodeDeployDefault.OneAtATime",
        "arn:aws:codedeploy:${var.aws_region}:${data.aws_caller_identity.current.account_id}:deploymentconfig:CodeDeployDefault.HalfAtATime",
        "arn:aws:codedeploy:${var.aws_region}:${data.aws_caller_identity.current.account_id}:deploymentconfig:CodeDeployDefault.AllAtOnce"
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

resource "aws_codedeploy_app" "cd-webapp" {
  name             = "csye6225-webapp"
}

resource "aws_codedeploy_deployment_group" "cd-webapp-group" {
  app_name              = "${aws_codedeploy_app.cd-webapp.name}"
  deployment_group_name = "csye6225-webapp-deployment"
  service_role_arn      = "${aws_iam_role.codedeploy_service.arn}"
  deployment_config_name = "CodeDeployDefault.AllAtOnce"
  autoscaling_groups = ["${aws_autoscaling_group.web_server_group.name}"]
  deployment_style {
    deployment_option = "WITHOUT_TRAFFIC_CONTROL"
    deployment_type   = "IN_PLACE"
  }
  load_balancer_info {
    target_group_info {
      name = "${aws_lb_target_group.lb_tg_webapp.name}"
    }
  }
  ec2_tag_set {
    ec2_tag_filter {
      key   = "Name"
      type  = "KEY_AND_VALUE"
      value = "${var.cd_appName}"
    }
  }
  
  auto_rollback_configuration {
    enabled = true
    events  = ["DEPLOYMENT_FAILURE"]
  }

}

output "appLoadBalancer" {
  value = "${aws_lb.app_lb.arn}"
}

