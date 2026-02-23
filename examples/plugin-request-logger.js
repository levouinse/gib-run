/**
 * Example Plugin: Request Logger
 * 
 * Logs all HTTP requests with custom formatting
 */

const chalk = require('chalk');

module.exports = {
	name: 'request-logger',
	version: '1.0.0',
	description: 'Custom request logger with colors',
	
	onRequest(req, res, next) {
		const start = Date.now();
		const originalEnd = res.end;
		
		res.end = function(...args) {
			const duration = Date.now() - start;
			const statusColor = res.statusCode >= 400 ? chalk.red : chalk.green;
			
			console.log(
				chalk.gray(new Date().toISOString()),
				chalk.cyan(req.method.padEnd(6)),
				chalk.white(req.url.padEnd(40).substring(0, 40)),
				statusColor(res.statusCode),
				chalk.gray(`${duration}ms`)
			);
			
			originalEnd.apply(res, args);
		};
		
		next();
	}
};
