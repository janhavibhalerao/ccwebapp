#!/bin/bash
pwd
whoami
aws configure set default.region us-east-1
aws configure list
chmod -R 755 /home/centos/webapp
cd /home/centos/webapp/
pwd
npm install
npm install pm2 -g