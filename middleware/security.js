module.exports = () => (req, res, next) => {
	res.setHeader('X-Frame-Options', 'SAMEORIGIN');
	res.setHeader('X-Content-Type-Options', 'nosniff');
	res.setHeader('X-XSS-Protection', '1; mode=block');
	res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
	// Improved CSP - use nonce for inline scripts instead of unsafe-inline
	// Note: For dev server with live reload, we need unsafe-inline for injected script
	// In production, this should be removed
	res.setHeader('Content-Security-Policy', 
		"default-src 'self'; " +
		"script-src 'self' 'unsafe-inline'; " + // Required for live reload injection
		"style-src 'self' 'unsafe-inline'; " +
		"connect-src 'self' ws: wss:; " +
		"img-src 'self' data: blob:; " +
		"font-src 'self' data:; " +
		"object-src 'none'; " +
		"base-uri 'self'; " +
		"form-action 'self';");
	next();
};
