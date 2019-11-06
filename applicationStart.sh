#!/bin/bash
pwd
whoami
cd /home/centos/webapp
if [ -d "logs" ] 
then
    echo "Directory /home/centos/webapp/logs exists." 
else
    sudo mkdir -p logs
    sudo touch logs/webapp.log
    sudo chmod 666 logs/webapp.log
fi
