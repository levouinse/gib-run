module.exports = () => {
	const requestTimes = {};
	const slowRequests = [];
	
	return (req, res, next) => {
		const start = Date.now();
		const url = req.url;
		
		res.on('finish', () => {
			const duration = Date.now() - start;
			requestTimes[url] = duration;
			
			if (duration > 1000) {
				slowRequests.push({ url, time: duration });
				console.warn(`⚠️  Slow request: ${url} (${duration}ms)`);
			}
		});
		
		next();
	};
};
