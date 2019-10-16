### Pre-requisites:
* Install AWS CLI
* Set profile, config, credentials

### For creation:
* On terminal navigate to path :csye6225/dev/ccwebapps/infrastructure/aws/cloudformation
* Run chmod +x csye6225-aws-cf-create-stack.sh
* Run ./csye6225-aws-cf-create-stack.sh <stackname> <awsregion> <vpccidr> <subnet1cidr> <subnet2cidr> <subnet3cidr> <vpcname>

### For Termination:
* On terminal navigate to path :csye6225/dev/ccwebapps/infrastructure/aws/cloudformation
* Run chmod +x csye6225-aws-cf-terminate-stack.sh
* Run ./csye6225-aws-cf-terminate-stack.sh
