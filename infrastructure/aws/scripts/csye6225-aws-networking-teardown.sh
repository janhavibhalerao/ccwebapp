#!/bin/bash
#====================================================
# Delete VPC using AWS-CLI
#====================================================
#
# Ask user for AWS region,VPC CIDR block,Subnet CIDR block,VPC name.


echo "Please Enter valid AWS Region"; read REGION;
echo "Please Enter valid VPC Name"; read VPCName;
echo "Please Enter valid VPC Name"; read Profile;
echo " "


#=============================================================
#Set the Required parameters
#=============================================================

AWS_Region=$REGION;
profile=$Profile;
#=============================================================
#Get VPC Name
#=============================================================
echo "Getting VPC Name "
echo "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~"

VPC_Name=$(aws ec2 describe-vpcs \
    --query "Vpcs[?Tags[?Key=='Name']|[?Value=='$VPCName']].Tag[0].Value" \
    --output text \
    --profile $profile)
echo $VPC_Name

#=============================================================
#Get VPC ID
#=============================================================
echo "Getting VPC ID "
echo "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~"

vpc_id=$(aws ec2 describe-vpcs \
    --query "Vpcs[*].{VpcId:VpcId}" \
    --filters Name=is-default,Values=false \
    --output text \
    --region $AWS_Region \
    --profile $profile)
echo $vpc_id

#=============================================================
#Get Internet-Gateway-ID
#=============================================================
echo "Getting Internet Gateway ID "
echo "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~"

InternetGateway_Id=$(aws ec2 describe-internet-gateways \
    --filters "Name=attachment.vpc-id,Values=$vpc_id" \
    --query "InternetGateways[*].{InternetGatewayId:InternetGatewayId}" \
    --output text \
    --profile $profile)
echo $InternetGateway_Id

#=============================================================
#Get Routing-Table-ID
#=============================================================
echo "Getting Routing Table ID "
echo "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~"

Route_Table_Id=$(aws ec2 describe-route-tables \
    --filters "Name=vpc-id,Values=$vpc_id" "Name=association.main, Values=false" \
    --query "RouteTables[*].{RouteTableId:RouteTableId}" \
    --output text \
    --profile $profile)
Route_Table_Id1=${Route_Table_Id}

echo "First Route_Table ID: $Route_Table_Id1"

#=============================================================
#Deassociating subnets from Routing Table
#=============================================================
echo "Deassociating subnets from Routing Table"
echo "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~"

aws ec2 describe-route-tables \
    --query 'RouteTables[*].Associations[].{RouteTableAssociationId:RouteTableAssociationId}' \
    --route-table-id $Route_Table_Id1 \
    --profile $profile
    --output text|while read var_Associate; do aws ec2 disassociate-route-table --association-id $var_Associate; done

echo "Deassociated subnets from Routing Table"


#=============================================================
#Delete subnets
#=============================================================
echo "Deleting subnets"
echo "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~"

while
subnet=$(aws ec2 describe-subnets \
    --filters "Name=vpc-id, Values=$vpc_id" \
    --query 'Subnets[*].SubnetId' \
    --output text \
    --profile $profile)
[[ ! -z $subnet ]]
do
    var_1=$(echo $subnet | cut -f1 -d" ")
    echo "$var_1 deleted"
    aws ec2 delete-subnet --subnet-id $var_1 --profile $profile
done
echo "Subnets deleted"

#=============================================================
#Detach Internet Gateway
#=============================================================
echo "Detach Internet Gateway"
echo "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~"
aws ec2 detach-internet-gateway \
    --internet-gateway-id $InternetGateway_Id \
    --vpc-id $vpc_id \
    --profile $profile

echo "Detached Internet Gateway"

#=============================================================
#Delete Internet Gateway
#=============================================================
echo "Deleting Internet Gateway"
echo "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~"
aws ec2 delete-internet-gateway \
    --internet-getway-id $InternetGateway_Id \
    --profile $profile
echo "Internet Gateway Deleted"


#=============================================================
#Retrive Route Table
#=============================================================
echo "Detach Route Table"
echo "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~"
main_route_table_id=$(aws ec2 describe-route-tables \
    --query "RouteTables[?VpcId=='$vpc_id']|[?Associations[?Main!=true]].RouteTableId" \
    --output text \
    --profile $profile)

echo "RouteTable Id = $main_route_table_id"

#=============================================================
#Delete Route Table
#=============================================================
echo "Deleting Route Table"
echo "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~"

for i in $Route_Table_Id
do
    if [[ $i != $main_route_table_id ]];
    then
        aws ec2 delete-route-table --route-table-id $i --profile $profile
    fi
done
echo "Deleted Route Table"

#=============================================================
#Delete VPC
#=============================================================
echo "Deleting VPC"
echo "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~"

aws ec2 delete-vpc --vpc-id $vpc_id --profile $profile
echo "Deleted VPC"

