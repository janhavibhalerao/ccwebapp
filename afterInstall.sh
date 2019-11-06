#!/bin/bash
pwd
whoami
aws configure set default.region us-east-1
aws configure list
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -a fetch-config -m ec2 -c file:/home/centos/cloudwatch-config.json -s
pwd
cd /home/centos/webapp
sudo npm install
sudo nohup npm start >> app.log 2>&1 &

#pm2 update
#pm2 start server.js
