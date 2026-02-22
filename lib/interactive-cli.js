const readline = require('readline');
const chalk = require('chalk');

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout
});

const question = (query) => {
	return new Promise((resolve) => {
		rl.question(query, resolve);
	});
};

const confirm = async (message, defaultValue = true) => {
	const defaultText = defaultValue ? 'Y/n' : 'y/N';
	const answer = await question(chalk.cyan(`  ${message} (${defaultText}): `));
	
	if (!answer) return defaultValue;
	
	return answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes';
};

const select = async (message, choices) => {
	console.log(chalk.cyan(`\n  ${message}`));
	
	choices.forEach((choice, index) => {
		const label = typeof choice === 'string' ? choice : choice.label;
		const hint = typeof choice === 'object' && choice.hint ? chalk.gray(` - ${choice.hint}`) : '';
		console.log(chalk.white(`  ${index + 1}) `) + chalk.yellow(label) + hint);
	});
	
	const answer = await question(chalk.cyan(`\n  Select (1-${choices.length}): `));
	const index = parseInt(answer, 10) - 1;
	
	if (index >= 0 && index < choices.length) {
		return typeof choices[index] === 'string' ? choices[index] : choices[index].value;
	}
	
	return null;
};

const input = async (message, defaultValue = '') => {
	const defaultText = defaultValue ? chalk.gray(` (${defaultValue})`) : '';
	const answer = await question(chalk.cyan(`  ${message}${defaultText}: `));
	
	return answer || defaultValue;
};

const multiSelect = async (message, choices) => {
	console.log(chalk.cyan(`\n  ${message}`));
	console.log(chalk.gray('  (Enter numbers separated by comma, e.g., 1,3,5)'));
	
	choices.forEach((choice, index) => {
		const label = typeof choice === 'string' ? choice : choice.label;
		const hint = typeof choice === 'object' && choice.hint ? chalk.gray(` - ${choice.hint}`) : '';
		console.log(chalk.white(`  ${index + 1}) `) + chalk.yellow(label) + hint);
	});
	
	const answer = await question(chalk.cyan(`\n  Select: `));
	
	if (!answer) return [];
	
	const indices = answer.split(',').map(s => parseInt(s.trim(), 10) - 1);
	const selected = [];
	
	indices.forEach(index => {
		if (index >= 0 && index < choices.length) {
			selected.push(typeof choices[index] === 'string' ? choices[index] : choices[index].value);
		}
	});
	
	return selected;
};

const password = async (message) => {
	// Simple password input (not hidden for compatibility)
	return await input(message);
};

const close = () => {
	rl.close();
};

const interactiveSetup = async () => {
	console.log(chalk.cyan.bold('\n  🚀 GIB-RUNS Interactive Setup'));
	console.log(chalk.cyan('━'.repeat(60)) + '\n');
	
	const config = {};
	
	// Port
	const portInput = await input('Port number', '8080');
	config.port = parseInt(portInput, 10) || 8080;
	
	// Host
	const hostChoices = [
		{ label: 'All interfaces (0.0.0.0)', value: '0.0.0.0', hint: 'Accessible from network' },
		{ label: 'Localhost only (127.0.0.1)', value: '127.0.0.1', hint: 'Local only' }
	];
	config.host = await select('Bind to', hostChoices);
	
	// SPA mode
	config.spa = await confirm('Enable SPA mode?', false);
	
	// CORS
	config.cors = await confirm('Enable CORS?', false);
	
	// Compression
	config.compression = await confirm('Enable compression?', true);
	
	// HTTPS
	const useHttps = await confirm('Enable HTTPS?', false);
	if (useHttps) {
		config.https = await input('HTTPS config file path', './https.conf.js');
	}
	
	// Open browser
	config.open = await confirm('Open browser on start?', true);
	
	// Log level
	const logChoices = [
		{ label: 'Quiet (errors only)', value: 0 },
		{ label: 'Normal', value: 1 },
		{ label: 'Verbose', value: 2 },
		{ label: 'Debug', value: 3 }
	];
	config.logLevel = await select('Log level', logChoices);
	
	// Advanced features
	const useAdvanced = await confirm('Configure advanced features?', false);
	
	if (useAdvanced) {
		// Tunnel
		config.tunnel = await confirm('Enable public tunnel?', false);
		
		if (config.tunnel) {
			const tunnelChoices = [
				{ label: 'LocalTunnel (no signup)', value: 'localtunnel' },
				{ label: 'Cloudflare (fast)', value: 'cloudflared' },
				{ label: 'Ngrok (requires token)', value: 'ngrok' }
			];
			config.tunnelService = await select('Tunnel service', tunnelChoices);
		}
		
		// Auto-restart
		config.autoRestart = await confirm('Enable auto-restart on crash?', false);
		
		// File upload
		config.enableUpload = await confirm('Enable file upload endpoint?', false);
		
		// Log to file
		config.logToFile = await confirm('Log requests to file?', false);
	}
	
	console.log(chalk.cyan('\n━'.repeat(60)));
	console.log(chalk.green('  ✓ Configuration complete!\n'));
	
	// Save config
	const saveConfig = await confirm('Save configuration to .gib-runs.json?', true);
	
	if (saveConfig) {
		const configManager = require('./config-manager');
		const saved = configManager.saveProjectConfig(config);
		
		if (saved) {
			console.log(chalk.green('  ✓ Configuration saved to .gib-runs.json\n'));
		}
	}
	
	close();
	
	return config;
};

module.exports = {
	question,
	confirm,
	select,
	input,
	multiSelect,
	password,
	close,
	interactiveSetup
};
