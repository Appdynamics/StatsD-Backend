/*jshint node:true, laxcomma:true */
/*
	AppDynamics StatsD Backend
	Maintainer: David Ryder

	This StatsD backend pushes metrics to an AppDynamics Machine Agent HTTP Listener

	Configuration: See AppDynamics-Config.js
*/

var util = require('util'), http = require('http');

function AppDynamics(startupTime, config, emitter) {
	var self = this;
	this.count = 0;
	this.errors = 0;
	this.bytes = 0;
	this.lastBytes = 0;
	this.lastFlush = startupTime;
	this.lastException = startupTime;
	this.config = config.appdynamics || {};

	// Attach to StatsD events
	emitter.on('flush', function(timestamp, metrics) { self.flush(timestamp, metrics); });
	emitter.on('status', function(callback) { self.status(callback); });
}; // AppDynamics

AppDynamics.prototype.post = function(data) {
	var self = this;
	var agentConfig = this.config.agent;
	var debugConfig = this.config.debug;
	var dataStr = JSON.stringify(data);
	this.lastBytes = 0;
	if (debugConfig.showPost) {
		console.log(`postData${dataStr}`);
	}

	const options = {
		hostname: agentConfig.host,
		port: agentConfig.port,
		path: agentConfig.path,
		method: 'POST',
		headers: { 'Content-Type': 'application/json', 'Content-Length': dataStr.length }
	}; // const options

	if (debugConfig.postAgent) {
		const req = http.request(options, (res) => {
			if (debugConfig.showPost) {
				console.log(`statusCode[${res.statusCode}]`);
			}

			res.on('data', (d) => {
			  process.stdout.write(d)
			})
		})
		req.on('error', (error) => { this.lastBytes = 0; this.errors++; console.error(`post error[${error}]`); })
		req.write(dataStr)
		req.end();
	}
	this.lastBytes = dataStr.length;
	this.bytes += self.lastBytes;
}; // post

// AppDynamics aggregatorType
// How the metrics should be aggregated. Options are:
// AVERAGE: The average of all one-minute data points when adding it to the 10-minute or 60-minute granularity table.
// SUM: The sum of all one-minute data points when adding it to the 10-minute or 60-minute granularity table.
// OBSERVATION: Last reported one-minute data point in that 10-minute or 60-minute interval.
// https://docs.appdynamics.com/display/PROD/Standalone+Machine+Agent+HTTP+Listener
const aggType = { "OBS": "OBSERVATION", "AVG":  "AVERAGE", "SUM": "SUM" };

AppDynamics.prototype.showMetrics1 = function(tag, metricData) {
	Object.keys(metricData).forEach(function(k) {
				console.log(tag + ": " + k + "=" + metricData[k] + "-" + Object.keys(metricData[k]));
			});
};

AppDynamics.prototype.showMetrics2 = function(tag, metricData) {
	Object.keys(metricData).forEach(function(n) {
			Object.keys(metricData[n]).forEach(function(k) {
				console.log(tag + ": " + n + " " + k + "=" + metricData[n][k]);
			});
	});
};

// Application Infrastructure Performance|Root|Individual Nodes|<NODE_NAME>|Custom Metrics|<PREFIX>|<METRIC_NAME>|<OPT_MAME>
AppDynamics.prototype.makeMetric = function(name, optNames, value, aggType=aggType.OBS) {
	var mp = [ "Custom Metrics" , name.replace(/\./g,'|'), optNames ].join('|').replace(/\|\|/g,'|');
	return { "metricName": mp,
	 				 "aggregatorType": aggType, "value": value };
}; // makeMetric

AppDynamics.prototype.flush = function(timestamp, metrics) {
	var self = this;
	var counterData = metrics.counters || {};
	var gaugeData = metrics.gauges || {};
	var timersData = metrics.timers || {};
	var timerCountersData = metrics.timer_counters || {}
	var setsData = metrics.sets || {};
	var timerData = metrics.timer_data || {};
	var pctThreshold = metrics.pctThreshold;
	var statsdMetricsData = metrics.statsd_metrics || {};
	var metricsConfig = this.config.metrics;
	var debugConfig = this.config.debug;
	var data = [];
	this.count++;

	if (debugConfig.showMetrics) {
		Object.keys(metrics).forEach((v,i) =>
			console.log( `Metrics: [${v}]`));
	}

	// Counters
	if (metricsConfig.counters.show) {
		this.showMetrics1( "Counters", counterData );
	}
	if (metricsConfig.counters.process) {
		Object.keys(counterData).forEach((v,i) =>
			data.push( self.makeMetric(v, [], counterData[v], aggType.OBS)));
	}

	// Guages
	if (metricsConfig.gauges.show) {
		this.showMetrics1( "Guages", gaugeData );
	}
	if (metricsConfig.gauges.process) {
		Object.keys(gaugeData).forEach((v,i) =>
			data.push( self.makeMetric(v, [], gaugeData[v], aggType.OBS)));
	}

	// Timers (timer_data)
	if (metricsConfig.timers.show) {
		this.showMetrics2( "Timers", timerData );
	}
	if (metricsConfig.timers.process) {
		var timerkeys = metricsConfig.timers.keys;
		Object.keys(timerData).forEach(function(metricName) {
			timerkeys.forEach((timerKey,i) =>
				data.push( self.makeMetric( metricName, [ timerKey ], timerData[metricName][timerKey], aggType.OBS ) ) );
		});
	}

	// Sets
	if (metricsConfig.sets.show) {
		Object.keys(setsData).forEach(function(metricName) {
			console.log(metricName + " " +
						setsData[metricName].size() + " " +
						Object.keys(setsData[metricName]["store"]).join());
		});
	}
	if (metricsConfig.sets.process) {
		Object.keys(setsData).forEach(function(metricName) {
			data.push( self.makeMetric( metricName, [ "unique" ], setsData[metricName].size(), aggType.OBS ) );
		});
	}

	this.post(data);
	console.log(`AppDynamics post: ${this.count} ${this.lastBytes} ${this.bytes} ${this.errors}  `, new Date(timestamp * 1000).toString());
}; // flush

AppDynamics.prototype.status = function(write) {
	['lastFlush', 'lastException'].forEach(function(key) {
	    write(null, 'console', key, this[key]);
	}, this);
}; // status

Array.prototype.sum = Array.prototype.sum || function() {
  return this.reduce(function(sum, n) { return sum + Number(n) }, 0);
}

Array.prototype.average = Array.prototype.average || function() {
  return this.sum() / (this.length || 1);
}

exports.init = function(startupTime, config, events) {
	var instance = new AppDynamics(startupTime, config, events);
	return true;
};
