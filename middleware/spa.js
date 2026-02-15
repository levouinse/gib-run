module.exports = (req, res, next) => {
	if (req.method !== 'GET' && req.method !== 'HEAD') return next();
	
	if (req.url !== '/') {
		const route = req.url;
		req.url = '/';
		res.statusCode = 302;
		res.setHeader('Location', req.url + '#' + route);
		res.end();
	} else {
		next();
	}
};
