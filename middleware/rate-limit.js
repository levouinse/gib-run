module.exports = (options = {}) => {
	const maxRequests = options.max || 100;
	const windowMs = options.window || 60000;
	const requests = {};
	
	setInterval(() => {
		const now = Date.now();
		Object.keys(requests).forEach(ip => {
			requests[ip] = requests[ip].filter(time => now - time < windowMs);
			if (requests[ip].length === 0) delete requests[ip];
		});
	}, windowMs);
	
	return (req, res, next) => {
		const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
		const now = Date.now();
		
		if (!requests[ip]) requests[ip] = [];
		
		requests[ip] = requests[ip].filter(time => now - time < windowMs);
		
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
