const { createCleanupTimer, createLRUCache } = require('../lib/utils');

module.exports = () => {
	const requestTimes = createLRUCache(100);
	const slowRequests = [];
	const MAX_SLOW_REQUESTS = 50;
	
	// FIX: Periodic cleanup to prevent memory leak
	createCleanupTimer(() => {
		const cutoff = Date.now() - 300000; // 5 minutes
		
		// Cleanup old slow requests
		const validSlowRequests = slowRequests.filter(req => 
			req.timestamp > cutoff
		);
		slowRequests.length = 0;
		slowRequests.push(...validSlowRequests);
	}, 300000);
	
	return (req, res, next) => {
		const start = Date.now();
		const url = req.url.substring(0, 100);
		
		res.on('finish', () => {
			const duration = Date.now() - start;
			
			// Store timestamp in LRU cache
			requestTimes.set(url, Date.now());
			
			// Track slow requests with limit
			if (duration > 1000) {
				slowRequests.push({ url, time: duration, timestamp: Date.now() });
				if (slowRequests.length > MAX_SLOW_REQUESTS) {
					slowRequests.shift();
				}
				console.warn(`⚠️  Slow request: ${url} (${duration}ms)`);
			}
		});
		
		next();
	};
};
