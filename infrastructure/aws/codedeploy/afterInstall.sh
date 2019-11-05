#!/bin/bash
source /home/centos/.bash_profile
pwd
whoami
aws configure set default.region us-east-1
aws configure list
cd /home/centos/webapp/
pwd
npm install
npm install pm2 -g