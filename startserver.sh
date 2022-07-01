#!/bin/bash
echo "Starting Server"
pm2 save
sleep 10

echo "Starting Eduroam CSV generator"
pm2 start fetch.py --time --interpreter python3

echo "Waiting some time until docker starts"
sleep 60

#give docker some time to start
echo "Starting Server main script"
pm2 start app.js --time

echo "Starting CSV generator"
pm2 start csvexport.js --time

pm2 delete startserver.sh
