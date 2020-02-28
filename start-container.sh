#!/bin/bash
#
#

. envvars.appdynamics.sh >> envvars.log

export APPD_LOGS_DIR="$HOME/logs"
mkdir -p $APPD_LOGS_DIR

# Install and Start the AppDynamics Machine Agent
pkill -f ".*machineagent.jar"
HTTP_LISTENER_OPTS=" -Dmetric.http.listener=true -Dmetric.http.listener.port=8081 "
export APPD_MACHINE_AGENT_DIR="$HOME/Agents/macagent"
mkdir -p $APPD_MACHINE_AGENT_DIR
unzip -no $HOME/Agents/$APPDYNAMICS_MACHINE_AGENT_ZIP_FILE -d Agents/macagent
nohup ./$APPD_MACHINE_AGENT_DIR/bin/machine-agent $HTTP_LISTENER_OPTS  2>&1  > $APPD_LOGS_DIR/macagent.log &

# Install AppD-StatsD-Backend into statsd package
npm install . --verbose --prefix statsd/ 2>&1  > $APPD_LOGS_DIR/npminstall.log

# Start StatsD
nohup node statsd/stats.js AppDynamics-Config.js 2>&1 >> $APPD_LOGS_DIR/statsd.log  &

# Start the load generator of metrics into StatsD
nohup ./test1.py 2>&1 >> $APPD_LOGS_DIR/test1.log  &

# Hold container open
count=999999
interval=15
for i in $(seq $count )
do
  echo "$i `date`" >> /tmp/container.log
  sleep $interval;
done;
