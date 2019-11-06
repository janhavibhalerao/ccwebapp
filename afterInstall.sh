#!/bin/bash
pwd
whoami
aws configure set default.region us-east-1
aws configure list
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -a fetch-config -m ec2 -c file:/home/centos/cloudwatch-config.json -s

#sudo chown -R centos:centos /home/centos/webapp
#nohup node server.js > /dev/null 2>&1 &
pwd
cd /home/centos/var
sudo chmod 777 .env
cd ..
pwd
sudo chown -R centos:centos /home/centos/webapp
cd /home/centos/webapp
npm install
nohup npm start >> app.log 2>&1 &

#pm2 update
#pm2 start server.js
