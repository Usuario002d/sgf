#!/bin/bash

cd /opt/sebadora/sgf-web/

# Make dir if not exists:
mkdir -p /opt/sebadora/logs

PORT=3000
echo "🔍 Finding PIDs using port $PORT..."

# Find PIDs
PIDS=$(lsof -ti tcp:$PORT)

if [ -z "$PIDS" ]; then
  echo " ✅   No processes found using port $PORT."
else
  echo "💀 Killing the following PIDs: $PIDS"
  kill -9 $PIDS
  echo "✅ Killed processes using port $PORT."
fi

#Backup the log file
echo "Backup log"
mv /opt/sebadora/logs/sgf-web-$(date +"%Y%m%d").log /opt/sebadora/logs/sgf-web-$(date +"%Y%m%d-%H%M%S").log

# Start the app and save logs with timestamp
echo "Starting the sgf-web application  on port $PORT........"
yarn start > /opt/sebadora/logs/sgf-web-$(date +"%Y%m%d").log 2>&1 &

touch /opt/sebadora/logs/sgf-web-$(date +"%Y%m%d").log &
tail -f /opt/sebadora/logs/sgf-web-$(date +"%Y%m%d").log 2>&1 &

