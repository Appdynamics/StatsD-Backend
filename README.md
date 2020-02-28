# AppD-StatsD-Backend
StatsD Backend to push metrics to AppDynamics

This repository includes a Docker file to build a container for easy of testing of the StatsD, the Backend, and the AppDynamics Machine Agent.

# Clone this repository
git clone https://github.com/APPDRYDER/AppD-StatsD-Backend.git

# Clone statsd
git clone https://github.com/statsd/statsd.git

# Download AppDynamics Machine Agent

Download machineagent-bundle-64bit-linux-4.5.18.2430.zip in the directory Agents

From https://download.appdynamics.com/

# Configure AppDynamics Controller Environment Variables
Edit envvars.controller1.sh to align to an AppDynamcis Controller and Account

# Build the container
. envvars.sh

./docker-ctl.sh build

# Run the container
./docker-ctl run

This will start the Machine Agent, the StatsD daemon with the AppDynamics Backend, and the sample metrics load generator test1.py

Sample metrics will be pushed to statsd every second using test1.py. The AppDynamics Backend will push the metrics to the Machine Agent

# Bash into the container
./docker-ctl bash

# Review logs
tail -f logs/statsd.log

# Validate metrics in AppDynamics Contoller
Find the server appdstatsd1_doc in the Servers view to make sure the machine agent is working. In the Metics Browser look for metrics under: "Application Infrastructure Perforamnce | Root | Individual Nodes | appdstatsd1_doc"

# Stop the container
exit

./docker-ctl stop


