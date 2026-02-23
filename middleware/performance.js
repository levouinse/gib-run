module.exports = () => {
	const requestTimes = new Map();
	const slowRequests = [];
	const MAX_SLOW_REQUESTS = 50;
	const MAX_REQUEST_TIMES = 100;
	
	return (req, res, next) => {
		const start = Date.now();
		const url = req.url.substring(0, 100); // Limit URL length
		
		res.on('finish', () => {
			const duration = Date.now() - start;
			
			// LRU cache for request times
			if (requestTimes.size >= MAX_REQUEST_TIMES) {
				const firstKey = requestTimes.keys().next().value;
				requestTimes.delete(firstKey);
			}
			requestTimes.set(url, duration);
			
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
