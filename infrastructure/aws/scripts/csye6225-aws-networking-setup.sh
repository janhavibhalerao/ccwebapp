#!/bin/bash
#====================================================
# create VPC using AWS-CLI
#====================================================
#
# Ask user for AWS region,VPC CIDR block,Subnet CIDR block,VPC name.
echo "Please Enter valid AWS Region"; read REGION;
echo "Please Enter valid VPC CIDR block"; read VPCcidr;
echo "Please Enter valid VPC Name"; read Profile;


#=============================================================
#Set the Required parameters
#=============================================================
Region="$REGION"
echo $Region
internet_Gateway_Name="csye6225-InternetGateway"
vpc_cidr="$VPCcidr"
echo $vpc_cidr
profile=$Profile
public_Route_Table_Name="csye6225-publicRouteTable"
zone1="us-east-1a"
zone2="us-east-1b"
zone3="us-east-1c"
public_subnet1_name="csye6225-PublicSubnet-1"
public_subnet2_name="csye6225-PublicSubnet-2"
public_subnet3_name="csye6225-PublicSubnet-3"
default_ip="0.0.0.0/0"
security_group="csye6225-SecurityGroup"


#=============================================================
#Create VPC 
#=============================================================

echo "Creating AWS EC2 VPC"
echo "========================================================"
echo "Please Enter valid VPC Name"; read VPCName;
vpcName="$VPCName"
echo " "

vpc_id=$(aws ec2 create-vpc --cidr-block $vpc_cidr --query 'Vpc.{VpcId:VpcId}' --output text --region $Region --profile $profile)

VPC_CREATE_STATUS=$?
echo ""

if [ $VPC_CREATE_STATUS -eq 0 ]; then
    echo "vpcID : $vpc_id created in '$Region' region."
else
    echo "vpc creation status : '$VPC_CREATE_STATUS', Error:VPC creation command failed!!"
    exit $VPC_CREATE_STATUS
fi

#=============================================================
# Renaming VPC (Name Tags)
#=============================================================

echo "VPC: Name Tag"
echo "========================================================"

vpcRename=$(aws ec2 create-tags --resources $vpc_id --tags "Key=Name,Value=$vpcName" --region us-east-1 --profile dev)

VPC_RENAME_STATUS=$?

if [ $VPC_RENAME_STATUS -eq 0 ]; then
    echo "vpcID : '$vpc_id' Tagged to '$vpcName'."
else
    echo "command status code : '$VPC_RENAME_STATUS', Error:VPC Name Tag command failed!!"
    exit $VPC_RENAME_STATUS
fi


#=======================================================================================
#Create Subnets (total 3)      Different Availability Zones || Same VPC || Same Region
#=======================================================================================

#~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Subnet 1 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

echo "Create Subnet 1       Different Availability Zones || Same VPC || Same Region"
echo "========================================================"
echo "Please Enter CIDR Block for Subnet 1 (x.x.x.x/x)"; read CIDR_Block1;

SUBNET_1_ID=$(aws ec2 create-subnet \
    --vpc-id $vpc_id \
    --cidr-block $CIDR_Block1 \
    --availability-zone $zone1 \
    --query 'Subnet.{SubnetId:SubnetId}' \
    --output text \
    --region $Region \
    --profile $profile)


SUBNET1_CREATE_STATUS=$?
echo ""

if [ $SUBNET1_CREATE_STATUS -eq 0 ]; then
    echo "Subnet ID : '$SUBNET_1_ID' created in '$zone1' Availability Zone."
else
    echo "Subnet Creation Status : '$SUBNET1_CREATE_STATUS', Error:Subnet creation command failed!!"
    exit $SUBNET1_CREATE_STATUS
fi


#=============================================================
# Renaming Subnet 1 (Name Tags)
#=============================================================
echo " "
echo "Subnet 1: Name Tag"
echo "========================================================"
SUBNET1_RENAME=$(aws ec2 create-tags \
    --resource $SUBNET_1_ID \
    --tags "Key=Name,Value="$public_subnet1_name 2>&1 \
    --profile $profile)

SUBNET1_RENAME_STATUS=$?

if [ $SUBNET1_RENAME_STATUS -eq 0 ]; then
    echo "Subnet 1 ID : '$SUBNET_1_ID' Tagged to '$public_subnet1_name'."
else
    echo "Subnet Rename Status : '$SUBNET1_RENAME_STATUS', Error:VPC Name Tag command failed!!"
    exit $SUBNET1_RENAME_STATUS
fi


#~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Subnet 2 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

echo "Create Subnet 2       Different Availability Zones || Same VPC || Same Region"
echo "========================================================"
echo "Please Enter CIDR Block for Subnet 2 (x.x.x.x/x)"; read CIDR_Block2;

SUBNET_2_ID=$(aws ec2 create-subnet \
    --vpc-id $vpc_id \
    --cidr-block $CIDR_Block2 \
    --availability-zone $zone2 \
    --query 'Subnet.{SubnetId:SubnetId}' \
    --output text \
    --region $Region \
    --profile $profile)


SUBNET2_CREATE_STATUS=$?
echo ""

if [ $SUBNET2_CREATE_STATUS -eq 0 ]; then
    echo "Subnet ID : '$SUBNET_2_ID' created in '$zone2' Availability Zone."
else
    echo "Subnet Creation Status : '$SUBNET2_CREATE_STATUS', Error:Subnet creation command failed!!"
    exit $SUBNET2_CREATE_STATUS
fi


#=============================================================
# Renaming Subnet 2 (Name Tags)
#=============================================================
echo " "
echo "Subnet 2: Name Tag"
echo "========================================================"
SUBNET2_RENAME=$(aws ec2 create-tags \
    --resource $SUBNET_2_ID \
    --tags "Key=Name,Value="$public_subnet2_name 2>&1 \
    --profile $profile)

SUBNET2_RENAME_STATUS=$?

if [ $SUBNET2_RENAME_STATUS -eq 0 ]; then
    echo "Subnet 1 ID : '$SUBNET_2_ID' Tagged to '$public_subnet2_name'."
else
    echo "Subnet Rename Status : '$SUBNET2_RENAME_STATUS', Error:VPC Name Tag command failed!!"
    exit $SUBNET2_RENAME_STATUS
fi

#~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Subnet 3 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

echo "Create Subnet 3       Different Availability Zones || Same VPC || Same Region"
echo "========================================================"
echo "Please Enter CIDR Block for Subnet 3 (x.x.x.x/x)"; read CIDR_Block3;

SUBNET_3_ID=$(aws ec2 create-subnet \
    --vpc-id $vpc_id \
    --cidr-block $CIDR_Block3 \
    --availability-zone $zone3 \
    --query 'Subnet.{SubnetId:SubnetId}' \
    --output text \
    --region $Region \
    --profile $profile)


SUBNET3_CREATE_STATUS=$?
echo ""

if [ $SUBNET3_CREATE_STATUS -eq 0 ]; then
    echo "Subnet ID : '$SUBNET_3_ID' created in '$zone3' Availability Zone."
else
    echo "Subnet Creation Status : '$SUBNET3_CREATE_STATUS', Error:Subnet creation command failed!!"
    exit $SUBNET3_CREATE_STATUS
fi


#=============================================================
# Renaming Subnet 3 (Name Tags)
#=============================================================
echo " "
echo "Subnet 3: Name Tag"
echo "========================================================"
SUBNET3_RENAME=$(aws ec2 create-tags \
    --resource $SUBNET_3_ID \
    --tags "Key=Name,Value="$public_subnet3_name 2>&1 \
    --profile $profile)

SUBNET3_RENAME_STATUS=$?

if [ $SUBNET3_RENAME_STATUS -eq 0 ]; then
    echo "Subnet 1 ID : '$SUBNET_3_ID' Tagged to '$public_subnet3_name'."
else
    echo "Subnet Rename Status : '$SUBNET3_RENAME_STATUS', Error:VPC Name Tag command failed!!"
    exit $SUBNET3_RENAME_STATUS
fi

#=============================================================
# Create Internet Gateway Resource
#=============================================================

echo " "
echo "Creating Internet Gateway Resource"
echo "========================================================"

Internet_Gateway_ID=$(aws ec2 create-internet-gateway \
    --query 'InternetGateway.{InternetGatewayId:InternetGatewayId'}\
    --output text \
    --region $Region 2>&1 \
    --profile $profile)
Internet_gateway_create_status=$?

if [ $Internet_gateway_create_status -eq 0 ]; then
    echo "Internet Gateway created with ID: '$Internet_Gateway_ID'"
else
    echo "InternetGateway creation Status : '$Internet_gateway_create_status', Error:Internet Gateway Creation Failed!!"
    exit $Internet_gateway_create_status
fi

#=============================================================
# Renaming Internet Gateway (Name Tags)
#=============================================================

echo " "
echo "Internet Gateway: Name Tag"
echo "========================================================"

Internet_gateway_rename=$(aws ec2 create-tags \
    --resources $Internet_Gateway_ID \
    --tags "Key=Name,Value=$internet_Gateway_Name" 2>&1 \
    --profile $profile)

Internet_Gateway_Rename_Status=$?

if [ $Internet_Gateway_Rename_Status -eq 0 ]; then
    echo "Internet Gateway ID: $Internet_Gateway_ID tagged to: '$Internet_gateway_rename'"
else
    echo "InternetGateway NameTag Status : '$Internet_Gateway_Rename_Status', Error:Internet Gateway Rename Command Failed!!"
    exit $Internet_Gateway_Rename_Status
fi

#=============================================================
# Attach Internet Gateway to VPC
#=============================================================

echo " "
echo "Attach Internet Gateway to VPC"
echo "========================================================"

Internet_Gateway_Attach=$(aws ec2 attach-internet-gateway \
    --vpc-id $vpc_id \
    --internet-gateway-id $Internet_Gateway_ID \
    --region $Region 2>&1 \
    --profile $profile)
Internet_Gateway_Attach_Status=$?

if [ $Internet_Gateway_Attach_Status -eq 0 ]; then
    echo "Internet Gateway ID: '$Internet_Gateway_ID' Attached to VPC_ID: '$vpc_id'"
else
    echo "InternetGateway Attach Status : '$Internet_Gateway_Attach_Status', Error:Internet Gateway Attach Command Failed!!"
    exit $Internet_Gateway_Attach_Status
fi

#=============================================================
# Create Public Route Table
#=============================================================
echo " "
echo "Creating Public Route Table"
echo "========================================================"

Route_Table_ID=$(aws ec2 create-route-table \
    --vpc-id $vpc_id \
    --query "RouteTable.{RouteTableId:RouteTableId}" \
    --output text \
    --region $Region 2>&1 \
    --profile $profile)

Route_Table_Create_Status=$?

if [ $Route_Table_Create_Status -eq 0 ]; then
    echo "Route Table ID: $Route_Table_ID created."
else
    echo "RouteTable Create Status : '$Route_Table_Create_Status', Error:Route Table Creation Command Failed!!"
    exit $Route_Table_Create_Status
fi

#=============================================================
# Renaming Public Route Table (Name Tags)
#=============================================================

echo " "
echo "Public Route Table: Name Tag"
echo "========================================================"

Route_Table_rename=$(aws ec2 create-tags \
    --resources $Route_Table_ID \
    --tags "Key=Name,Value=$public_Route_Table_Name" 2>&1 \
    --profile $profile)

Route_Table_Rename_Status=$?

if [ $Route_Table_Rename_Status -eq 0 ]; then
    echo "Route Table ID: $Route_Table_ID tagged to: '$public_Route_Table_Name'"
else
    echo "Route Table NameTag Status : '$Route_Table_Rename_Status', Error: Route Table Rename Command Failed!!"
    exit $Route_Table_Rename_Status
fi


#=========================================================================================================================================================
# Create a public route in the public route table created above with destination CIDR block 0.0.0.0/0 and internet gateway created above as the target.
#=========================================================================================================================================================

echo " "
echo "Create a public route in the public route table created above with destination CIDR block 0.0.0.0/0 and internet gateway created above as the target."
echo "========================================================================================================================================================"

Route_to_IG=$(aws ec2 create-route \
    --route-table-id $Route_Table_ID \
    --destination-cidr-block 0.0.0.0/0 \
    --gateway-id $Internet_Gateway_ID \
    --region $Region \
    --profile $profile)

Route_to_IG_status=$?

if [ $Route_to_IG_status -eq 0 ]; then
    echo "Route to 0.0.0.0./0 via InternetGateway ID: $Internet_Gateway_ID added to Route Table : $Route_Table_ID."
else
    echo "RouteToIG Create Status : '$Route_to_IG_status', Error:Route via Interner Gateway Command Failed!!"
    exit $Route_to_IG_status
fi

#=========================================================================================================================================================
# Attach Public Subnets to Route Table.
#=========================================================================================================================================================
echo " "
echo "Associate Route Table with Public Subnets"
echo " "

#~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Subnet 1 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
echo "Subnet 1"
echo "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~"
Associate_Subnet1=$(aws ec2 associate-route-table \
    --subnet-id $SUBNET_1_ID \
    --route-table-id $Route_Table_ID \
    --region $Region \
    --profile $profile)

Associate_Subnet1_status=$?

if [ $Associate_Subnet1_status -eq 0 ]; then
    echo "Subnet1 :$SUBNET_1_ID Associated with Route Table : $Route_Table_ID."
else
    echo "Associate Subnet1 Status : '$Associate_Subnet1_status', Error:Subnet1 to Route Table Association Command Failed!!"
    exit $Associate_Subnet1_status
fi


#~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Subnet 2 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
echo "Subnet 2"
echo "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~"
Associate_Subnet1=$(aws ec2 associate-route-table \
    --subnet-id $SUBNET_2_ID \
    --route-table-id $Route_Table_ID \
    --region $Region \
    --profile $profile)

Associate_Subnet2_status=$?

if [ $Associate_Subnet2_status -eq 0 ]; then
    echo "Subnet1 :$SUBNET_2_ID Associated with Route Table : $Route_Table_ID."
else
    echo "Associate Subnet1 Status : '$Associate_Subnet2_status', Error:Subnet1 to Route Table Association Command Failed!!"
    exit $Associate_Subnet2_status
fi


#~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Subnet 3 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
echo "Subnet 3"
echo "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~"
Associate_Subnet1=$(aws ec2 associate-route-table \
    --subnet-id $SUBNET_3_ID \
    --route-table-id $Route_Table_ID \
    --region $Region \
    --profile $profile)

Associate_Subnet3_status=$?

if [ $Associate_Subnet3_status -eq 0 ]; then
    echo "Subnet1 :$SUBNET_3_ID Associated with Route Table : $Route_Table_ID."
else
    echo "Associate Subnet1 Status : '$Associate_Subnet3_status', Error:Subnet1 to Route Table Association Command Failed!!"
    exit $Associate_Subnet3_status
fi

echo "Network setup Successfully!!!"