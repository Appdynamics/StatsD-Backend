# AppD-StatsD-Backend
StatsD Backend to push metrics to AppDynamics

For ease of testing, a Dockerfile is incuded that builds a container with StatsD, AppDynamics StatsD Backend, the AppDynamics Machine Agent and a load generator. Alterantivelty the AppDynamics StatsD Backend can be installed into an existing StatsD deployment.

# Clone this repository
`git clone https://github.com/Appdynamics/StatsD-Backend.git`

# Clone statsd
`git clone https://github.com/statsd/statsd.git`

Move the cloned `statsd` directory into the `StatsD-Backend` directory

`mv statsd/ StatsD-Backend/`

# Download AppDynamics Machine Agent

Download machineagent-bundle-64bit-linux-4.5.18.2430.zip in the directory Agents

From https://download.appdynamics.com/

# Configure AppDynamics Controller Environment Variables
Edit `envvars.appdynamics.sh` to align to an AppDynamcis Controller and Account

# Build the container
`. envvars.sh`

`./docker-ctl.sh build`

# Run the container
`./docker-ctl.sh run`

This will start the Machine Agent, the StatsD daemon with the AppDynamics Backend, and the sample metrics load generator test1.py

Sample metrics will be pushed to statsd every second using the metric generator test1.py. The AppDynamics Backend will push the metrics to the Machine Agent

# Bash into the container
`./docker-ctl.sh bash`

# Review logs
`tail -f logs/statsd.log`

# Validate metrics in AppDynamics Contoller
Find the server appdstatsd1_dock in the Servers view to make sure the machine agent is working. In the Metics Browser look for metrics under: "Application Infrastructure Perforamnce | Root | Individual Nodes | appdstatsd1_doc"

# Stop the container
`exit`

`./docker-ctl.sh stop`


