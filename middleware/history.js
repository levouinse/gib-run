const chalk = require('chalk');

let requestHistory = [];
const maxHistory = 50;

module.exports = (options = {}) => {
	const showHistory = options.showHistory !== false;
	
	return (req, res, next) => {
		const start = Date.now();
		const timestamp = new Date().toISOString();
		
		const originalEnd = res.end;
		res.end = function(...args) {
			const duration = Date.now() - start;
			const entry = {
				timestamp,
				method: req.method,
				url: req.url,
				status: res.statusCode,
				duration: duration + 'ms',
				ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress
			};
			
			requestHistory.push(entry);
			if (requestHistory.length > maxHistory) {
				requestHistory.shift();
			}
			
			originalEnd.apply(res, args);
		};
		
		next();
	};
};

module.exports.getHistory = () => requestHistory;
module.exports.clearHistory = () => { requestHistory = []; };
