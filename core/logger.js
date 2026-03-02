const chalk = require('chalk');
const { getTimestamp } = require('../lib/utils');

const LogLevel = {
	SILENT: 0,
	ERROR: 1,
	WARN: 2,
	INFO: 3,
	DEBUG: 4,
	VERBOSE: 5
};

class Logger {
	constructor(level = LogLevel.INFO) {
		this.level = level;
	}
	
	setLevel(level) {
		this.level = typeof level === 'string' ? LogLevel[level.toUpperCase()] : level;
	}
	
	error(message, ...args) {
		if (this.level >= LogLevel.ERROR) {
			console.error(chalk.red(`[${getTimestamp()}] ERROR:`), message, ...args);
		}
	}
	
	warn(message, ...args) {
		if (this.level >= LogLevel.WARN) {
			console.warn(chalk.yellow(`[${getTimestamp()}] WARN:`), message, ...args);
		}
	}
	
	info(message, ...args) {
		if (this.level >= LogLevel.INFO) {
			console.log(chalk.cyan(`[${getTimestamp()}] INFO:`), message, ...args);
		}
	}
	
	debug(message, ...args) {
		if (this.level >= LogLevel.DEBUG) {
			console.log(chalk.gray(`[${getTimestamp()}] DEBUG:`), message, ...args);
		}
	}
	
	verbose(message, ...args) {
		if (this.level >= LogLevel.VERBOSE) {
			console.log(chalk.dim(`[${getTimestamp()}] VERBOSE:`), message, ...args);
		}
	}
	
	success(message, ...args) {
		if (this.level >= LogLevel.INFO) {
			console.log(chalk.green(`[${getTimestamp()}] SUCCESS:`), message, ...args);
		}
	}
	
	request(method, url, status, duration) {
		if (this.level >= LogLevel.INFO) {
			const methodColor = {
				GET: chalk.cyan,
				POST: chalk.green,
				PUT: chalk.yellow,
				DELETE: chalk.red,
				PATCH: chalk.magenta
			}[method] || chalk.white;
			
			const statusColor = status >= 500 ? chalk.red :
				status >= 400 ? chalk.yellow :
				status >= 300 ? chalk.cyan :
				chalk.green;
			
			console.log(
				chalk.gray(`[${getTimestamp()}]`),
				methodColor(method.padEnd(6)),
				chalk.white(url.padEnd(40).substring(0, 40)),
				statusColor(status.toString()),
				chalk.gray(`${duration}ms`)
			);
		}
	}
	
	fileChange(type, file) {
		if (this.level >= LogLevel.INFO) {
			const icons = {
				change: { icon: '🔄', color: chalk.cyan },
				add: { icon: '➕', color: chalk.green },
				unlink: { icon: '➖', color: chalk.red },
				css: { icon: '⚡', color: chalk.magenta }
			};
			
			const style = icons[type] || icons.change;
			console.log(
				chalk.gray(`[${getTimestamp()}]`),
				style.color(style.icon),
				style.color(type.toUpperCase()),
				chalk.gray(file)
			);
		}
	}
	
	box(title, lines, options = {}) {
		if (this.level < LogLevel.INFO) return;
		
		const width = options.width || 60;
		const border = options.border || '━';
		const color = options.color || chalk.cyan;
		
		console.log('\n' + color.bold(border.repeat(width)));
		if (title) {
			console.log(color.bold('  ' + title));
			console.log(color.bold(border.repeat(width)));
		}
		
		lines.forEach(line => {
			if (typeof line === 'string') {
				console.log('  ' + line);
			} else if (line.label && line.value) {
				console.log(chalk.white('  ' + line.label.padEnd(14)) + line.value);
			}
		});
		
		console.log(color.bold(border.repeat(width)) + '\n');
	}
}

// Singleton instance
const logger = new Logger();

module.exports = {
	Logger,
	LogLevel,
	logger
};
