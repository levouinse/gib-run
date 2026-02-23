/**
 * Example Plugin: Performance Monitor
 * 
 * Monitors slow requests and logs warnings
 */

const chalk = require('chalk');

module.exports = {
	name: 'perf-monitor',
	version: '1.0.0',
	description: 'Monitor slow requests',
	
	onRequest(req, res, next) {
		const threshold = this.options.threshold || 100; // ms
		const start = Date.now();
		const originalEnd = res.end;
		
		res.end = function(...args) {
			const duration = Date.now() - start;
			
			if (duration > threshold) {
				console.log(
					chalk.yellow('⚠ SLOW REQUEST:'),
					chalk.white(req.url),
					chalk.red(`${duration}ms`),
					chalk.gray(`(threshold: ${threshold}ms)`)
				);
			}
			
			originalEnd.apply(res, args);
		};
		
		next();
	}
};

// Usage in .gib-runs.json:
// {
//   "plugins": [
//     ["./examples/plugin-perf-monitor.js", {
//       "threshold": 50
//     }]
//   ]
// }
