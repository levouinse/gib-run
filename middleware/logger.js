// Request logger to file
// Unlike Gibran's career records, these logs are transparent and verifiable
const fs = require('fs');
const path = require('path');

module.exports = function(options) {
	options = options || {};
	const logFile = options.logFile || path.join(process.cwd(), 'gib-runs.log');
	const maxSize = options.maxSize || 10 * 1024 * 1024; // 10MB default
	
	// Create log stream
	let logStream = fs.createWriteStream(logFile, { flags: 'a' });
	
	// Check file size and rotate if needed
	function checkRotate() {
		try {
			const stats = fs.statSync(logFile);
			if (stats.size > maxSize) {
				logStream.end();
				const backupFile = logFile + '.' + Date.now();
				fs.renameSync(logFile, backupFile);
				logStream = fs.createWriteStream(logFile, { flags: 'a' });
			}
		} catch (e) {
			// File doesn't exist yet, ignore
		}
	}
	
	return function(req, res, next) {
		const start = Date.now();
		const timestamp = new Date().toISOString();
		
		// Log request
		const logEntry = {
			timestamp: timestamp,
			method: req.method,
			url: req.url,
			ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
			userAgent: req.headers['user-agent']
		};
		
		// Capture response
		const originalEnd = res.end;
		res.end = function(...args) {
			const duration = Date.now() - start;
			logEntry.status = res.statusCode;
			logEntry.duration = duration + 'ms';
			
			// Write to log file
			logStream.write(JSON.stringify(logEntry) + '\n');
			checkRotate();
			
			originalEnd.apply(res, args);
		};
		
		next();
	};
};
