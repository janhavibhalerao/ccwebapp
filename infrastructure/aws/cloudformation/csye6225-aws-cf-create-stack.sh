echo "Enter the VPC name to be created:"
read vName

	vpcCidrBlock=10.0.0.0/16
	availabilityZone1=a
	availabilityZone2=b
	availabilityZone3=c
	subnetCidrBlock1=10.0.1.0/24
	subnetCidrBlock2=10.0.2.0/24
	subnetCidrBlock3=10.0.3.0/24
	vpcName=$vName

	echo "$vName Stack creation in progress..."

	stackID=$(aws cloudformation create-stack --stack-name $vName --template-body file://csye6225-cf-networking.json --parameters ParameterKey=VPCCidrBlock,ParameterValue=$vpcCidrBlock ParameterKey=AvailabilityZone1,ParameterValue=$availabilityZone1 ParameterKey=AvailabilityZone2,ParameterValue=$availabilityZone2 ParameterKey=AvailabilityZone3,ParameterValue=$availabilityZone3  ParameterKey=PublicSubnetCidrBlock1,ParameterValue=$subnetCidrBlock1 ParameterKey=PublicSubnetCidrBlock2,ParameterValue=$subnetCidrBlock2 ParameterKey=PublicSubnetCidrBlock3,ParameterValue=$subnetCidrBlock3 ParameterKey=VPCName,ParameterValue=$vpcName --query [StackId] --output text)
	aws cloudformation wait stack-create-complete --stack-name $stackID

	echo 'Stack ID: '$stackID

	if [ -z $stackID ]; then
		echo 'Error: Stack creation failed!'
		exit 1
	else
		echo "Stack Creation is successful!"
fi