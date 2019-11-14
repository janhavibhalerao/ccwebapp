resource "aws_iam_role" "lambda_sns_execution_role" {
  name = "lambda-sns-execution-role"
  description = "Role for lambda sns execution"
  assume_role_policy = <<EOF
{
    "Version" : "2012-10-17",
    "Statement" : [
			{
				"Action" : "sts:AssumeRole",
				"Principal" : {
					"Service" : "lambda.amazonaws.com"
				},
				"Effect" : "Allow"
			}
		]
  }
  EOF
}

resource "aws_iam_policy"  "lambda_log_policy" {
  name = "lambda_log_policy"
  description = "Policy for Updating Lambda logs to CloudWatch"
  policy = <<EOF
{
    "Version":"2012-10-17",
    "Statement":[
      {
        "Action":[
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ],
        "Effect":"Allow",
        "Resource":"arn:aws:logs:*:*:*"
      }
    ]
  }
  EOF
}

resource "aws_iam_role_policy_attachment" "lambda_dynamo" {
	role = "${aws_iam_role.lambda_sns_execution_role.name}"
	policy_arn = "arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess"
}

resource "aws_iam_role_policy_attachment" "lambda_route53" {
	role = "${aws_iam_role.lambda_sns_execution_role.name}"
	policy_arn = "arn:aws:iam::aws:policy/AmazonRoute53FullAccess"
}

resource "aws_iam_role_policy_attachment" "lambda_SNS" {
	role = "${aws_iam_role.lambda_sns_execution_role.name}"
	policy_arn = "arn:aws:iam::aws:policy/AmazonSNSFullAccess"
}

resource "aws_iam_role_policy_attachment" "lambda_SES" {
	role = "${aws_iam_role.lambda_sns_execution_role.name}"
	policy_arn = "arn:aws:iam::aws:policy/AmazonSESFullAccess"
}

resource "aws_iam_role_policy_attachment" "lambda_S3" {
	role = "${aws_iam_role.lambda_sns_execution_role.name}"
	policy_arn = "arn:aws:iam::aws:policy/AmazonS3FullAccess"
}

resource "aws_iam_role_policy_attachment" "lambda_cloudwatchlogs" {
	role = "${aws_iam_role.lambda_sns_execution_role.name}"
	policy_arn = "${aws_iam_policy.lambda_log_policy.arn}"
}

resource "aws_iam_role_policy_attachment" "lambda_basicExecutionRole" {
  role = "${aws_iam_role.lambda_sns_execution_role.name}"
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role_policy_attachment" "lambda_DynamoDBExecutionRole" {
  role = "${aws_iam_role.lambda_sns_execution_role.name}"
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaDynamoDBExecutionRole"
}

resource "aws_sns_topic" "email_request" {
	name = "my_recipes"
}

resource "aws_sns_topic_subscription" "email_request_sns" {
	topic_arn = "${aws_sns_topic.email_request.arn}"
	protocol = "lambda"
	endpoint = "${aws_lambda_function.send_email.arn}"
}

resource "aws_lambda_permission" "lambda_invoke_permission" {
  action        = "lambda:InvokeFunction"
	function_name = "${aws_lambda_function.send_email.function_name}"
	principal = "sns.amazonaws.com"
	source_arn = "${aws_sns_topic.email_request.arn}"

}

resource "aws_lambda_function" "send_email" {
  s3_bucket = "${var.AWS_LAMBDA_S3_BUCKET_NAME}"
  s3_key = ""
	function_name = "sendEmail"
	role = "${aws_iam_role.lambda_sns_execution_role.arn}"
  handler = "index.handler"
  runtime = "nodejs8.10"
	memory_size = 512
	timeout = 25
}
