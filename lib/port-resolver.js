const net = require('net');
const chalk = require('chalk');

const isPortAvailable = (port, host = '0.0.0.0') => {
	return new Promise((resolve) => {
		const server = net.createServer();
		
		server.once('error', (err) => {
			if (err.code === 'EADDRINUSE') {
				resolve(false);
			} else {
				resolve(false);
			}
		});
		
		server.once('listening', () => {
			server.close();
			resolve(true);
		});
		
		server.listen(port, host);
	});
};

const findAvailablePort = async (startPort, host = '0.0.0.0', maxAttempts = 10) => {
	let port = startPort;
	
	for (let i = 0; i < maxAttempts; i++) {
		const available = await isPortAvailable(port, host);
		if (available) {
			return port;
		}
		port++;
	}
	
	return null;
};

const resolvePortConflict = async (port, host = '0.0.0.0', logLevel = 2) => {
	const available = await isPortAvailable(port, host);
	
	if (available) {
		return port;
	}
	
	if (logLevel >= 1) {
		console.log(chalk.yellow(`  ⚠ Port ${port} is already in use`));
		console.log(chalk.cyan('  🔍 Searching for available port...'));
	}
	
	const newPort = await findAvailablePort(port + 1, host);
	
	if (newPort) {
		if (logLevel >= 1) {
			console.log(chalk.green(`  ✓ Found available port: ${newPort}\n`));
		}
		return newPort;
	}
	
	if (logLevel >= 1) {
		console.error(chalk.red('  ✖ Could not find available port'));
	}
	
	return null;
};

const getProcessOnPort = () => {
	// This is platform-specific and requires additional implementation
	// For now, just return null
	return null;
};

module.exports = {
	isPortAvailable,
	findAvailablePort,
	resolvePortConflict,
	getProcessOnPort
};
