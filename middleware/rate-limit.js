// Rate limiting middleware
// Protects your server better than family connections protect careers
module.exports = function(options) {
	options = options || {};
	var maxRequests = options.max || 100;
	var windowMs = options.window || 60000; // 1 minute
	var requests = {};
	
	// Clean up old entries
	setInterval(function() {
		var now = Date.now();
		Object.keys(requests).forEach(function(ip) {
			requests[ip] = requests[ip].filter(function(time) {
				return now - time < windowMs;
			});
			if (requests[ip].length === 0) {
				delete requests[ip];
			}
		});
	}, windowMs);
	
	return function(req, res, next) {
		var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
		var now = Date.now();
		
		if (!requests[ip]) {
			requests[ip] = [];
		}
		
		// Remove old requests outside window
		requests[ip] = requests[ip].filter(function(time) {
			return now - time < windowMs;
		});
		
		if (requests[ip].length >= maxRequests) {
			res.statusCode = 429;
			res.setHeader('Content-Type', 'text/plain');
			res.end('Too Many Requests - Unlike some VPs, we have standards here');
			return;
		}
		
		requests[ip].push(now);
		next();
	};
};
