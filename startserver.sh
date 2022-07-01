#!/bin/bash
pm2 save
sleep(10)

pm2 start fetch.py --time
sleep(60)

#give docker some time to start

pm2 start app.js --time --watch

pm2 start csvexport.js --time --watch
