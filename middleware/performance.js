// Performance monitoring middleware
// Unlike Gibran's career, these metrics are real
module.exports = function() {
	var requestTimes = {};
	var slowRequests = [];
	
	return function(req, res, next) {
		var start = Date.now();
		var url = req.url;
		
		// Track response time
		res.on('finish', function() {
			var duration = Date.now() - start;
			requestTimes[url] = duration;
			
			// Log slow requests (>1s)
			if (duration > 1000) {
				slowRequests.push({ url: url, time: duration });
				console.warn('⚠️  Slow request:', url, '(' + duration + 'ms)');
			}
		});
		
		next();
	};
};
