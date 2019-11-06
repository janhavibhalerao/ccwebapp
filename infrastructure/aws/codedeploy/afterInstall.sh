#!/bin/bash
pwd
whoami
aws configure set default.region us-east-1
aws configure list
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -a fetch-config -m ec2 -c file:/home/centos/infrastructure/aws/codedeploy/cloudwatch-config.json -s

#sudo chown -R centos:centos /home/centos/webapp
#nohup node server.js > /dev/null 2>&1 &
pwd
#cd /home/centos/var
#cd /var
cd /home/centos
sudo mkdir -p var
sudo cp /var/.env /home/centos/var
sudo chmod 777 .env
cd /home/centos/webapp
sudo npm install
sudo npm run schema
npm install pm2 -g
#nohup node server.js >> app.log 2>&1 &

#pm2 update
pm2 start server.js
