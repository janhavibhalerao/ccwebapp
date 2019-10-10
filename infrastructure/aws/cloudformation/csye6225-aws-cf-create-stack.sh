echo "Enter the stack name to be created:"
read stackName
echo "Enter the AWS region:"
read awsRegion
echo "Enter the VPC CIDR:"
read vpcCIDR
echo "Enter the subnet CIDR 1:"
read subnetCidrBlock1
echo "Enter the subnet CIDR 2:"
read subnetCidrBlock2
echo "Enter the subnet CIDR 3:"
read subnetCidrBlock3
echo "Enter the VPC name:"
read vpcName
availabilityZone1=a
availabilityZone2=b
availabilityZone3=c
echo "$stackName Stack creation in progress..."

stackID=$(aws cloudformation create-stack --stack-name $stackName --template-body file://csye6225-cf-networking.json --parameters ParameterKey=AWSRegion,ParameterValue=$awsRegion ParameterKey=VPCCidrBlock,ParameterValue=$vpcCIDR ParameterKey=VPCName,ParameterValue=$vpcName ParameterKey=AvailabilityZone1,ParameterValue=$availabilityZone1 ParameterKey=AvailabilityZone2,ParameterValue=$availabilityZone2 ParameterKey=AvailabilityZone3,ParameterValue=$availabilityZone3  ParameterKey=PublicSubnetCidrBlock1,ParameterValue=$subnetCidrBlock1 ParameterKey=PublicSubnetCidrBlock2,ParameterValue=$subnetCidrBlock2 ParameterKey=PublicSubnetCidrBlock3,ParameterValue=$subnetCidrBlock3 --query [StackId] --output text)

echo "Stack Name: $stackName"
echo "Stack ID: $stackID"
aws cloudformation wait stack-create-complete --stack-name $stackID
if [ $? -ne "0" ]
then 
	echo "Stack Creation Failed!"
else
	echo "Stack Creation Successful!"
fi