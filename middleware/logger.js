const fs = require('fs');
const path = require('path');

module.exports = (options = {}) => {
	const logFile = options.logFile || path.join(process.cwd(), 'gib-runs.log');
	const maxSize = options.maxSize || 10 * 1024 * 1024;
	
	let logStream = fs.createWriteStream(logFile, { flags: 'a' });
	let lastRotateCheck = 0;
	const rotateCheckInterval = 60000; // Check rotation every 60s max
	
	const checkRotate = () => {
		const now = Date.now();
		if (now - lastRotateCheck < rotateCheckInterval) return;
		lastRotateCheck = now;
		
		try {
			const stats = fs.statSync(logFile);
			if (stats.size > maxSize) {
				logStream.end();
				fs.renameSync(logFile, logFile + '.' + now);
				logStream = fs.createWriteStream(logFile, { flags: 'a' });
			}
		} catch (e) {}
	};
	
	return (req, res, next) => {
		const start = Date.now();
		const logEntry = {
			timestamp: new Date().toISOString(),
			method: req.method,
			url: req.url,
			ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
			userAgent: req.headers['user-agent']
		};
		
		const originalEnd = res.end;
		res.end = function(...args) {
			logEntry.status = res.statusCode;
			logEntry.duration = (Date.now() - start) + 'ms';
			logStream.write(JSON.stringify(logEntry) + '\n');
			checkRotate();
			originalEnd.apply(res, args);
		};
		
		next();
	};
};
