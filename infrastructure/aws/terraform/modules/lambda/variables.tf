variable "AWS_LAMBDA_S3_BUCKET_NAME" {
    description = "Enter Lambda S3 Bucket Name"
    type = string
}
variable "LAMBDA_FUNCTION_NAME" {
    description = "Enter Lambda Function name"
    type = string
    default= "getMyRecipes"
}