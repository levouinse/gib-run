const MAX_HISTORY = 50;

// Use WeakMap to prevent memory leaks
const requestHistory = [];

module.exports = {
	name: 'history',
	version: '1.0.0',
	description: 'Request history tracking at /history',
	
	onRequest(req, res, next) {
		if (req.url === '/history') {
			res.setHeader('Content-Type', 'application/json');
			res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
			res.end(JSON.stringify({
				total: requestHistory.length,
				max: MAX_HISTORY,
				requests: requestHistory
			}, null, 2));
			return;
		}
		
		const startTime = Date.now();
		const originalEnd = res.end;
		
		res.end = function(...args) {
			const duration = Date.now() - startTime;
			
			// Only store essential data to prevent memory bloat
			requestHistory.push({
				timestamp: new Date().toISOString(),
				method: req.method,
				url: req.url.substring(0, 100), // Limit URL length
				status: res.statusCode,
				duration: `${duration}ms`,
				ip: (req.headers['x-forwarded-for'] || req.connection.remoteAddress || '').substring(0, 45)
			});
			
			// Maintain fixed size array
			if (requestHistory.length > MAX_HISTORY) {
				requestHistory.shift();
			}
			
			originalEnd.apply(res, args);
		};
		
		next();
	}
};
