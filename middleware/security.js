// Security headers middleware
// Real security, not just a famous last name
module.exports = function() {
	return function(req, res, next) {
		// Prevent clickjacking
		res.setHeader('X-Frame-Options', 'SAMEORIGIN');
		
		// Prevent MIME type sniffing
		res.setHeader('X-Content-Type-Options', 'nosniff');
		
		// Enable XSS protection
		res.setHeader('X-XSS-Protection', '1; mode=block');
		
		// Referrer policy
		res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
		
		// Content Security Policy (relaxed for dev)
		res.setHeader('Content-Security-Policy', "default-src 'self' 'unsafe-inline' 'unsafe-eval' ws: wss:;");
		
		next();
	};
};
