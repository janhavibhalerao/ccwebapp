#!/bin/bash
cd /home/centos/webapp
sudo npm install
sudo nohup npm start >> app.log 2>&1 &
echo "check2" >> .test
