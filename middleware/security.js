module.exports = () => (req, res, next) => {
	res.setHeader('X-Frame-Options', 'SAMEORIGIN');
	res.setHeader('X-Content-Type-Options', 'nosniff');
	res.setHeader('X-XSS-Protection', '1; mode=block');
	res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
	// FIX: More restrictive CSP (only allow unsafe-inline for injected reload script)
	res.setHeader('Content-Security-Policy', 
		"default-src 'self'; " +
		"script-src 'self' 'unsafe-inline'; " +
		"style-src 'self' 'unsafe-inline'; " +
		"connect-src 'self' ws: wss:; " +
		"img-src 'self' data: blob:; " +
		"font-src 'self' data:;");
	next();
};
