const chalk = require('chalk');

class GibRunsError extends Error {
	constructor(message, code, details = {}) {
		super(message);
		this.name = 'GibRunsError';
		this.code = code;
		this.details = details;
		this.timestamp = new Date().toISOString();
	}
}

const errorCodes = {
	PORT_IN_USE: 'PORT_IN_USE',
	CONFIG_INVALID: 'CONFIG_INVALID',
	FILE_NOT_FOUND: 'FILE_NOT_FOUND',
	PERMISSION_DENIED: 'PERMISSION_DENIED',
	NETWORK_ERROR: 'NETWORK_ERROR',
	PROCESS_ERROR: 'PROCESS_ERROR',
	WATCHER_ERROR: 'WATCHER_ERROR',
	TUNNEL_ERROR: 'TUNNEL_ERROR'
};

const errorMessages = {
	PORT_IN_USE: (port) => ({
		message: `Port ${port} is already in use`,
		solution: [
			`Try a different port: gib-runs --port=${port + 1}`,
			`Or let GIB-RUNS find one automatically (it will try next available port)`,
			`Check what's using the port: lsof -i :${port} (macOS/Linux) or netstat -ano | findstr :${port} (Windows)`
		]
	}),
	CONFIG_INVALID: (file) => ({
		message: `Invalid configuration in ${file}`,
		solution: [
			'Check JSON syntax (missing commas, quotes, brackets)',
			'Validate with: cat .gib-runs.json | jq',
			'Generate new config: gib-runs --generate-config'
		]
	}),
	FILE_NOT_FOUND: (file) => ({
		message: `File or directory not found: ${file}`,
		solution: [
			'Check the path is correct',
			'Use absolute path or path relative to current directory',
			'List files: ls -la (macOS/Linux) or dir (Windows)'
		]
	}),
	PERMISSION_DENIED: (resource) => ({
		message: `Permission denied: ${resource}`,
		solution: [
			'Check file/directory permissions',
			'Try running with appropriate permissions',
			'On Linux/macOS: chmod +r <file> or sudo if needed'
		]
	}),
	NETWORK_ERROR: (details) => ({
		message: `Network error: ${details}`,
		solution: [
			'Check your internet connection',
			'Verify firewall settings',
			'Try again in a few moments'
		]
	}),
	PROCESS_ERROR: (cmd) => ({
		message: `Failed to run command: ${cmd}`,
		solution: [
			'Check if the command exists: which <command> (macOS/Linux) or where <command> (Windows)',
			'Verify package.json scripts are correct',
			'Install missing dependencies: npm install'
		]
	}),
	WATCHER_ERROR: () => ({
		message: 'File watcher error (too many files)',
		solution: [
			'Increase file watcher limit (Linux):',
			'  echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf',
			'  sudo sysctl -p',
			'Or use --ignore to exclude large directories like node_modules'
		]
	}),
	TUNNEL_ERROR: (service) => ({
		message: `Tunnel service failed: ${service}`,
		solution: [
			'Check your internet connection',
			`Verify ${service} is installed and accessible`,
			'Try alternative tunnel service: --tunnel-service=cloudflared',
			'Or use local network URLs instead'
		]
	})
};

const handleError = (error, logLevel = 2) => {
	if (logLevel === 0) return;
	
	console.error('\n' + chalk.red.bold('━'.repeat(60)));
	console.error(chalk.red.bold('  ✖ ERROR'));
	console.error(chalk.red.bold('━'.repeat(60)));
	
	if (error instanceof GibRunsError) {
		console.error(chalk.white('  Message: ') + chalk.red(error.message));
		console.error(chalk.white('  Code:    ') + chalk.yellow(error.code));
		
		if (error.details && Object.keys(error.details).length > 0) {
			console.error(chalk.white('  Details: '));
			Object.keys(error.details).forEach(key => {
				console.error(chalk.gray(`    ${key}: `) + chalk.white(error.details[key]));
			});
		}
		
		const errorInfo = errorMessages[error.code];
		if (errorInfo) {
			const info = typeof errorInfo === 'function' ? errorInfo(error.details.value) : errorInfo;
			
			if (info.solution && info.solution.length > 0) {
				console.error(chalk.cyan('\n  💡 Solutions:'));
				info.solution.forEach((sol, i) => {
					console.error(chalk.gray(`    ${i + 1}. `) + chalk.white(sol));
				});
			}
		}
	} else {
		console.error(chalk.white('  Message: ') + chalk.red(error.message));
		
		if (logLevel >= 3 && error.stack) {
			console.error(chalk.gray('\n  Stack trace:'));
			console.error(chalk.gray(error.stack));
		}
	}
	
	console.error(chalk.red.bold('━'.repeat(60)) + '\n');
};

const createError = (code, details) => {
	const errorInfo = errorMessages[code];
	if (!errorInfo) {
		return new GibRunsError('Unknown error', code, details);
	}
	
	const info = typeof errorInfo === 'function' ? errorInfo(details.value) : errorInfo;
	return new GibRunsError(info.message, code, details);
};

const wrapAsync = (fn) => {
	return (...args) => {
		try {
			const result = fn(...args);
			if (result && typeof result.catch === 'function') {
				return result.catch(err => {
					handleError(err);
					process.exit(1);
				});
			}
			return result;
		} catch (err) {
			handleError(err);
			process.exit(1);
		}
	};
};

const gracefulShutdown = (server, watcher, processRunner, tunnel, logLevel = 2) => {
	let isShuttingDown = false;
	
	const shutdown = (signal) => {
		if (isShuttingDown) return;
		isShuttingDown = true;
		
		if (logLevel >= 1) {
			console.log(chalk.yellow(`\n  ⚠ Received ${signal}, shutting down gracefully...`));
		}
		
		const shutdownTimeout = setTimeout(() => {
			console.error(chalk.red('  ✖ Forced shutdown after timeout'));
			process.exit(1);
		}, 10000);
		
		Promise.all([
			processRunner && processRunner.isRunning() ? 
				new Promise(resolve => {
					processRunner.stopProcess();
					setTimeout(resolve, 1000);
				}) : Promise.resolve(),
			
			tunnel ? 
				new Promise(resolve => {
					tunnel.stop();
					resolve();
				}) : Promise.resolve(),
			
			watcher ? 
				new Promise(resolve => {
					watcher.close();
					resolve();
				}) : Promise.resolve(),
			
			server ? 
				new Promise(resolve => {
					server.close(() => resolve());
				}) : Promise.resolve()
		]).then(() => {
			clearTimeout(shutdownTimeout);
			if (logLevel >= 1) {
				console.log(chalk.green('  ✓ Shutdown complete\n'));
			}
			process.exit(0);
		}).catch(err => {
			clearTimeout(shutdownTimeout);
			console.error(chalk.red('  ✖ Error during shutdown:'), err.message);
			process.exit(1);
		});
	};
	
	process.on('SIGTERM', () => shutdown('SIGTERM'));
	process.on('SIGINT', () => shutdown('SIGINT'));
	process.on('uncaughtException', (err) => {
		console.error(chalk.red('\n  ✖ Uncaught Exception:'));
		handleError(err, logLevel);
		shutdown('uncaughtException');
	});
	process.on('unhandledRejection', (reason, promise) => {
		console.error(chalk.red('\n  ✖ Unhandled Rejection at:'), promise);
		console.error(chalk.red('  Reason:'), reason);
		if (logLevel >= 2) {
			shutdown('unhandledRejection');
		}
	});
};

const getExitCode = (error) => {
	if (!error) return 0;
	
	const exitCodes = {
		PORT_IN_USE: 1,
		CONFIG_INVALID: 2,
		FILE_NOT_FOUND: 3,
		PERMISSION_DENIED: 4,
		NETWORK_ERROR: 5,
		PROCESS_ERROR: 6,
		WATCHER_ERROR: 7,
		TUNNEL_ERROR: 8
	};
	
	return exitCodes[error.code] || 1;
};

module.exports = {
	GibRunsError,
	errorCodes,
	errorMessages,
	handleError,
	createError,
	wrapAsync,
	gracefulShutdown,
	getExitCode
};
