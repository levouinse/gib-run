const { spawn } = require('child_process');
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');
const { getTimestamp, createCleanupTimer, limitString } = require('./utils');

let activeProcess = null;
const processLogs = [];
const MAX_LOGS = 500;

// Periodic cleanup to prevent memory leak
createCleanupTimer(() => {
	if (processLogs.length > MAX_LOGS) {
		processLogs.splice(0, processLogs.length - MAX_LOGS);
	}
}, 300000); // 5 minutes

const logOutput = (type, output) => {
	// Limit output length to prevent memory bloat
	const trimmedOutput = limitString(output, 500);
	
	processLogs.push({
		timestamp: getTimestamp(),
		type,
		output: trimmedOutput
	});
	
	if (processLogs.length > MAX_LOGS) {
		processLogs.shift();
	}
};

const runNpmScript = (script, options = {}) => {
	const cwd = options.cwd || process.cwd();
	const packagePath = path.join(cwd, 'package.json');
	
	if (!fs.existsSync(packagePath)) {
		console.error(chalk.red('  ✖ package.json not found in: ') + cwd);
		return null;
	}
	
	try {
		const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
		if (!pkg.scripts || !pkg.scripts[script]) {
			console.error(chalk.red(`  ✖ Script "${script}" not found in package.json`));
			if (pkg.scripts) {
				console.log(chalk.yellow('  💡 Available scripts:'));
				Object.keys(pkg.scripts).forEach(s => {
					console.log(chalk.gray('     • ') + chalk.cyan(s) + chalk.gray(': ') + pkg.scripts[s]);
				});
			}
			return null;
		}
	} catch (e) {
		console.error(chalk.red('  ✖ Error reading package.json: ') + e.message);
		return null;
	}
	
	const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
	
	console.log(chalk.cyan(`  🚀 Starting npm script: ${script}`));
	
	const proc = spawn(npmCmd, ['run', script], {
		cwd,
		stdio: ['inherit', 'pipe', 'pipe'],
		shell: true
	});
	
	activeProcess = proc;
	
	proc.stdout.on('data', (data) => {
		const output = data.toString();
		logOutput('stdout', output);
		process.stdout.write(output);
	});
	
	proc.stderr.on('data', (data) => {
		const output = data.toString();
		const timestamp = getTimestamp();
		logOutput('stderr', output);
		console.error(chalk.red(`  [${timestamp}] STDERR: `) + output.trim());
	});
	
	proc.on('exit', (code, signal) => {
		const timestamp = getTimestamp();
		if (code !== null && code !== 0) {
			console.log(chalk.red(`\n  ✖ [${timestamp}] Process exited with code: ${code}`));
		}
		if (signal) {
			console.log(chalk.yellow(`  ⚠ [${timestamp}] Process killed with signal: ${signal}`));
		}
		activeProcess = null;
	});
	
	proc.on('error', (err) => {
		const timestamp = getTimestamp();
		console.error(chalk.red(`  ✖ [${timestamp}] Process error: ${err.message}`));
		activeProcess = null;
	});
	
	return proc;
};

const runWithPM2 = (script, options = {}) => {
	const cwd = options.cwd || process.cwd();
	const name = options.name || 'gib-runs-app';
	
	console.log(chalk.cyan.bold('  🚀 Starting with PM2: ') + chalk.yellow(script));
	console.log(chalk.gray('     App name: ') + chalk.white(name));
	console.log(chalk.gray('     Working directory: ') + chalk.white(cwd) + '\n');
	
	const pm2Cmd = process.platform === 'win32' ? 'pm2.cmd' : 'pm2';
	const checkPM2 = spawn(pm2Cmd, ['--version'], { stdio: 'pipe' });
	
	checkPM2.on('error', () => {
		console.error(chalk.red('  ✖ PM2 not installed'));
		console.log(chalk.yellow('  💡 Install: npm install -g pm2\n'));
	});
	
	checkPM2.on('exit', (code) => {
		if (code !== 0) {
			console.error(chalk.red('  ✖ PM2 not available'));
			return;
		}
		
		const args = ['start'];
		
		if (script.startsWith('npm ')) {
			args.push('npm', '--', 'run', script.replace(/^npm (run )?/, ''));
		} else {
			args.push(script);
		}
		
		args.push('--name', name, '--cwd', cwd);
		
		if (options.watch) args.push('--watch');
		
		const proc = spawn(pm2Cmd, args, {
			stdio: 'inherit',
			shell: true
		});
		
		proc.on('exit', (exitCode) => {
			if (exitCode === 0) {
				console.log(chalk.green('\n  ✓ PM2 process started successfully'));
				console.log(chalk.gray('  💡 View logs: ') + chalk.cyan(`pm2 logs ${name}`));
				console.log(chalk.gray('  💡 Stop: ') + chalk.cyan(`pm2 stop ${name}`));
				console.log(chalk.gray('  💡 Restart: ') + chalk.cyan(`pm2 restart ${name}`));
				console.log(chalk.gray('  💡 Delete: ') + chalk.cyan(`pm2 delete ${name}\n`));
			} else {
				console.error(chalk.red('\n  ✖ PM2 failed to start process'));
			}
		});
	});
};

const runCommand = (command, options = {}) => {
	const cwd = options.cwd || process.cwd();
	
	console.log(chalk.cyan(`  🚀 Starting command: ${command}`));
	
	const proc = spawn(command, {
		cwd,
		stdio: ['inherit', 'pipe', 'pipe'],
		shell: true
	});
	
	activeProcess = proc;
	
	proc.stdout.on('data', (data) => {
		const output = data.toString();
		logOutput('stdout', output);
		process.stdout.write(output);
	});
	
	proc.stderr.on('data', (data) => {
		const output = data.toString();
		const timestamp = getTimestamp();
		logOutput('stderr', output);
		console.error(chalk.red(`  [${timestamp}] STDERR: `) + output.trim());
	});
	
	proc.on('exit', (code, signal) => {
		const timestamp = getTimestamp();
		if (code !== null && code !== 0) {
			console.log(chalk.red(`\n  ✖ [${timestamp}] Command exited with code: ${code}`));
		}
		if (signal) {
			console.log(chalk.yellow(`  ⚠ [${timestamp}] Process killed with signal: ${signal}`));
		}
		activeProcess = null;
	});
	
	proc.on('error', (err) => {
		const timestamp = getTimestamp();
		console.error(chalk.red(`  ✖ [${timestamp}] Command error: ${err.message}`));
		activeProcess = null;
	});
	
	return proc;
};

const stopProcess = () => {
	if (activeProcess) {
		const timestamp = getTimestamp();
		console.log(chalk.yellow(`\n  ⚠ [${timestamp}] Stopping process...`));
		activeProcess.kill('SIGTERM');
		
		const killTimeout = setTimeout(() => {
			if (activeProcess) {
				const ts = getTimestamp();
				console.log(chalk.red(`  ✖ [${ts}] Force killing process...`));
				activeProcess.kill('SIGKILL');
			}
		}, 5000);
		
		// Clear timeout if process exits before 5 seconds
		if (activeProcess.once) {
			activeProcess.once('exit', () => {
				clearTimeout(killTimeout);
			});
		}
	}
};

const isRunning = () => activeProcess !== null;
const getLogs = (count = 100) => processLogs.slice(-count);

module.exports = {
	runNpmScript,
	runWithPM2,
	runCommand,
	stopProcess,
	isRunning,
	getLogs
};
