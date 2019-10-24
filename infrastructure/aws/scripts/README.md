Configure the AWS CLI first.
create profiles eg. DEV/PROD.

To create the VPC :
-->open terminal 
-->go to respective directory 
--> bash csye6225-aws-networking-setup.sh <region> <profile> <VPCName> <vpccidr> <subnet1cidr> <subnet2cidr> <subnet3cidr>

To Delete the VPC:
-->open terminal 
-->go to respective directory 
--> bash csye6225-aws-networking-teardown-setup.sh <region> <profile> <VPCName>