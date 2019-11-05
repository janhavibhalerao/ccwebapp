#!/bin/bash

#sudo systemctl stop tomcat.service

#sudo rm -rf /opt/tomcat/webapps/docs  /opt/tomcat/webapps/examples /opt/tomcat/webapps/host-manager  /opt/tomcat/webapps/manager /opt/tomcat/webapps/ROOT

#sudo chown tomcat:tomcat /opt/tomcat/webapps/ROOT.war

# cleanup log files
#sudo rm -rf /opt/tomcat/logs/catalina*
#sudo rm -rf /opt/tomcat/logs/*.log
#sudo rm -rf /opt/tomcat/logs/*.txt

pwd
whoami
aws configure set default.region us-east-1
aws configure list

sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -a fetch-config -m ec2 -c file:/home/centos/infrastructure/aws/codedeploy/cloudwatch-config.json -s

cd /home/centos/webapp/
sudo chown -R centos:centos /home/centos/webapp
nohup node server.js > /dev/null 2>&1 &
pwd
npm install -g pm2
pm2 update
npm install
#pm2 start server.js