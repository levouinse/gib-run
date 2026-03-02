module.exports = (options = {}) => {
	const maxRequests = options.max || 100;
	const windowMs = options.window || 60000;
	const trustProxy = options.trustProxy || false; // Only trust x-forwarded-for if explicitly enabled
	const requests = {};
	
	// FIX: Proper cleanup with unref to prevent blocking exit
	const cleanupInterval = setInterval(() => {
		const now = Date.now();
		Object.keys(requests).forEach(ip => {
			requests[ip] = requests[ip].filter(time => now - time < windowMs);
			if (requests[ip].length === 0) delete requests[ip];
		});
	}, windowMs);
	
	// Cleanup on process exit
	if (cleanupInterval.unref) cleanupInterval.unref();
	
	return (req, res, next) => {
		// FIX: Only use x-forwarded-for if trustProxy is enabled to prevent IP spoofing
		const ip = (trustProxy && req.headers['x-forwarded-for'] 
			? req.headers['x-forwarded-for'].split(',')[0].trim() 
			: req.connection.remoteAddress || req.socket.remoteAddress || ''
		).substring(0, 45); // Limit IP length
		
		const now = Date.now();
		
		if (!requests[ip]) requests[ip] = [];
		
		requests[ip] = requests[ip].filter(time => now - time < windowMs);
		
		if (requests[ip].length >= maxRequests) {
			res.statusCode = 429;
			res.setHeader('Content-Type', 'text/plain');
			res.setHeader('Retry-After', Math.ceil(windowMs / 1000));
			res.end('Too Many Requests - Unlike some VPs, we have standards here');
			return;
		}
		
		requests[ip].push(now);
		next();
	};
};
