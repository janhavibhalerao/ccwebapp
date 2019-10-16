if [ $# -ne 7 ] 
then
        echo "Script required 7 parameters!" 
        echo "./csye6225-aws-cf-create-stack.sh <stackname> <awsregion> <vpccidr> <subnet1cidr> <subnet2cidr> <subnet3cidr> <vpcname>"
        exit 1
fi
stackname="$1";
awsRegion="$2";
vpcCIDR="$3";
subnetCidrBlock1="$4";
subnetCidrBlock2="$5";
subnetCidrBlock3="$6";
vpcName="$7";

availabilityZone1=a
availabilityZone2=b
availabilityZone3=c
echo "$stackName Stack creation in progress..."

stackID=$(aws cloudformation create-stack --stack-name $1 --template-body file://csye6225-cf-networking.json --parameters ParameterKey=AWSRegion,ParameterValue=$awsRegion ParameterKey=VPCCidrBlock,ParameterValue=$vpcCIDR ParameterKey=VPCName,ParameterValue=$vpcName ParameterKey=AvailabilityZone1,ParameterValue=$availabilityZone1 ParameterKey=AvailabilityZone2,ParameterValue=$availabilityZone2 ParameterKey=AvailabilityZone3,ParameterValue=$availabilityZone3  ParameterKey=PublicSubnetCidrBlock1,ParameterValue=$subnetCidrBlock1 ParameterKey=PublicSubnetCidrBlock2,ParameterValue=$subnetCidrBlock2 ParameterKey=PublicSubnetCidrBlock3,ParameterValue=$subnetCidrBlock3 --query [StackId] --output text)

if [ $? -eq "0" ]
then
echo "Stack Name: $1 created!"
echo "Stack ID: $stackID"
fi

aws cloudformation wait stack-create-complete --stack-name $stackID
if [ $? -ne "0" ]
then 
	echo "Stack Creation Failed!"
else
	echo "Stack Creation Successful!"
fi