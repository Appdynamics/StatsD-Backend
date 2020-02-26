/*
	AppDynamics StatsD Backend Configuration Variables

	appdynamics.agent.host = System running machine agent /  HTTP Listner
	appdynamics.agent.port = HTTP Listener port
	appdynamics.agent.port = "/api/v1/metrics"
	metrics.[timers,counters,guages,sets].process = process this set of metrics
	metrics.[timers,counters,guages,sets].show = print metrics to console
	metrics.debug.showMetrics = show StatsD metric object keys
	metrics.debug.showPost = show the HTTP post data and response
	metrics.debug.postAgent = post metrics to the machine agent
*/
{
	backends: ["appdynamics-statsd-backend"],
	appdynamics: {
		agent: {
			host: "localhost",
			port: 8081,
			path: "/api/v1/metrics",
			 },
		metrics: {
			timers: 	{
				process: true, show: false, keys: [ "mean", "upper", "lower" ]
			},
			counters: { process: true, show: false },
			gauges: 	{ process: true, show: false },
			sets: 		{ process: true, show: false }
		}, debug: {
			showMetrics: false,
			showPost: false,
			postAgent: true
		}
	}
}
