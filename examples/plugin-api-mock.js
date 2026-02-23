/**
 * Example Plugin: API Mock
 * 
 * Mock API endpoints with static JSON responses
 */

module.exports = {
	name: 'api-mock',
	version: '1.0.0',
	description: 'Mock API endpoints',
	
	onInit(server) {
		const mocks = this.options.mocks || {};
		
		Object.keys(mocks).forEach(route => {
			const response = mocks[route];
			
			server.use((req, res, next) => {
				if (req.url === route) {
					res.setHeader('Content-Type', 'application/json');
					res.setHeader('X-Mock', 'true');
					res.end(JSON.stringify(response, null, 2));
				} else {
					next();
				}
			});
		});
		
		if (server.logger) {
			server.logger.info(`API Mock: ${Object.keys(mocks).length} routes registered`);
		}
	}
};

// Usage in .gib-runs.json:
// {
//   "plugins": [
//     ["./examples/plugin-api-mock.js", {
//       "mocks": {
//         "/api/user": { "id": 1, "name": "John Doe" },
//         "/api/posts": [
//           { "id": 1, "title": "Hello World" },
//           { "id": 2, "title": "Plugin System" }
//         ]
//       }
//     }]
//   ]
// }
